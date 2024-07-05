<?php

namespace App\Controllers\Api\Profile;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};
use App\Services\Upload as UploadPhoto;

class Update
{
    private $photourl;
    public function __construct()
    {
        
        $postData = $_POST;
        $dataArray = [];


        foreach ($postData as $key => $value) {
            if (strpos($key, 'about') === 0) {
                $paramKey = $key;

                if (!isset($dataArray[$paramKey])) {
                    $dataArray[$paramKey] = [];
                }

                if (strpos($key, 'OnMain') === false) {
                    $dataArray[$paramKey]['value'] = $value;
                }
            }
        }

        $user = new \App\Models\User(Auth::userid());
        $content = json_decode($user->i('content'), true);
        $existingArray = array_replace_recursive($content, $dataArray);

        $newJson = json_encode($existingArray, JSON_PRETTY_PRINT);

        if (isset($_FILES['userphoto'])) {
            $upload = new UploadPhoto($_FILES['userphoto'], 'cdn/img/');
            if ($upload->getType() !== null) {
                $this->photourl = $upload->getSrc();
            } else {
                $this->photourl = $user->i('photourl');
            }
        } else {
            $this->photourl = $user->i('photourl');
        }

        DB::query('UPDATE users SET content=:c, photourl=:ph WHERE id=:id', [':id' => Auth::userid(), ':c' => $newJson, ':ph'=>$this->photourl]);

       
    }
}
