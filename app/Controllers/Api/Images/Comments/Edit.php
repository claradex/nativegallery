<?php

namespace App\Controllers\Api\Images\Comments;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json};

class Edit
{
    public function __construct()
    {


        $postId = explode('/', $_SERVER['REQUEST_URI'])[4];
        $postuserid = DB::query('SELECT user_id FROM photos_comments WHERE id=:id', array(':id' => $postId))[0]['user_id'];
        if ($postuserid === Auth::userid()) {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            DB::query('UPDATE photos_comments SET body=:body WHERE id=:id', array(':id' => $postId, ':body' => $data['value']));
            echo json_encode(
                array(
                    'errorcode' => '0',
                    'error' => 0,
                    'postid' => $postId
                )
            );
        } else {
            echo json_encode(
                array(
                    'errorcode' => '1',
                    'error' => 1
                )
            );
        }
    }
}
