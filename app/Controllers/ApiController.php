<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class MainController
{
    public function __invoke()
    {
        

    }

  
    public static function i()
    {
       
    }

    public static function logout()
    {
        DB::query('DELETE FROM login_tokens WHERE servicekey=:userid', array(':userid'=>$_COOKIE['NGALLERYSERVICE']));
        setcookie('NGALLERYSERVICE', '', 1);
        setcookie('NGALLERYSESS', '', 1);
        setcookie('NGALLERYSESS_', '', 1);
        setcookie('NGALLERYID', '', 1);
        header('Location: /');
    }

}