<?php

namespace App\Services;

class TextFormat
{
    public function removeZalgo(string $text): string
    {
        return preg_replace('%\p{M}{3,}%Xu', '', $text);
    }

    public static function limitText($text, $limit) {
        // Проверка длины текста
        $text = preg_replace_callback('/<img id="emojiPicture" src="[^"]*">/', function($matches) {
            return str_repeat(' ', 30);
        }, $text);
    
        // Проверка длины текста
        if (mb_strlen($text) <= $limit) {
            return $text;
        }
    
        // Разделение текста на видимую и скрытую части
        $visibleText = mb_substr($text, 0, $limit);
        $hiddenText = mb_substr($text, $limit);
    
        // Убедиться, что видимый текст не обрывается на полуслове
        $lastSpace = mb_strrpos($visibleText, ' ');
        if ($lastSpace !== false) {
            $visibleText = mb_substr($visibleText, 0, $lastSpace);
            $hiddenText = mb_substr($text, $lastSpace);
        }
    
        // Генерация HTML
        return self::generateHtml($visibleText, $hiddenText);
}
    

    private static function generateHtml($visibleText, $hiddenText) {
        return <<<HTML
      $visibleText
      <button class="PostTextMore" onclick="toggleContent(this)">
        <span class="PostTextMore__content">Показать ещё</span>
      </button>
      <span class="hidden-content" style="display: none;">
        $hiddenText
      </span>
    HTML;
    }
    

    public static function i($var)
    {
        $search = array(
            '/\[REPLY\=(.*?)\](.*?)\[\/REPLY\]/is',
            '/\*\*([^\*]+)\*\*/',
            '/\_\_([^\*]+)\_\_/',
            '/\[u\](.*?)\[\/u\]/is',
            '/\+\+([^\*]+)\+\+/',
            '/\~\~([^\*]+)\~\~/',
            '/\[link\=(.*?)\](.*?)\[\/link\]/is',
            '/\[br\]/is',
            '/\[image\](.*?)\[\/image\]/is',
            '/\[video\](.*?)\[\/video\]/is',
            '/\[music\](.*?)\[\/music\]/is',
        );
        $replace = array(
            '<a href="/$1">$2</a>',
            '<b style="font-weight: 600;">$1</b>',
            '<i>$1</i>',
            '<u>$1</u>',
            '<a id="confettilink" style="background-image: url(/static/img/gradients/conf.png);
          -webkit-background-clip: text;background-size: 100%;

          -webkit-text-fill-color: transparent;" onclick="confetti()"><b style="font-weight: 600;">$1</b></a>',
            '<strike>$1</strike>',
            '<a href="$1">$2</a>',
            '<br>',
            '<img src="$1" width="250px">$2</img>',
            "<video width='250' style='border-radius: 15px !important;'' controls='controls' autoplay controls muted><source src='\$1' controls></video>",
            "<audio id='audioau' width='235' style='border-radius: 15px !important; margin-bottom: 10px;' controls><source src='\$1' controls></audio>",
        );
        $var = preg_replace($search, $replace, $var);
        return $var;
    }



    public static function formatText($text)
    {

        $text = self::formatLinks($text);
        $text = self::formatEmojis($text);



        return $text;
    }





    public static function formatEmojis(string $text): string
    {
        $emojis = \Emoji\detect_emoji($text);
        $replaced = [];
        foreach ($emojis as $emoji) {
            $point = explode("-", strtolower($emoji["hex_str"]))[0];
            if (in_array($point, $replaced)) {
                continue;
            } else {
                $replaced[] = $point;
            }

            $image = "https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.1.0/img/apple/64/$point.png";
            $image = "<img src='$image' alt='$emoji[emoji]' ";
            $image .= "style='max-height:20px; padding-left: 2pt; padding-right: 2pt; vertical-align: bottom;' />";

            $text = str_replace($emoji["emoji"], $image, $text);
        }

        return $text;
    }




    public static function mentions($text)
    {

        $text = preg_split("/[\s]+/", $text);
        $newstring = " ";

        foreach ($text as $word) {
            if (substr($word, 0, 1) == "@") {
                if (strcasecmp(DB::query('SELECT username FROM users WHERE (LOWER(username) LIKE :username)', array(':username' => '%' . substr($word, 1) . '%'))[0]['username'], substr($word, 1)) === 0) {
                    $newstring .= "<a data-mention-ref-m='" . substr($word, 1) . "' id='mentionlink' href='/" . substr($word, 1) . "'>" . $word . "</a> ";
                } else if (strcasecmp(DB::query('SELECT linkgroup FROM `groups` WHERE (LOWER(linkgroup) LIKE :username)', array(':username' => '%' . substr($word, 1) . '%'))[0]['linkgroup'], substr($word, 1)) === 0) {
                    $newstring .= "<a data-mention-ref-m='" . substr($word, 1) . "' id='mentionlink' href='/" . substr($word, 1) . "'>" . $word . "</a> ";
                } else {
                    $newstring .= $word . " ";
                }
            } else if (substr($word, 0, 1) == "#") {
                $newstring .= "<a href='/topic/" . substr($word, 1) . "'>" . htmlspecialchars($word) . "</a> ";
            } else {
                $newstring .= $word . " ";
            }
        }

        return $newstring;
    }
    public static function formatLinks($text)
    {

        $currentDomain = $_SERVER['HTTP_HOST'];

        $pattern = '/(https?:\/\/[^\s<]+)/i';
        
        $imgPattern = '/<img\s[^>]*src="https?:\/\/[^\s<]*"[^>]*>/i';
    
        preg_match_all($imgPattern, $text, $imgMatches);
        $imgTags = $imgMatches[0];
    
        $messageWithoutImgTags = preg_replace($imgPattern, '###IMG###', $text);
    
        $messageWithClickableLinks = preg_replace_callback($pattern, function ($matches) use ($currentDomain) {
            $url = $matches[0];
    
            $urlComponents = parse_url($url);
            if ($urlComponents['host'] === $currentDomain && preg_match('/^\/addemoji\/([\w-]+)/', $urlComponents['path'], $idMatches)) {
                $id = $idMatches[1];
                return '<a onclick="createModal(\'' . $id . '\', NULL, \'da39a3ee5e6b4b0d3255bfef95601890afd80709\', EMOJI_ADD, \'emojiadd' . $id . '\'); return false;" href="' . $url . '">' . $url . '</a>';
            }
    
            return '<a href="' . $url . '">' . $url . '</a>';
        }, $messageWithoutImgTags);
    
        foreach ($imgTags as $imgTag) {
            $messageWithClickableLinks = preg_replace('/###IMG###/', $imgTag, $messageWithClickableLinks, 1);
        }
    
        return $messageWithClickableLinks;
    }
}
