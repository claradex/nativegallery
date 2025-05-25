<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class ProfileController
{

    static $file = 'Index';

    public function __construct()
    {
        if (isset($_GET['type'])) {
            switch (Page::exists('Profile/LK/Profile/' . $_GET['type'])) {
                case true:
                    self::$file = $_GET['type'];
                    break;
                case false:
                    self::$file = 'Index';
                    break;
            }
        } else {
            self::$file = 'Index';
        }
    }
    
     public static function loadContent()
    {
        $fileName = $_GET['type'];


        $filePath = $_SERVER['DOCUMENT_ROOT'] . '/views/pages/Profile/LK/Profile/' . $fileName . '.php';

        if (file_exists($filePath)) {
            Page::set('Profile/LK/Profile/' . self::$file);
        } else {
            Page::set('Profile/LK/Profile/Index');
        }
    }
  
    public static function lk()
    {
       Page::set('Profile/LK/Index');
    }
    public static function i()
    {
       Page::set('Profile/Index');
    }
    public static function photoindexhistory()
    {
       Page::set('Profile/LK/PhotoIndexHistory');
       
    }
    public static function upload()
    {
       Page::set('Profile/UploadPhoto');
    }
    public static function lkhistory()
    {
       Page::set('Profile/LK/History');
    }
    public static function lkprofile()
    {
       Page::set('Profile/LK/Profile');
    }
    public static function editphoto()
    {
       Page::set('Profile/LK/EditImage');
    }


}