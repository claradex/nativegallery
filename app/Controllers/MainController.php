<?php

namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class MainController extends NGController
{
   public function t()
   {
      $this->render('t');
   }

   public function i()
   {
      $this->render('System/Main');
   }
   public static function page()
   {
      Page::set('Page');
   }
   public function about()
   {
      $this->render('System/About');
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
      Page::set('VideoRules');
   }
   public static function update()
   {
      Page::set('Update');
   }
   public function top30()
   {
      $this->render('Top30');
   }
   public static function feed()
   {
      Page::set('Feed');
   }
   public static function fav()
   {
      Page::set('Fav');
   }
   public static function gallery()
   {
      Page::set('Gallery');
   }
   public static function favauthors()
   {
      Page::set('FavAuthors');
   }
   public static function emailverify()
   {
      Page::set('Errors/EmailVerify');
   }
   public static function comments()
   {
      Page::set('Comments/Index');
   }
   public static function tour()
   {
      Page::set('Tour');
   }
   public static function robots()
   {
      echo 'User-Agent: *
Disallow: /lk/
Clean-Param: vid&gid&upd /photo/
Host: https://' . $_SERVER['SERVER_NAME'];
      header("Content-Type: text/plain");
   }


   public static function logout()
   {
      DB::query('DELETE FROM login_tokens WHERE token=:userid', array(':userid' => $_COOKIE['NGALLERYSESS']));
      setcookie('NGALLERYSERVICE', '', 1);
      setcookie('NGALLERYSESS', '', 1);
      setcookie('NGALLERYSESS_', '', 1);
      setcookie('NGALLERYID', '', 1);
      header('Location: /');
   }
}
