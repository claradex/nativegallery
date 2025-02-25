<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};

class LoginController extends NGController
{

    public function i()
    {
        if (Auth::userid() > 0) {
            Router::redirect('/');
        } else{
            $this->render('System/Login');
        }
    }


}