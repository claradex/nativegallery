<?php

namespace App\Controllers\Api\Admin;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class CreateNews
{
    public function __construct()
    {
        DB::query('INSERT INTO news VALUES (\'0\', :body, :time)', array(':body' => $_POST['body'], ':time' => time()));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
