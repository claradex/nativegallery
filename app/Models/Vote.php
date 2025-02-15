<?php
namespace App\Models;

use App\Services\{DB, GenerateRandomStr};

class Vote
{
    public static function photo($user_id, $pid)
    {
        $result = DB::query('SELECT type FROM photos_rates WHERE user_id=:uid AND photo_id=:pid AND contest=0', array(':uid' => $user_id, ':pid' => $pid));
        if (!empty($result)) {
            $type = $result[0]['type'];
            if ($type < 0) {
                $type = -1;
            }
            return $type;
        } else {
            return -1;
        }
        

    }

    public static function photoContest($user_id, $pid)
    {
        $result = DB::query('SELECT type FROM photos_rates WHERE user_id=:uid AND photo_id=:pid AND contest=1', array(':uid' => $user_id, ':pid' => $pid));
        if (!empty($result)) {
            $type = $result[0]['type'];
            if ($type < 0) {
                $type = -1;
            }
            return $type;
        } else {
            return -1;
        }
        

    }

    public static function comment($user_id, $pid)
    {
        $result = DB::query('SELECT * FROM photos_comments_rates WHERE user_id=:uid AND comment_id=:pid', array(':uid' => $user_id, ':pid' => $pid));
        if (!empty($result)) {
            $type = $result[0]['type'];
            if ($type < 0) {
                $type = -1;
            }

            return $type;
        } else {
            return -1;
        }
        

    }

    public static function count( $pid) {
        $result = DB::query('SELECT * FROM photos_rates WHERE photo_id=:pid', array(':pid' => $pid));
        $votes = 0;
        foreach ($result as $r) {
            if ($r['type'] === 1) {
                $votes++;
            } else {
                $votes--;
            }
        }
        return $votes;
    }
    public static function countcommrates($pid, $type) {
        if ($type === -1) {
            $result = DB::query('SELECT * FROM photos_comments_rates WHERE comment_id=:pid', array(':pid' => $pid));
        } else {
            $result = DB::query('SELECT * FROM photos_comments_rates WHERE comment_id=:pid AND type=:type', array(':pid' => $pid, ':type'=>$type));
        }
        $votes = 0;
        foreach ($result as $r) {
            if ($r['type'] === 1) {
                $votes++;
            } else {
                $votes--;
            }
        }
        return $votes;
    }

    public static function token()
    {
        return $_COOKIE['NGALLERYSESS'];
    }
}
?>
