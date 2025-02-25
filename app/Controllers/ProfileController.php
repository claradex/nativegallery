<?php

namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class ProfileController extends NGController
{

   private array $params = [];
   protected array $problems = [];

   public function lk()
   {
      $this->render('Profile/LK/Index');
   }
   public function i()
   {
      $profile_id = explode('/', $_SERVER['REQUEST_URI'])[2];
      $this->params['userprofile'] = new \App\Models\User($profile_id);
      if (explode('/', $_SERVER['REQUEST_URI'])[2] && (int)$this->params['userprofile']->i('id') === (int)$profile_id) {
         $this->params['profile_id'] = explode('/', $_SERVER['REQUEST_URI'])[2];
         if ($this->params['userprofile']->i('status') > 0) {
            $this->params['status'] = $this->params['userprofile']->i('status');
            $this->render('Errors/UserDeactivated', $this->params);
         } else {
            $this->render('Profile/Index', $this->params);
         }
      } else {
         $this->render('Errors/UserNotFound');
      }
   }
   public static function photoindexhistory()
   {
      Page::set('Profile/LK/PhotoIndexHistory');
   }
   public function upload()
   {
      $user = new \App\Models\User(Auth::userid());
      $this->params['user'] = $user;
      if (NGALLERY['root']['registration']['emailverify'] != false || $user->i('status') === 3) {
         $problems[] = 'Чтобы публиковать медиафайлы, нужно подтвердить электронную почту.';
         $this->params['problems'] = $problems;
         $this->render('Errors/PublicProblems', $this->params);
      } else {
         $this->render('Profile/UploadPhoto');
      }
   }
   public static function lkhistory()
   {
      Page::set('Profile/LK/History');
   }
   public static function lkprofile()
   {
      Page::set('Profile/LK/Profile');
   }
}
