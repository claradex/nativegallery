<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class PhotoController
{

  
    public static function i()
    {
       Page::set('Photo');
    }
    public static function photoext()
    {
       Page::set('PhotoExt');
       
    }


}