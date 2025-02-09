<?php

namespace App\Controllers\Api\Images\Comments;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json};

class Pin
{
    public function __construct()
    {

            $postId = explode('/', $_SERVER['REQUEST_URI'])[4];
            $cpostid = DB::query('SELECT photo_id FROM photos_comments WHERE id=:id', array(':id' => $postId))[0]['photo_id'];
            if (DB::query('SELECT user_id FROM photos WHERE id=:id', array(':id' => $cpostid))[0]['user_id'] === Auth::userid()) {

                $data = DB::query('SELECT * FROM photos WHERE id=:id', array(':id'=>$cpostid))[0];
                if ($data['pinnedcomment_id'] === (int)$postId) {
                    DB::query('UPDATE photos SET pinnedcomment_id=0 WHERE id=:id', array(':id'=>$cpostid));
                    echo json_encode(
                        array(
                            'errorcode' => '0',
                            'error' => 0,
                            'action' => 'unpin',
                        )
                    );
                } else {
                    DB::query('UPDATE photos SET pinnedcomment_id=:pid WHERE id=:id', array(':pid'=>$postId, ':id'=>$cpostid));
                    echo json_encode(
                        array(
                            'errorcode' => '0',
                            'error' => 0,
                            'action' => 'pin',
                        )
                    );
                }


        }

    }
}