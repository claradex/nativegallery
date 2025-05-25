<?php

namespace App\Services;

use \App\Core\Page;

class Router
{

    protected static $routes = [];


    private static function addRoute($method, $route)
    {
        self::$routes[] = [
            'method' => $method,
            'path' => $route
        ];
    }
    public static function get($route, $path_to_include)
    {
        self::addRoute('GET', $route);
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            self::route($route, $path_to_include);
        }
    }
    public static function post($route, $path_to_include)
    {
        self::addRoute('POST', $route);
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            self::route($route, $path_to_include);
        }
    }
    public static function put($route, $path_to_include)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
            self::route($route, $path_to_include);
        }
    }
    public static function patch($route, $path_to_include)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'PATCH') {
            self::route($route, $path_to_include);
        }
    }
    public static function delete($route, $path_to_include)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            self::route($route, $path_to_include);
        }
    }
     public static function getRouteSegments()
    {
        $segments = [];
        foreach (self::$routes as $route) {
            $parts = explode('/', $route['path']);
            foreach ($parts as $part) {
                if (!empty($part) && !str_starts_with($part, '$')) {
                    $segments[] = $part;
                }
            }
        }
        return array_unique($segments);
    }
    public static function any($route, $path_to_include)
    {
        self::addRoute('ANY', $route);
        self::route($route, $path_to_include);
    }
    public static function route($route, $path_to_include)
    {
        $root = $_SERVER['DOCUMENT_ROOT'];

        // Обработка случая, когда маршрут - 404
        if ($route == "/404") {
            self::includeControllerMethod($path_to_include);
            exit();
        }

        // Получение URL-адреса запроса и разделение его на части
        $request_url = strtok(filter_var($_SERVER['REQUEST_URI'], FILTER_SANITIZE_URL), '?');
        $request_url_parts = explode('/', rtrim($request_url, '/'));
        $route_parts = explode('/', $route);
        array_shift($route_parts);
        array_shift($request_url_parts);

        // Обработка корневого маршрута
        if ($route_parts[0] == '' && count($request_url_parts) == 0) {
            self::includeControllerMethod($path_to_include);
            $file_path = $root . '/app/Controllers/' . $controller . '.php';
            $file_size = filesize($file_path);
            header("Content-Length: $file_size");
            exit();
        }

        // Проверка соответствия количества частей маршрута и запроса
        if (count($route_parts) !== count($request_url_parts)) {
            return;
        }

        // Обработка параметров маршрута
        $parameters = [];
        foreach ($route_parts as $index => $route_part) {
            if (preg_match("/^[$]/", $route_part)) {
                $route_part = ltrim($route_part, '$');
                $parameters[] = $request_url_parts[$index];
                $$route_part = $request_url_parts[$index];
                global $$route_part;
            } elseif ($route_part !== $request_url_parts[$index]) {
                return;
            }
        }

        // Включение контроллера и вызов метода
        self::includeControllerMethod($path_to_include);
        exit();
    }

    // Функция для включения контроллера и вызова метода
    private static function includeControllerMethod($path_to_include)
    {
        list($controller, $method) = explode('@', $path_to_include);
        $controller = '\App\Controllers\\' . $controller;
        $objectController = new $controller;
        $objectController->$method();
    }


    private static function out($text)
    {
        echo htmlspecialchars($text);
    }
    private static function set_csrf()
    {
        if (!isset($_SESSION["csrf"])) {
            $_SESSION["csrf"] = bin2hex(random_bytes(50));
        }
        echo '<input type="hidden" name="csrf" value="' . $_SESSION["csrf"] . '">';
    }
    private static function is_csrf_valid()
    {
        if (!isset($_SESSION['csrf']) || !isset($_POST['csrf'])) {
            return false;
        }
        if ($_SESSION['csrf'] != $_POST['csrf']) {
            return false;
        }
        return true;
    }


    private static function notfound()
    {
        Page::set('Errors/404');
    }

    public static function redirect($page)
    {
        header("Location: {$page}");
    }

    public static function method()
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function ip()
    {
        $fields = array(
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_SUCURI_CLIENTIP',
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR',
            // more custom fields
        );

        foreach ($fields as $ip_field) {
            if (!empty($_SERVER[$ip_field])) {
                return $_SERVER[$ip_field];
            }
        }

        return null;
    }

    public static function checkCurl($url)
    {
        $user_agent = 'Mozilla/5.0 (Windows NT 6.1; rv:8.0) Gecko/20100101 Firefox/8.0';
        $options = array(

            CURLOPT_CUSTOMREQUEST  => "GET",        //set request type post or get
            CURLOPT_POST           => false,        //set to GET
            CURLOPT_USERAGENT      => $user_agent, //set user agent
            CURLOPT_COOKIE         => "BIRUXSESS_=1;KANDLESERVICETOKEN__779hfh908BNol8FHn7d9MNFOL8fjND8D9MNfdo=BIRUXSERVICE__TOKENYY", //set cookie file
            CURLOPT_RETURNTRANSFER => true,     // return web page
            CURLOPT_HEADER         => false,    // don't return headers
            CURLOPT_FOLLOWLOCATION => true,     // follow redirects
            CURLOPT_ENCODING       => "",       // handle all encodings
            CURLOPT_AUTOREFERER    => true,     // set referer on redirect
            CURLOPT_CONNECTTIMEOUT => 120,      // timeout on connect
            CURLOPT_TIMEOUT        => 120,      // timeout on response
            CURLOPT_MAXREDIRS      => 10,       // stop after 10 redirects
            CURLOPT_RETURNTRANSFER => 1
        );

        $ch      = curl_init($url);
        curl_setopt_array($ch, $options);
        $output = curl_exec($ch);
        $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpcode;
    }
}