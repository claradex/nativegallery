<?php
namespace App\Models;

use App\Services\{DB, GenerateRandomStr};

class Vote
{
    public static function photo($user_id, $pid)
    {
        $result = DB::query('SELECT type FROM photos_rates WHERE user_id=:uid AND photo_id=:pid', array(':uid' => $user_id, ':pid' => $pid));
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

    public static function token()
    {
        return $_COOKIE['NGALLERYSESS'];
    }
}
?>
