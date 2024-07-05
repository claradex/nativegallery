<?php

namespace App\Services;

class EXIF
{
    private $data;

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
            $this->data = json_encode($jsonData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        } else {
            $this->data = null;
        }
    }

    public function getData()
    {
        return $this->data;
    }
}
