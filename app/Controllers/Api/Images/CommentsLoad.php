<?php

namespace App\Controllers\Api\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Comment};


class CommentsLoad
{
    public function __construct()
    {

        $comments = DB::query('SELECT * FROM photos_comments WHERE photo_id=:pid', array(':pid'=>explode('/', $_SERVER['REQUEST_URI'])[4]));
        foreach ($comments as $c) {
             $comm = new Comment($c);
             $comm->i();
        }
    }
}
