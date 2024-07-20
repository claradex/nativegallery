<?php

namespace App\Controllers\Api\Admin\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class SetVisibility
{
    public function __construct()
    {
        DB::query('UPDATE photos SET moderated=:mod, timeupload=:time WHERE id=:id', array(':id'=>$_GET['id'], ':mod'=>$_GET['mod'], ':time'=>time()));
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