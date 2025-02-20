<?php

namespace App\Controllers\Api\Images\Contests;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class SendPretend
{
    public function __construct()
    {
        if (isset($_POST['cid'])) {
            if (DB::query('SELECT contest_id FROM photos WHERE user_id=:uid', array(':uid' => Auth::userid()))[0]['contest_id'] != $_POST['cid']) {
                DB::query('UPDATE photos SET on_contest=1, contest_id=:id WHERE id=:idd', array(':id' => $_POST['cid'], ':idd' => $_POST['photo_id']));
                echo json_encode(
                    array(
                        'errorcode' => 0,
                        'error' => 0
                    )
                );
            }
        } else {
            echo json_encode(
                array(
                    'errorcode' => 1,
                    'error' => 0
                )
            );
        }
    }
}
