<?php

namespace App\Controllers\Api\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class Favorite
{
    public function __construct()
    {
        $postId = explode('/', $_SERVER['REQUEST_URI'])[3];
        if (DB::query('SELECT * FROM photos_favorite WHERE photo_id = :id AND user_id=:uid', ['id' => $postId, ':uid'=>Auth::userid()])) {
            DB::query('DELETE FROM photos_favorite WHERE photo_id = :id AND user_id=:uid', ['id' => $postId, ':uid'=>Auth::userid()]);
            echo 0;
        } else {
            DB::query('INSERT INTO photos_favorite (photo_id, user_id) VALUES (:id, :uid)', ['id' => $postId, ':uid'=>Auth::userid()]);
            echo 1;
        }

    }
}
