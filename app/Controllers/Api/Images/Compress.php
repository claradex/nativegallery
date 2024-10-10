<?php

namespace App\Controllers\Api\Images;

class Compress {
    private static function compressAndResizeImage($source_url, $quality, $max_width, $max_height) {
        $info = getimagesize($source_url);

        if ($info === false) {
            return false;
        }

        $width = $info[0];
        $height = $info[1];
        $aspect_ratio = $width / $height;

        if ($width > $height) {
            $new_width = $max_width;
            $new_height = $max_width / $aspect_ratio;
        } else {
            $new_height = $max_height;
            $new_width = $max_height * $aspect_ratio;
        }

        if ($info['mime'] == 'image/jpeg') {
            $image = imagecreatefromjpeg($source_url);
        } elseif ($info['mime'] == 'image/gif') {
            $image = imagecreatefromgif($source_url);
        } elseif ($info['mime'] == 'image/png') {
            $image = imagecreatefrompng($source_url);
        } else {
            return false;
        }

        $resized_image = imagecreatetruecolor($new_width, $new_height);

        if ($info['mime'] == 'image/png' || $info['mime'] == 'image/gif') {
            imagealphablending($resized_image, false);
            imagesavealpha($resized_image, true);
            $transparent = imagecolorallocatealpha($resized_image, 255, 255, 255, 127);
            imagefilledrectangle($resized_image, 0, 0, $new_width, $new_height, $transparent);
        }

        imagecopyresampled($resized_image, $image, 0, 0, 0, 0, $new_width, $new_height, $width, $height);

        ob_start();
        imagejpeg($resized_image, null, $quality);
        $compressed_image_data = ob_get_contents();
        ob_end_clean();

        imagedestroy($image);
        imagedestroy($resized_image);

        return $compressed_image_data;
    }

    private static function generateCacheFilename($source_url, $quality, $max_width, $max_height) {
        return $_SERVER['DOCUMENT_ROOT'].'/cdn/imgcache/' . md5($source_url . $quality . $max_width . $max_height) . '.jpg';
    }

    public function __construct() {
        $source_url = $_GET['url'];
        $quality = 40;
        $max_width = 400;
        $max_height = 400;

        if (!file_exists($_SERVER['DOCUMENT_ROOT'].'/cdn/imgcache')) {
            mkdir($_SERVER['DOCUMENT_ROOT'].'/cdn/imgcache', 0777, true);
        }

        $parsed_url = parse_url($source_url);
        if (!isset($parsed_url['scheme'])) {
            $local_file_path = $_SERVER['DOCUMENT_ROOT'] . '/' . ltrim($source_url, '/');
            if (file_exists($local_file_path)) {
                $source_url = $local_file_path;
            } else {
                header("HTTP/1.0 404 Not Found");
                exit;
            }
        }

        $cache_filename = self::generateCacheFilename($source_url, $quality, $max_width, $max_height);

        if (file_exists($cache_filename)) {
            $compressed_image_data = file_get_contents($cache_filename);
        } else {
            $compressed_image_data = self::compressAndResizeImage($source_url, $quality, $max_width, $max_height);

            if ($compressed_image_data) {
                file_put_contents($cache_filename, $compressed_image_data);
            } else {
                $imageData = file_get_contents($source_url);

                $finfo = new \finfo(FILEINFO_MIME_TYPE);
                $mimeType = $finfo->buffer($imageData);

                header("Content-Type: $mimeType");

                echo $imageData;
                exit;
            }
        }

        if ($compressed_image_data) {
            header('Content-Type: image/jpeg');
            header('Content-Length: ' . strlen($compressed_image_data));
            echo $compressed_image_data;
        }
    }
}
?>
