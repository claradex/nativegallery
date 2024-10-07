<?php

namespace App\Controllers\Api\Images\Comments;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json};

class Edit
{
    public function __construct()
    {


        $postId = explode('/', $_SERVER['REQUEST_URI'])[4];
        $data = DB::query('SELECT * FROM photos_comments WHERE id=:id', array(':id' => $postId))[0];
        $content = json_decode($data['content'], true);
        $postuserid = DB::query('SELECT user_id FROM photos_comments WHERE id=:id', array(':id' => $postId))[0]['user_id'];
        if ($postuserid === Auth::userid()) {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            $json_arr = $content;
            if ($data['value'] != DB::query('SELECT body FROM photos_comments WHERE id=:id', array(':id' => $postId))[0]['body']) {
                $json_arr['edited'] = 'true';
            }

            $json_str_updated = json_encode($json_arr);
            DB::query('UPDATE photos_comments SET body=:body, content=:c WHERE id=:id', array(':id' => $postId, ':body' => $data['value'], ':c'=>$json_str_updated));
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
