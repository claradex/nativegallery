<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class AdminController extends NGController
{
    static $file = 'General';

    public function __construct()
    {
        if (isset($_GET['type'])) {
            switch (Page::exists('Admin/' . $_GET['type'])) {
                case true:
                    self::$file = $_GET['type'];
                    break;
                case false:
                    self::$file = 'General';
                    break;
            }
        } else {
            self::$file = 'General';
        }
    }


    public static function loadMenu()
    {
        Page::component('AdminSidebar');
    }

    public static function index()

    {

        Page::set('Admin/Index');
    }
    public static function loadContent() {
        $fileName = $_GET['type'];
    
    
            $filePath = $_SERVER['DOCUMENT_ROOT'].'/views/pages/Admin/' . $fileName.'.php';
    
            if (file_exists($filePath)) {
                Page::set('Admin/' . self::$file);
            } else {
                Page::set('Admin/General');
            }
        
        }

}