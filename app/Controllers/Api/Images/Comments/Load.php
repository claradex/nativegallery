<?php

namespace App\Controllers\Api\Images\Comments;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Comment, Photo};


class Load
{
    public function __construct()
    {

        $comments = DB::query('SELECT * FROM photos_comments WHERE photo_id=:pid', array(':pid' => explode('/', $_SERVER['REQUEST_URI'])[4]));
        $photo = new Photo(explode('/', $_SERVER['REQUEST_URI'])[4]);
        $number = 1;
        if ((int)$photo->i('pinnedcomment_id') != 0) {
            $comm = new Comment(DB::query('SELECT * FROM photos_comments WHERE id=:id', array(':id'=>$photo->i('pinnedcomment_id')))[0]);
            $class = 's1';
            $comm->class($class);
            $number++;
            $comm->i();
        }
        foreach ($comments as $c) {
            $comm = new Comment($c);
            $photo = new Photo($c['photo_id']);
            if ($comm->content('deleted') != 'true' && (int)$photo->i('pinnedcomment_id') != (int)$c['id']) {
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
