<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;
use \App\Controllers\Api\{Login, Register};
class ApiController
{

  
    public static function login() {
        return new Login();
    }
    public static function register() {
        return new Register();
    }

}