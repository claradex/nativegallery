<?php

namespace App\Controllers\Api\Admin\News;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class Delete
{
    public function __construct()
    {
        $postId = explode('/', $_SERVER['REQUEST_URI'])[4];
        DB::query('DELETE FROM news WHERE id=:id', array(':id' => $postId));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
