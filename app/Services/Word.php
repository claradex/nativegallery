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
public static function processMentions($text) {
    return preg_replace_callback(
        '/@\[(\d++):([^\]\r\n]+)\]/u',
        function ($matches) {
            if (count($matches) !== 3) {
                return $matches[0] ?? '';
            }

            $userId = (int)$matches[1];
            $username = trim($matches[2]);

            // Экранируем только для HTML-атрибута, а не для видимой части
            $attrUsername = htmlspecialchars($username, ENT_QUOTES | ENT_HTML5, 'UTF-8');

            return '<span class="user-mention" '
                 . 'data-user-id="' . $userId . '" '
                 . 'data-username="' . $attrUsername . '">'
                 . '@' . $username
                 . '</span>';
        },
        $text
    );
}


}
