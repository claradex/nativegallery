<?php

namespace App\Services;


class EXIF

{

    public function __construct($file)
    {
        $exif = exif_read_data($file, 0, true);
        $jsonData = [];
        
        if ($exif !== false) {
            foreach ($exif as $key => $section) {
                foreach ($section as $name => $val) {
                    $jsonData["$key.$name"] = $val;
                }
            }
            return json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }
        return null;
    }
}
