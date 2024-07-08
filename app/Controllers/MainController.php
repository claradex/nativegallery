<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class MainController
{
    public static function t()
    {
       Page::set('t');
    }
  
    public static function i()
    {
       Page::set('Main');
       
    }
    public static function about()
    {
       Page::set('About');
       
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