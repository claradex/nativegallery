<?php

namespace App\Controllers\Api\Images\Comments;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Comment};


class Load
{
    public function __construct()
    {

        $comments = DB::query('SELECT * FROM photos_comments WHERE photo_id=:pid', array(':pid'=>explode('/', $_SERVER['REQUEST_URI'])[4]));
        $number = 1;
        foreach ($comments as $c) {
            $comm = new Comment($c);
            
            if ($number % 2 == 0) {
                $class = 's11';
            } else {
                $class = 's1';
            }
            $comm->class($class);
            $number++;
            $comm->i();
        }
    }
}
