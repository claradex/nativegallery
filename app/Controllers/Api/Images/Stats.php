<?php

namespace App\Controllers\Api\Images;

use \App\Services\{Auth, DB};

class Stats
{

    public function __construct()
    {
        $imageWidth = 1000;
        $imageHeight = 700;
        $image = imagecreatetruecolor($imageWidth, $imageHeight);

        $backgroundColor = imagecolorallocate($image, 40, 40, 40);
        $axisColor = imagecolorallocate($image, 200, 200, 200);
        $barColor = imagecolorallocate($image, 30, 144, 255);
        $textColor = imagecolorallocate($image, 255, 255, 255);

        imagefill($image, 0, 0, $backgroundColor);

        $results = DB::query("SELECT DATE_FORMAT(FROM_UNIXTIME(time), '%d.%m.%Y') AS date, COUNT(*) AS views FROM photos_views WHERE photo_id = :photo_id AND time >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 30 DAY)) GROUP BY DATE_FORMAT(FROM_UNIXTIME(time), '%d.%m.%Y') ORDER BY date ASC;", array(':photo_id' => $_GET['id']));


        $data = [];
        $period = new \DatePeriod(
            new \DateTime('-30 days'),
            new \DateInterval('P1D'),
            new \DateTime('tomorrow')
        );

        foreach ($period as $date) {
            $formattedDate = $date->format('d.m.Y');
            $data[$formattedDate] = 0;
        }

        foreach ($results as $result) {
            $date = $result['date'];
            if (isset($data[$date])) {
                $data[$date] = $result['views'];
            }
        }





        $barWidth = 20;
        $barSpacing = 10;
        $maxBarHeight = $imageHeight - 110;
        $maxValue = max($data);
        if ($maxValue === 0) {
            $maxValue = 1;
        }

        $x = 50;
        foreach ($data as $date => $value) {
            $barHeight = ($value / $maxValue) * $maxBarHeight;
            $y = $imageHeight - 70 - $barHeight;
            imagefilledrectangle($image, $x, $y, $x + $barWidth, $imageHeight - 70, $barColor);
            imagettftext($image, 13, 0, $x + 2, $y - 10, $textColor, $_SERVER['DOCUMENT_ROOT'] . '/static/TTCommons-Medium.ttf', $value);
            imagettftext($image, 10, 90, $x + 15, $imageHeight - 0, $textColor, $_SERVER['DOCUMENT_ROOT'] . '/static/TTCommons-Medium.ttf', $date); // Rotated date
            $x += $barWidth + $barSpacing;
        }

        imageline($image, 50, $imageHeight - 70, $imageWidth - 50, $imageHeight - 70, $axisColor);
        imageline($image, 50, 50, 50, $imageHeight - 70, $axisColor);

        header('Content-Type: image/png');
        imagepng($image);
        imagedestroy($image);
    }
}
