<?php

namespace App\Controllers\Api\Admin\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class SetVisibility
{
    public function __construct()
    {
        $priority = 0;
        $photo = new Photo($_GET['id']);
        $data = json_decode($photo->i('content'), true);

        if (!array_key_exists('declineReason', $data)) {
            $data['declineReason'] = null;
        }
        if (!array_key_exists('iRate', $data)) {
            $data['iRate'] = $_GET['irate'];
        }
        if (!array_key_exists('kRate', $data)) {
            $data['kRate'] = $_GET['krate'];
        }
        if ($_POST['comment'] != null) {
            $data['declineComment'] = $_POST['comment'];
        }

        if ($_GET['mod'] != 1) {
            $data['declineReason'] = $_GET['reason'];
        } else {
            $priority = $_GET['reason'];
        }


        $updatedJsonString = json_encode($data);


        DB::query('UPDATE photos SET moderated=:mod, timeupload=:time, priority=:pr, content=:c WHERE id=:id', array(':id'=>$_GET['id'], ':mod'=>$_GET['mod'], ':time'=>time(), ':pr'=>$priority, ':c'=>$updatedJsonString));
        $uid = DB::query('SELECT user_id FROM photos WHERE id=:id', array(':id'=>$_GET['id']))[0]['user_id'];
        if ($_GET['mod'] === 1) {
            $followers = DB::query('SELECT * FROM followers WHERE user_id=:uid', array(':uid'=>$uid));
            foreach ($followers as $f) {
                DB::query('INSERT INTO followers_notifications VALUES (\'0\', :uid, :fid, :pid, 0)', array(':uid'=>$uid, ':fid'=>$f['follower_id'], ':pid'=>$_GET['id']));
            }
        }
        header('Location: ' . $_SERVER['HTTP_REFERER']);
    }
}