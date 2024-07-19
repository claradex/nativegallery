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
      $_GLOBAL['rules'] = '/config/rules.html';
      $_GLOBAL['title'] = 'Правила сайта';
       Page::set('Rules');
    }
    public static function publicationRules()
    {
      $_GLOBAL['rules'] = '/config/publicationRules.html';
      $_GLOBAL['title'] = 'Правила отбора фотографий';
       Page::set('Rules');
    }
    public static function photoRules()
    {
      $_GLOBAL['rules'] = '/config/photoRules.html';
      $_GLOBAL['title'] = 'Правила подписи фотографий';
       Page::set('Rules');
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