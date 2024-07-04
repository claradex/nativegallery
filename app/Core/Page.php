<?php

namespace App\Core;

class Page
{
    private static $cache = [];

    public static function component($name)
    {
        if (!isset(self::$cache[$name])) {
            self::$cache[$name] = require_once($_SERVER['DOCUMENT_ROOT'] . '/views/components/' . $name . '.php');
        }

        return self::$cache[$name];
    }

    public static function rewrite($search, $replace, $rootUrl)
    {
        return str_ireplace($search, $replace, $rootUrl);
    }

    public static function set($name)
    {
            if (!isset(self::$cache[$name])) {
                self::$cache[$name] = require_once($_SERVER['DOCUMENT_ROOT'] . '/views/pages/' . $name . '.php');
            }

            return self::$cache[$name];
    }

    public static function render($name)
    {
        return self::set($name)();
    }

    public static function method()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function exists($name)
    {
        return file_exists($_SERVER['DOCUMENT_ROOT'] . '/views/pages/' . $name . '.php');
    }
}
