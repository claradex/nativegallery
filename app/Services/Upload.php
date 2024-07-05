<?php

namespace App\Services;


class Upload

{

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
        $filecdn = bin2hex(openssl_random_pseudo_bytes(64, $cstrong)) . '.' . pathinfo($file['name'])['extension'];
        $folder = $location . $filecdn;
        $s3 = new \Aws\S3\S3Client([
            'region' => NGALLERY['root']['storage']['s3']['credentials']['region'],
            'version' => NGALLERY['root']['storage']['s3']['credentials']['version'],
            'credentials' => [
                'key' => NGALLERY['root']['storage']['s3']['credentials']['key'],
                'secret' => NGALLERY['root']['storage']['s3']['credentials']['secret'],
            ],
            'endpoint' => NGALLERY['root']['storage']['s3']['domains']['gateway'],
        ]);
        $cstrong = True;
        $result = $s3->putObject([
            'Bucket' => NGALLERY['root']['storage']['s3']['credentials']['bucket'],
            'Key' => $folder,
            'SourceFile' => $file['tmp_name']
        ]);
        return [
            'type' => explode('/', $file['type'])[0],
            'src' => NGALLERY['root']['storage']['s3']['domains']['public'].'/'.$location . $filecdn,
            'size' => self::human_filesize(filesize($file['tmp_name'])),
            'name' => $file['name']
        ];
    }
}
