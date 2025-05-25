<?php

namespace App\Services;


class Emoji
{

    public static function parseSmileys($text) {
        return preg_replace_callback(
            '/\[(\d+\/[\w-]+)\]/',
            function($matches) {
                $parts = explode('/', $matches[1]);
                $dir = $parts[0];
                $name = $parts[1];
                
                $files = glob($_SERVER['DOCUMENT_ROOT']."/static/img/smileys/$dir/$name.*");
                
                if ($files) {
                    $ext = pathinfo($files[0], PATHINFO_EXTENSION);
                    return "<img src='/static/img/smileys/$dir/$name.$ext' 
                             class='emoji' 
                             data-code='".$matches[0]."'>";
                }
                
                return htmlspecialchars($matches[0]);
            },
            $text
        );
    }

    public static function getAllSmileys() {
        // Пример реализации для файловой системы
        $smileys = [];
        $directories = glob($_SERVER['DOCUMENT_ROOT'].'/static/img/smileys/*', GLOB_ONLYDIR);
        
        foreach ($directories as $dir) {
            $dirName = basename($dir);
            $files = glob($dir.'/*.{gif,png,jpg,webp}', GLOB_BRACE);
            
            foreach ($files as $file) {
                $filename = pathinfo($file, PATHINFO_FILENAME);
                $ext = pathinfo($file, PATHINFO_EXTENSION);
                $code = "[{$dirName}/{$filename}]";
                
                $smileys[] = [
                    'code' => $code,
                    'url' => "/static/img/smileys/{$dirName}/{$filename}.{$ext}"
                ];
            }
        }
        
        return $smileys;
    }
    

    public static function expandSmileys($content)
    {
        $pattern = '/\[([0-9]+\/[a-zA-Z0-9_-]+)\]/';

        return preg_replace_callback($pattern, function ($matches) {
            $path = explode('/', $matches[1]);
            $dir = $path[0];
            $name = $path[1];

            $files = glob($_SERVER['DOCUMENT_ROOT'] . "/static/img/smileys/{$dir}/{$name}.*");

            if (count($files) > 0) {
                $file = basename($files[0]);
                return "<img src=\"/static/img/smileys/{$dir}/{$file}\" " .
                    "class=\"editor-emoji\" data-code=\"{$matches[0]}\">";
            }

            return $matches[0];
        }, $content);
    }
}
