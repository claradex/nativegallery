<?php

namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class VehicleController
{
    public static function i()
    {
        Page::set('Vehicle/Index');
    }
    public static function iedit()
    {
        Page::set('Vehicle/IndexEdit');
    }
    public static function dbedit()
    {
        Page::set('Vehicle/DBEdit');
    }
}
