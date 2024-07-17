<?php
namespace App\Services;

class Date
{
    public static function zmdate($date)
    {
        $currentTime = time();
        $dateDiff = $currentTime - $date;
        if ($date != null) {
        if ($dateDiff <= 1) {
            return "только что";
        } elseif ($dateDiff <= 60) {
            return $dateDiff . " секунд " . self::getAgoSuffix($dateDiff);
        } elseif ($dateDiff <= 3600) {
            $minutes = floor($dateDiff / 60);
            return $minutes . " минут " . self::getAgoSuffix($minutes);
        } elseif ($dateDiff <= 86400) {
            $hours = floor($dateDiff / 3600);
            return $hours . " часов " . self::getAgoSuffix($hours);
        } else {
            return self::formatDate($date);
        }
    }
    }

    private static function getAgoSuffix($value)
    {
        $lastDigit = $value % 10;
        if ($lastDigit == 1 && $value != 11) {
            return "назад";
        } elseif (($lastDigit == 2 || $lastDigit == 3 || $lastDigit == 4) && ($value < 10 || $value > 20)) {
            return "назад";
        } else {
            return "назад";
        }
    }

    private static function formatDate($date)
    {
        $formattedDate = date("j F Y в H:i", $date);
        $formattedDate = str_replace(
            array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"),
            array("января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"),
            $formattedDate
        );
        return $formattedDate;
    }
}
?>
