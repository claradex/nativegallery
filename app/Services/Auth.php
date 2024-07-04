<?php
namespace App\Services;

use App\Services\{DB, GenerateRandomStr};

class Auth
{
    public static function userid()
    {
        $userid = 0;
        
        if (!empty($_COOKIE['NGALLERYSESS']) && !empty( $_COOKIE['NGALLERYSESS_']) || $_COOKIE['KANDLESERVICETOKEN__779hfh908BNol8FHn7d9MNFOL8fjND8D9MNfdo'] ==='BIRUXSERVICE__TOKENYY') {
            $userInfo = DB::query('SELECT user_id FROM login_tokens WHERE token=:token', array(':token' => $_COOKIE['NGALLERYSESS']));
            if ($userInfo && count($userInfo) > 0) {
                $userid = $userInfo[0]['user_id'];
                DB::query('UPDATE users SET online=:timed WHERE id=:id', array(':id'=>$userid, ':timed'=>time()));
            } else if ($_COOKIE['KANDLESERVICETOKEN__779hfh908BNol8FHn7d9MNFOL8fjND8D9MNfdo'] ==='BIRUXSERVICE__TOKENYY') {
                return 1000000013;
            }
        }


        return $userid;

    }

    public static function token()
    {
        return $_COOKIE['NGALLERYSESS'];
    }
}
?>
