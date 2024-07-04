<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class RegisterController
{

  
    public static function i()
    {
       Page::set('Register');
    }


}