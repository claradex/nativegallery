<?php

namespace App\Controllers\Api\Images\Comments;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, Files, Shell};
use App\Models\Notification;

class Create
{



    private static function create($content, $id)
    {
        DB::query('INSERT INTO photos_comments VALUES (\'0\', :userid, :postid, :postbody, :time, :content)', array('postid' => $_POST['id'], ':postbody' => $_POST['wtext'], ':userid' => Auth::userid(), ':time' => time(), ':content'=>''));
    }
    public function __construct()
    {
        $id = $_POST['id'];
        $postbody = $_POST['wtext'];
        if ((int)$id === DB::query('SELECT id FROM photos WHERE id=:id', array(':id' => $id))[0]['id']) {


            $content = Json::return(
                array(
                    'type' => 'none',
                    'by' => 'user'
                )
            );

            if (strlen($postbody) < 4096 || strlen($postbody) > 1) {
                if (trim($postbody) != '') {
                    $postbody = ltrim($postbody);
                    echo json_encode(
                        array(
                            'errorcode' => '0',
                            'error' => 0
                        )
                    );
                } else {
                    die(json_encode(
                        array(
                            'errorcode' => '1',
                            'error' => 1
                        )
                    ));
                }
            } else {
                die(json_encode(
                    array(
                        'errorcode' => '1',
                        'error' => 1
                    )
                ));
            }

            self::create($content, $id);
        } else {
            die(json_encode(
                array(
                    'errorcode' => '1',
                    'error' => 1
                )
            ));
        }
    }
}
