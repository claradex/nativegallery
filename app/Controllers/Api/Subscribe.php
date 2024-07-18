<?php
namespace App\Controllers\Api;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;
use PDO;

class Subscribe
{

    public function __construct()
    {

       
        
        if (isset($_GET['id'])) {
            $sid = $_GET['id'];
        } else {
            die();
        }

        if (Auth::userid() != $sid) {

            if (!DB::query('SELECT follower_id FROM followers WHERE user_id=:userid AND follower_id=:followerid', array(':userid'=>$sid, ':followerid'=>Auth::userid()))) {
                DB::query('INSERT INTO followers VALUES (\'0\', :userid, :followerid)', array(':userid'=>$sid, ':followerid'=>Auth::userid()));
                $countusers = DB::query('SELECT COUNT(1) FROM followers WHERE `user_id`=:id', array(':id'=>$sid))[0]['COUNT(1)'];


                  
      
                    
                echo 1;
                
        } else {
                DB::query('DELETE FROM followers WHERE user_id=:userid AND follower_id=:followerid', array(':userid'=>$sid, ':followerid'=>Auth::userid()));


               echo 0;
        }
        }


    }
}