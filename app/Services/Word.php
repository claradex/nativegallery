<?php
namespace App\Services;

use App\Services\GenerateRandomStr;



class Word
{

    public static function strlen($word)
    {
        $len = strlen($word);

        if (preg_match("/[\p{Cyrillic}]/u", $word)) {
            $len /= 2;
        }
        return $len;
    }
}