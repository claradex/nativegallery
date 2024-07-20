<?php

namespace App\Controllers\Api\Images;
use \App\Services\{Auth, DB};

class Stats {

    public function __construct() {
        $imageWidth = 1000;
        $imageHeight = 700;
        $image = imagecreatetruecolor($imageWidth, $imageHeight);
        
        $backgroundColor = imagecolorallocate($image, 40, 40, 40);
        $axisColor = imagecolorallocate($image, 200, 200, 200);
        $barColor = imagecolorallocate($image, 30, 144, 255);
        $textColor = imagecolorallocate($image, 255, 255, 255);
        
        imagefill($image, 0, 0, $backgroundColor);
        
        $data = [
            "22.06.2024" => 0,
            "23.06.2024" => 0,
            "24.06.2024" => 0,
            "25.06.2024" => 0,
            "26.06.2024" => 0,
            "27.06.2024" => 0,
            "28.06.2024" => 0,
            "29.06.2024" => 0,
            "30.06.2024" => 0,
            "01.07.2024" => 0,
            "02.07.2024" => 0,
            "03.07.2024" => 0,
            "04.07.2024" => 0,
            "05.07.2024" => 0,
            "06.07.2024" => 0,
            "07.07.2024" => 0,
            "08.07.2024" => 0,
            "09.07.2024" => 0,
            "10.07.2024" => 0,
            "11.07.2024" => 0,
            "12.07.2024" => 0,
            "13.07.2024" => 0,
            "14.07.2024" => 0,
            "15.07.2024" => 292,
            "16.07.2024" => 292,
            "17.07.2024" => 154,
            "18.07.2024" => 892,
            "19.07.2024" => 606,
            "20.07.2024" => 0010,
            "21.07.2024" => 0
        ];
        
        $barWidth = 20;
        $barSpacing = 10;
        $maxBarHeight = $imageHeight - 110;
        $maxValue = max($data);
        
        $x = 50;
        foreach ($data as $date => $value) {
            $barHeight = ($value / $maxValue) * $maxBarHeight;
            $y = $imageHeight - 70 - $barHeight;
            imagefilledrectangle($image, $x, $y, $x + $barWidth, $imageHeight - 70, $barColor);
            imagettftext($image, 13, 0, $x + 2, $y - 10, $textColor, $_SERVER['DOCUMENT_ROOT'].'/static/TTCommons-Medium.ttf', $value);
            imagettftext($image, 10, 90, $x + 15, $imageHeight - 0, $textColor, $_SERVER['DOCUMENT_ROOT'].'/static/TTCommons-Medium.ttf', $date); // Rotated date
            $x += $barWidth + $barSpacing;
        }

        imageline($image, 50, $imageHeight - 70, $imageWidth - 50, $imageHeight - 70, $axisColor);
        imageline($image, 50, 50, 50, $imageHeight - 70, $axisColor);
        
        header('Content-Type: image/png');
        imagepng($image);
        imagedestroy($image);
        
    }
}
?>
