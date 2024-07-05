<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class ProfileController
{

  
    public static function lk()
    {
       Page::set('Profile/LK');
    }
    public static function i()
    {
       Page::set('Profile/Index');
    }
    public static function upload()
    {
       Page::set('Profile/UploadPhoto');
    }


}