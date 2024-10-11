<?php

namespace App\Controllers\Api\Images\Comments;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Comment};


class Load
{
    public function __construct()
    {

        $comments = DB::query('SELECT * FROM entities_data WHERE photo_id=:pid', array(':pid' => explode('/', $_SERVER['REQUEST_URI'])[4]));
       
    }
}
