<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class RegisterController extends NGController
{

  
    public function i()
    {
        if (Auth::userid() > 0) {
            Router::redirect('/');
        } else{
            $this->render('System/Register');
        }
    }


}