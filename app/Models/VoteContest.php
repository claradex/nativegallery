<?php
namespace App\Models;

use App\Services\{DB, GenerateRandomStr};

class VoteContest
{
    public static function photo($user_id, $pid, $cid)
    {
        $result = DB::query('SELECT type FROM photos_rates_contest WHERE user_id=:uid AND photo_id=:pid AND contest_id=:id', array(':uid' => $user_id, ':pid' => $pid, ':id'=>$cid));
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

    public static function count($pid, $cid) {
        $result = DB::query('SELECT * FROM photos_rates_contest WHERE photo_id=:pid AND contest_id=:id', array(':pid' => $pid, ':id'=>$cid));
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

}
?>
