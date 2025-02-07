<?php

namespace App\Controllers\Api\Users;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};
use \App\Core\Page;

class EmailVerify
{
    public function __construct()
    {
        if (isset($_GET['token'])) {
            $data = DB::query('SELECT * FROM servicekeys WHERE token=:token AND type="EMAILVERIFY"', array(':token'=>$_GET['token']))[0];
            $user_id = json_decode($data['content'], true)['user_id'];
            if ($data['status'] != 0) {
                DB::query('UPDATE users SET status=0 WHERE id=:id', [':id' => $user_id]);
                DB::query('UPDATE servicekeys SET status=0 WHERE token=:id', [':id' => $_GET['token']]);
                Page::set('System/EmailVerify');
            }
        }
    }
}
