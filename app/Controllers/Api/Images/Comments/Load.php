<?php

namespace App\Controllers\Api\Images\Comments;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Comment, Photo};


class Load
{
    public function __construct()
    {

        $photo = new Photo(explode('/', $_SERVER['REQUEST_URI'])[4]);
        $comments = DB::query('SELECT * FROM photos_comments WHERE photo_id=:pid ORDER BY CASE WHEN id = :pinnedid THEN 0 ELSE 1 END, id ASC', array(':pid' => explode('/', $_SERVER['REQUEST_URI'])[4], ':pinnedid' => $photo->i('pinnedcomment_id')));
        $number = 1;
        foreach ($comments as $c) {
            $comm = new Comment($c);
            $photo = new Photo($c['photo_id']);
            if ($comm->content('deleted') != 'true') {
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
}
