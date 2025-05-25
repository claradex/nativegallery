<?php

namespace App\Controllers\Api\Emoji;

use \App\Services\Emoji;

class Load
{

    public function __construct()
    {



        try {
            $smileys = Emoji::getAllSmileys();
            echo json_encode([
                'status' => 'success',
                'data' => array_map(function ($s) {
                    return [
                        'code' => preg_quote($s['code'], '/'),
                        'url' => $s['url'],
                        'keywords' => explode('_', str_replace('/', '_', $s['code']))
                    ];
                }, $smileys)
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Smileys load failed'
            ]);
        }
    }
}
