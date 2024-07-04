<?php

namespace App\Services;

use \App\Services\DB;
use App\Services\Auth;
use \App\Services\Router;
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class Json
{
    public function __invoke()
    {
    }

    public static function check($params)
    {
        return json_decode($params, true);
    }
    public static function return($params = array())
    {
        return json_encode($params);
    }
}