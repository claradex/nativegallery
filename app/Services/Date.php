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
            } elseif ($dateDiff < 60) {
                return $dateDiff . " секунд " . self::getAgoSuffix($dateDiff);
            } elseif ($dateDiff < 3600) {
                $minutes = floor($dateDiff / 60);
                return $minutes . " " . self::getMinuteSuffix($minutes) . " " . self::getAgoSuffix($minutes);
            } elseif ($dateDiff < 86400) {
                $hours = floor($dateDiff / 3600);
                return $hours . " " . self::getHourSuffix($hours) . " " . self::getAgoSuffix($hours);
            } else {
                return self::formatDate($date);
            }
        }
    }

    private static function getAgoSuffix($value)
    {
        return "назад";
    }

    private static function getMinuteSuffix($value)
    {
        $lastDigit = $value % 10;
        $lastTwoDigits = $value % 100;
        if ($lastDigit == 1 && $lastTwoDigits != 11) {
            return "минуту";
        } elseif (($lastDigit >= 2 && $lastDigit <= 4) && ($lastTwoDigits < 10 || $lastTwoDigits > 20)) {
            return "минуты";
        } else {
            return "минут";
        }
    }

    private static function getHourSuffix($value)
    {
        $lastDigit = $value % 10;
        $lastTwoDigits = $value % 100;
        if ($lastDigit == 1 && $lastTwoDigits != 11) {
            return "час";
        } elseif (($lastDigit >= 2 && $lastDigit <= 4) && ($lastTwoDigits < 10 || $lastTwoDigits > 20)) {
            return "часа";
        } else {
            return "часов";
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
