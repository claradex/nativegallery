<?php

namespace App\Services;


class Upload

{
    public $type;
    public $src;
    public $size;
    public $name;
    public $previewUrl;

    private static function human_filesize($bytes, $dec = 2): string
    {

        $size = array('B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
        $factor = floor((strlen($bytes) - 1) / 3);
        if ($factor == 0)
            $dec = 0;


        return sprintf("%.{$dec}f %s", $bytes / (1024 ** $factor), $size[$factor]);
    }
    public function __construct($file, $location)
    {
        if (is_array($file)) {
            $tmpname = $file['tmp_name'];
            $type = explode('/', $file['type'])[0];
            $name = $file['name'];
            $fileext = pathinfo($file['name'], PATHINFO_EXTENSION);
        } else {
            $tmpname = $file;
            $type = filetype($file);
            $name = basename($file);
            $fileext = pathinfo($file, PATHINFO_EXTENSION);
        }
        $cstrong = True;
        $filecdn = bin2hex(openssl_random_pseudo_bytes(64, $cstrong)) . '.' . $fileext;
        $folder = $location . $filecdn;

        if (strtolower(NGALLERY['root']['storage']['type']) == "s3") {

            if (NGALLERY['root']['video']['upload']['cloudflare-bypass'] === true) {
                if ($location === 'cdn/video') {
                    if (filesize($_SERVER['DOCUMENT_ROOT'] . '/' . $location . $filecdn) >= 94371840) {
                        mkdir("{$_SERVER['DOCUMENT_ROOT']}/uploads/{$location}", 0777, true);
                        move_uploaded_file($tmpname, "{$_SERVER['DOCUMENT_ROOT']}/uploads/{$folder}");
                        $this->type = $type;
                        $this->src = "/uploads/{$folder}";
                        $this->size = self::human_filesize(filesize($tmpname));
                        $this->name = $name;
                        return;
                    }
                }
            }
            $s3 = new \Aws\S3\S3Client([
                'region' => NGALLERY['root']['storage']['s3']['credentials']['region'],
                'version' => NGALLERY['root']['storage']['s3']['credentials']['version'],
                'credentials' => [
                    'key' => NGALLERY['root']['storage']['s3']['credentials']['key'],
                    'secret' => NGALLERY['root']['storage']['s3']['credentials']['secret'],
                ],
                'endpoint' => NGALLERY['root']['storage']['s3']['domains']['gateway'],
            ]);

            $s3->putObject([
                'Bucket' => NGALLERY['root']['storage']['s3']['credentials']['bucket'],
                'Key' => $location . $filecdn,
                'SourceFile' => $tmpname
            ]);
            $this->type = $type;
            $this->src = NGALLERY['root']['storage']['s3']['domains']['public'] . '/' . $location . $filecdn;
            $this->size = self::human_filesize(filesize($tmpname));
            $this->name = $name;
        } else {
            // Формирование путей
            $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/uploads{$location}";
            $destination = "{$uploadDir}/{$filecdn}";

            // Создание директории
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            // Перемещение файла
            if (is_uploaded_file($tmpname)) {
                move_uploaded_file($tmpname, $destination);
            } else {
                rename($tmpname, $destination);
            }

            // Установка свойств
            $this->type = $type;
            $this->src = "/uploads/{$location}/{$filecdn}"; // Корректный URL
            $this->size = self::human_filesize(filesize($destination));
            $this->name = $name;
        }
    }

    public function generatePreview($width, $height)
    {
        if ($this->type !== 'image') return;

        $src = $_SERVER['DOCUMENT_ROOT'] . $this->src;
        $image = null;

        switch (mime_content_type($src)) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($src);
                break;
            case 'image/png':
                $image = imagecreatefrompng($src);
                break;
            case 'image/gif':
                $image = imagecreatefromgif($src);
                break;
            default:
                return;
        }

        $originalWidth = imagesx($image);
        $originalHeight = imagesy($image);

        $preview = imagecreatetruecolor($width, $height);
        imagecopyresampled(
            $preview,
            $image,
            0,
            0,
            0,
            0,
            $width,
            $height,
            $originalWidth,
            $originalHeight
        );

        $previewPath = $_SERVER['DOCUMENT_ROOT'] . '/cdn/previews/' . basename($this->src);
        imagejpeg($preview, $previewPath, 85);
        imagedestroy($preview);

        $this->previewUrl = '/cdn/previews/' . basename($this->src);
    }

    
    public function getType()
    {
        return $this->type;
    }

    public function getSrc()
    {
        return $this->src;
    }

    public function getSize()
    {
        return $this->size;
    }

    public function getName()
    {
        return $this->name;
    }
}
