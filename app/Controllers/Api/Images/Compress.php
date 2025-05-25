<?php

namespace App\Controllers\Api\Images;

class Compress
{
    private const MAX_REDIRECTS = 3;
    private const CACHE_DIR = '/cdn/imgcache/';
    private const MAX_CACHE_AGE = 2592000;
    private const DEFAULT_QUALITY = 20;
    private const ALLOWED_DOMAINS = NGALLERY['root']['alloweddomains'];
    private const CSP_HEADER = "default-src 'none'; img-src 'self' data:;";

    private $sourceUrl;
    private $quality;
    private $width;
    private $height;
    private $cachePath;
    private $config = [
        'faceDetection' => false,
        'stripMeta' => true,
        'bulkMode' => false,
        'webhook' => null,
        'resizePercentage' => 35,
    ];

    public function __construct()
    {
        header("Content-Security-Policy: " . self::CSP_HEADER);
        try {
            $this->validateRequest();
            $this->processRequest();
        } catch (\Exception $e) {
            $this->handleError($e);
        }
    }

    private function validateRequest(): void
    {
        $params = $_GET;
        unset($params['sig']);

        ksort($params);

        $this->sourceUrl = $_GET['url'] ?? '';
        $this->quality = $this->getQualityParam();
        $this->width = (int)($_GET['width'] ?? 0);
        $this->height = (int)($_GET['height'] ?? 0);

        $parsed = parse_url($this->sourceUrl);
        $docRoot = realpath($_SERVER['DOCUMENT_ROOT']);

        if (!isset($parsed['scheme'])) {
            $sourcePath = ltrim($parsed['path'] ?? '', '/');
            $localFullPath = realpath($docRoot . '/' . $sourcePath);

            if (!$localFullPath || !is_file($localFullPath)) {
                throw new \RuntimeException('Local file not found', 404);
            }

            if (strpos($localFullPath, $docRoot) !== 0) {
                throw new \RuntimeException('Access denied', 403);
            }

            $this->sourceUrl = $localFullPath;
        } elseif (!in_array($parsed['host'], self::ALLOWED_DOMAINS)) {
            throw new \DomainException('Domain not allowed', 403);
        }
    }

    private function getQualityParam(): int
    {
        $quality = (int)($_GET['quality'] ?? self::DEFAULT_QUALITY);

        if (isset($_SERVER['HTTP_SAVE_DATA']) && $_SERVER['HTTP_SAVE_DATA'] === 'on') {
            $quality = max(30, $quality - 20);
        }

        return min(95, max(10, $quality));
    }

    private function processRequest(): void
    {
        if ($this->config['bulkMode']) {
            $this->processBulk();
            return;
        }

        $this->generateCachePath();

        if ($this->serveFromCache()) {
            return;
        }

        $imageData = $this->fetchImage();
        $processed = $this->processImage($imageData);

        $this->saveToCache($processed);
        $this->sendResponse($processed);

        if ($this->config['webhook']) {
            $this->callWebhook(strlen($imageData), strlen($processed));
        }
    }

    private function generateCachePath(): void
    {
        $params = [
            'url' => $this->sourceUrl,
            'q' => $this->quality,
            'w' => $this->width,
            'h' => $this->height,
            'strip' => $this->config['stripMeta'],
            'resizePct' => $this->config['resizePercentage'],
        ];

        $hash = md5(serialize($params));
        $subdir = substr($hash, 0, 2);
        $this->cachePath = $_SERVER['DOCUMENT_ROOT'] . self::CACHE_DIR . $subdir . '/' . $hash . '.jpg';
    }

    private function serveFromCache(): bool
    {
        if (file_exists($this->cachePath)) {
            $lastModified = filemtime($this->cachePath);

            if (time() - $lastModified < self::MAX_CACHE_AGE) {
                header('Content-Type: image/jpeg');
                header('Content-Length: ' . filesize($this->cachePath));
                header('Cache-Control: max-age=' . self::MAX_CACHE_AGE);
                readfile($this->cachePath);
                return true;
            }

            unlink($this->cachePath);
        }
        return false;
    }

    private function saveToCache(string $data): void
    {
        $dir = dirname($this->cachePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $tempFile = tempnam($dir, 'tmp_');
        if (file_put_contents($tempFile, $data)) {
            rename($tempFile, $this->cachePath);
        } else {
            unlink($tempFile);
            throw new \RuntimeException('Failed to save cache');
        }
    }


    private function fetchImage(): string
    {
        // Для локальных файлов
        if ($this->isLocalFile()) {
            $data = file_get_contents($this->sourceUrl);

            if ($data === false) {
                throw new \RuntimeException('Failed to read local file', 500);
            }

            return $data;
        }

        // Для удаленных URL
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->sourceUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => self::MAX_REDIRECTS,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        $data = curl_exec($ch);

        if (curl_errno($ch)) {
            throw new \RuntimeException('Fetch failed: ' . curl_error($ch), 500);
        }

        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($status !== 200) {
            throw new \RuntimeException("HTTP error $status", $status);
        }

        curl_close($ch);
        return $data;
    }

    private function isLocalFile(): bool
    {
        return is_string($this->sourceUrl)
            && strpos($this->sourceUrl, '://') === false
            && file_exists($this->sourceUrl);
    }

    private function processImage(string $imageData): string
    {
        $isJpeg = $this->isJpeg($imageData);
        $noChanges = $this->quality === 100
            && $this->width === 0
            && $this->height === 0
            && !$this->config['stripMeta'];
        $isLocal = $this->isLocalFile();

        if ($isJpeg && $noChanges && !$isLocal) {
            return $imageData;
        }

        $image = @imagecreatefromstring($imageData);
        if ($image === false) {
            throw new \RuntimeException('Unsupported image format', 400);
        }

        if ($isJpeg) {
            $image = $this->fixImageOrientation($image, $imageData);
        }

        // Расчет размеров с учетом процента
        $targetWidth = $this->width;
        $targetHeight = $this->height;

        if ($this->config['resizePercentage'] && $targetWidth === 0 && $targetHeight === 0) {
            $origWidth = imagesx($image);
            $origHeight = imagesy($image);

            $ratio = $this->config['resizePercentage'] / 100;
            $targetWidth = round($origWidth * $ratio);
            $targetHeight = round($origHeight * $ratio);
        }

        if ($targetWidth > 0 || $targetHeight > 0) {
            $image = $this->resizeImage($image, $targetWidth, $targetHeight);
        }

        if ($this->config['stripMeta']) {
            $this->stripMetadata($image);
        }

        if (!imageistruecolor($image)) {
            $tmp = imagecreatetruecolor(imagesx($image), imagesy($image));
            imagecopy($tmp, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
            imagedestroy($image);
            $image = $tmp;
        }

        ob_start();
        imageinterlace($image, true);
        imagejpeg($image, null, $this->quality);
        $result = ob_get_clean();
        imagedestroy($image);

        return $result;
    }

    private function isJpeg(string $data): bool
    {
        return bin2hex(substr($data, 0, 2)) === 'ffd8';
    }

    private function fixImageOrientation($image, string $imageData)
    {
        try {
            $exif = @exif_read_data('data://image/jpeg;base64,' . base64_encode($imageData));
        } catch (\Exception $e) {
            return $image;
        }

        if (!empty($exif['Orientation'])) {
            switch ($exif['Orientation']) {
                case 3:
                    $image = imagerotate($image, 180, 0);
                    break;
                case 6:
                    $image = imagerotate($image, -90, 0);
                    break;
                case 8:
                    $image = imagerotate($image, 90, 0);
                    break;
            }
        }

        return $image;
    }

    private function resizeImage($image, int $targetWidth, int $targetHeight)
    {
        $origWidth = imagesx($image);
        $origHeight = imagesy($image);

        if ($targetWidth > 0 && $targetHeight === 0) {
            $targetHeight = round($origHeight * ($targetWidth / $origWidth));
        } elseif ($targetHeight > 0 && $targetWidth === 0) {
            $targetWidth = round($origWidth * ($targetHeight / $origHeight));
        }

        $resized = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagecopyresampled(
            $resized,
            $image,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $origWidth,
            $origHeight
        );
        imagedestroy($image);

        return $resized;
    }



    private function stripMetadata(&$image): void
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $clean = imagecreatetruecolor($width, $height);

        imagealphablending($clean, false);
        imagesavealpha($clean, true);
        $transparent = imagecolorallocatealpha($clean, 0, 0, 0, 127);
        imagefill($clean, 0, 0, $transparent);

        imagecopy($clean, $image, 0, 0, 0, 0, $width, $height);
        imagedestroy($image);
        $image = $clean;
    }

    private function processBulk(): void
    {
        $jobs = json_decode(file_get_contents('php://input'), true);
        $results = [];

        foreach ($jobs as $job) {
            try {
                $this->sourceUrl = $job['url'];
                $this->quality = $job['quality'] ?? $this->quality;

                $imageData = $this->fetchImage();
                $processed = $this->processImage($imageData);

                $results[] = [
                    'url' => $job['url'],
                    'status' => 'success',
                    'size' => strlen($processed),
                    'data' => base64_encode($processed)
                ];
            } catch (\Exception $e) {
                $results[] = [
                    'url' => $job['url'],
                    'status' => 'error',
                    'message' => $e->getMessage()
                ];
            }
        }

        header('Content-Type: application/json');
        echo json_encode($results);
        exit;
    }

    private function sendResponse(string $imageData): void
    {
        header('Content-Type: image/jpeg');
        header('Content-Length: ' . strlen($imageData));
        header('Cache-Control: max-age=' . self::MAX_CACHE_AGE);
        echo $imageData;
    }

    private function callWebhook(int $origSize, int $processedSize): void
    {
        $payload = [
            'url' => $this->sourceUrl,
            'originalSize' => $origSize,
            'processedSize' => $processedSize,
            'timestamp' => time()
        ];

        $ch = curl_init($this->config['webhook']);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 2,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode($payload)
        ]);
        curl_exec($ch);
        curl_close($ch);
    }

    private function handleError(\Exception $e): void
    {
        $code = $e->getCode() >= 400 ? $e->getCode() : 500;
        http_response_code($code);

        if ($this->config['bulkMode']) {
            header('Content-Type: application/json');
            echo json_encode([
                'error' => $e->getMessage(),
                'code' => $code
            ]);
        } else {
            $brokenImgPath = $_SERVER['DOCUMENT_ROOT'] . '/static/img/brokenimg.png';
            if (file_exists($brokenImgPath) && is_file($brokenImgPath)) {
                header('Content-Type: image/png');
                header('Cache-Control: no-store');
                readfile($brokenImgPath);
            } else {
                header('Content-Type: text/plain');
                echo "Error $code: " . $e->getMessage() . " (Fallback image not found)";
            }
        }

        exit;
    }
}
