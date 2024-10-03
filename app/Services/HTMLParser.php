<?php

namespace App\Services;
use DOMDocument, DOMXPath;

class HTMLParser
{

  
    public static function parse($url, $mask)
    {

        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        
        if (curl_errno($ch)) {
            echo 'Ошибка cURL: ' . curl_error($ch);
            return;
        }
        
        curl_close($ch);
        
        $dom = new DOMDocument;
        
        @$dom->loadHTML($response); 
        
        $xpath = new DOMXPath($dom);
        
        $nodes = $xpath->query($mask);
        
        if ($nodes->length > 0) {
            $firstNode = $nodes->item(0)->textContent;
            $cleanedContent = ltrim($firstNode);
            return $cleanedContent;
        }
        
        
    }
}
