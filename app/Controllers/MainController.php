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
    public static function rules()
    {
       Page::set('Rules');
    }
    public static function publicationRules()
    {
       Page::set('PublicationRules');
    }
    public static function photoRules()
    {
       Page::set('PhotoRules');
    }
    public static function videoRules()
    {
      $_GLOBAL['rules'] = '/config/videoRules.html';
      $_GLOBAL['title'] = 'Правила видеотеки';
       Page::set('Rules');
    }
    public static function update()
    {
       Page::set('Update');
       
    }
    public static function top30()
    {
       Page::set('Top30');
       
    }
    public static function favauthors()
    {
       Page::set('FavAuthors');
       
    }
    public static function robots() {
      echo 'User-Agent: *
Disallow: /lk/
Clean-Param: vid&gid&upd /photo/
Host: https://'.$_SERVER['SERVER_NAME'];
header("Content-Type: text/plain");
    }


    public static function logout()
    {
        DB::query('DELETE FROM login_tokens WHERE token=:userid', array(':userid'=>$_COOKIE['NGALLERYSESS']));
        setcookie('NGALLERYSERVICE', '', 1);
        setcookie('NGALLERYSESS', '', 1);
        setcookie('NGALLERYSESS_', '', 1);
        setcookie('NGALLERYID', '', 1);
        header('Location: /');
    }

}