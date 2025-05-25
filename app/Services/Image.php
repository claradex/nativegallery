<?php

namespace App\Services;

use Exception;
use GdImage;

class Image
{
    private const CACHE_DIR = __DIR__ . '/../../cdn/';
    private const LOCK_DIR = __DIR__ . '/../../storage/locks/';
    private const QUEUE_FILE = __DIR__ . '/../../storage/queue/image_processing.queue';
    private const MAX_FILE_SIZE = 5242880; // 5MB

    public static function generateBlurredPlaceholder(string $imageUrl, int $quality = 30): string
    {
        try {
            self::checkDirectories();
            $cacheFile = self::CACHE_DIR . md5($imageUrl) . '.jpg';

            if (self::isValidCache($cacheFile)) {
                return self::getCachedImage($cacheFile);
            }

            if (!self::isProcessing($imageUrl)) {
                self::addToQueue($imageUrl, $quality);
                error_log("Added to queue: " . $imageUrl);
            }

            return self::getTransparentPixel();
        } catch (Exception $e) {
            error_log("Error in generateBlurredPlaceholder: " . $e->getMessage());
            return self::getTransparentPixel();
        }
    }

    private static function checkDirectories(): void
    {
        try {
            $dirs = [
                self::CACHE_DIR,
                self::LOCK_DIR,
                dirname(self::QUEUE_FILE)
            ];

            foreach ($dirs as $dir) {
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                    error_log("Created directory: $dir");
                }

                // Проверяем права записи
                if (!is_writable($dir)) {
                    throw new Exception("Directory not writable: $dir");
                }
            }

            // Создаем файл очереди
            if (!file_exists(self::QUEUE_FILE)) {
                touch(self::QUEUE_FILE);
                chmod(self::QUEUE_FILE, 0666);
                error_log("Created queue file: " . self::QUEUE_FILE);
            }
        } catch (Exception $e) {
            error_log("Directory error: " . $e->getMessage());
            throw $e;
        }
    }


    public static function processQueue(): void
    {
        self::checkDirectories();
        if (!file_exists(self::QUEUE_FILE)) {
            return;
        }

        $queue = file(self::QUEUE_FILE, FILE_IGNORE_NEW_LINES);
        foreach ($queue as $line) {
            try {
                [$hash, $data] = explode('|', $line, 2);
                $task = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
                self::processImageTask($task['url'], $task['quality']);
                self::removeFromQueue($hash);
            } catch (Exception $e) {
                error_log('Queue processing error: ' . $e->getMessage());
            }
        }
    }

    private static function processImageTask(string $imageUrl, int $quality): void
    {
        $cacheFile = self::CACHE_DIR . md5($imageUrl) . '.jpg';
        $lockFile = self::LOCK_DIR . md5($imageUrl) . '.lock';

        $lockHandle = fopen($lockFile, 'w');
        if (!flock($lockHandle, LOCK_EX | LOCK_NB)) {
            return;
        }

        try {
            $imageData = self::fetchImage($imageUrl);
            $processedImage = self::createBlurredImage($imageData, $quality);
            file_put_contents($cacheFile, $processedImage);
        } finally {
            flock($lockHandle, LOCK_UN);
            fclose($lockHandle);
            @unlink($lockFile);
        }
    }

    private static function createBlurredImage(string $imageData, int $quality): string
    {
        $tempFile = tmpfile();
        try {
            fwrite($tempFile, $imageData);
            $tempPath = stream_get_meta_data($tempFile)['uri'];

            $img = self::createImageResource($tempPath);
            $scaled = self::scaleAndBlurImage($img);

            ob_start();
            imagejpeg($scaled, null, $quality);
            $contents = ob_get_clean();

            if (empty($contents)) {
                throw new Exception('JPEG generation failed');
            }

            return $contents;
        } finally {
            if (isset($img) && $img instanceof GdImage) {
                imagedestroy($img);
            }
            if (isset($scaled) && $scaled instanceof GdImage) {
                imagedestroy($scaled);
            }
            fclose($tempFile);
        }
    }

    private static function createImageResource(string $path): GdImage
    {
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->file($path);

        return match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($path),
            'image/png' => self::createTrueColorPng($path),
            'image/gif' => imagecreatefromgif($path),
            default => throw new Exception("Unsupported MIME type: $mime")
        };
    }

    private static function createTrueColorPng(string $path): GdImage
    {
        $img = imagecreatefrompng($path);
        if (!imageistruecolor($img)) {
            imagepalettetotruecolor($img);
        }
        return $img;
    }

    private static function scaleAndBlurImage(GdImage $img): GdImage
    {
        $scaled = imagescale($img, 10, 10, IMG_BICUBIC);
        if (!$scaled || !imagefilter($scaled, IMG_FILTER_GAUSSIAN_BLUR)) {
            throw new Exception('Image processing failed');
        }
        return $scaled;
    }

    private static function fetchImage(string $imageUrl): string
    {
        $context = stream_context_create([
            'http' => [
                'timeout' => 5,
                'header' => "Range: bytes=0-" . self::MAX_FILE_SIZE
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false
            ]
        ]);

        $imageData = file_get_contents($imageUrl, false, $context);
        if ($imageData === false) {
            throw new Exception("Failed to download image");
        }
        return $imageData;
    }

    private static function isValidCache(string $cacheFile): bool
    {
        return file_exists($cacheFile) && filesize($cacheFile) > 0;
    }


    private static function isProcessing(string $imageUrl): bool
    {
        return
            file_exists(self::LOCK_DIR . md5($imageUrl) . '.lock') ||
            self::isInQueue(md5($imageUrl));
    }


    private static function isInQueue(string $fileHash): bool
    {
        if (!file_exists(self::QUEUE_FILE)) return false;

        $handle = fopen(self::QUEUE_FILE, 'r');
        if (!$handle) return false;

        while (($line = fgets($handle)) !== false) {
            if (strpos($line, $fileHash) === 0) {
                fclose($handle);
                return true;
            }
        }

        fclose($handle);
        return false;
    }


    private static function addToQueue(string $imageUrl, int $quality): void
    {
        $data = [
            'url' => $imageUrl,
            'quality' => $quality,
            'created_at' => time()
        ];

        $queueEntry = md5($imageUrl) . '|' . json_encode($data);

        if (file_put_contents(
            self::QUEUE_FILE,
            $queueEntry . PHP_EOL,
            FILE_APPEND | LOCK_EX
        ) === false) {
            throw new Exception("Failed to write to queue file");
        }
    }

    private static function removeFromQueue(string $fileHash): void
    {
        $queue = file(self::QUEUE_FILE, FILE_IGNORE_NEW_LINES);
        $newQueue = [];

        foreach ($queue as $line) {
            if (!str_starts_with($line, $fileHash)) {
                $newQueue[] = $line;
            }
        }

        file_put_contents(self::QUEUE_FILE, implode(PHP_EOL, $newQueue));
    }


    private static function getCachedImage(string $cacheFile): string
    {
        $content = file_get_contents($cacheFile);
        if ($content === false) {
            throw new Exception("Failed to read cached image");
        }
        return 'data:image/jpeg;base64,' . base64_encode($content);
    }

    private static function getTransparentPixel(): string
    {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdjYGBgYAAAAAQAAHpQoNMAAAAASUVORK5CYII=';
    }
}
