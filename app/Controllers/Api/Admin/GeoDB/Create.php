<?php

namespace App\Controllers\Api\Admin\GeoDB;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class Create
{
    public function __construct()
    {
        DB::query('INSERT INTO geodb VALUES (\'0\', :body)', array(':body' => $_POST['body']));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
