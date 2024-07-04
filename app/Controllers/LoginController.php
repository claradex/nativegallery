<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class LoginController
{

  
    public static function i()
    {
       Page::set('Login');
    }


}