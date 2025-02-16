<?php

namespace App\Controllers\Api\Images\Contests;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class SendPretend
{
    public function __construct()
    {
        DB::query('UPDATE photos SET on_contest=1, contest_id=:id WHERE id=:idd', array(':id'=>$_POST['cid'], ':idd'=>$_POST['photo_id']));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
