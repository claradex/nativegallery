<?php
namespace App\Controllers;
use \App\Services\{DB, Json};
use \App\Core\Router;
use \App\Core\Page;

class ExceptionRegister
{
    public static function resolve($httpcode, $corecode) {
        return Page::set('Errors/'.$corecode);

    }

    public static function notfound() {
        Page::set('Errors/404');
    }

    

}