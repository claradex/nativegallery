<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;
use \App\Controllers\Api\{Login, Register};
use \App\Controllers\Api\Subscribe as SubscribeUser;
use \App\Controllers\Api\Images\{Upload};
use \App\Controllers\Api\Images\Rate as PhotoVote;
use \App\Controllers\Api\Images\Compress as PhotoCompress;
use \App\Controllers\Api\Images\CheckAll as PhotoCheckAll;
use \App\Controllers\Api\Images\LoadRecent as PhotoLoadRecent;
use \App\Controllers\Api\Images\Stats as PhotoStats;
use \App\Controllers\Api\Images\Comments\Create as PhotoComment;
use \App\Controllers\Api\Images\Comments\Load as PhotoCommentLoad;
use \App\Controllers\Api\Images\Comments\Rate as PhotoCommentVote;
use \App\Controllers\Api\Profile\Update as ProfileUpdate;
use \App\Controllers\Api\Users\LoadUser as UserLoad;
use \App\Controllers\Api\Admin\Images\SetVisibility as AdminPhotoSetVisibility;
use \App\Controllers\Api\Admin\CreateNews as AdminCreateNews;
use \App\Controllers\Api\Admin\LoadNews as AdminLoadNews;
class ApiController
{

  
    public static function login() {
        return new Login();
    }
    public static function register() {
        return new Register();
    }
    public static function upload() {
        return new Upload();
    }
    public static function photovote() {
        return new PhotoVote();
    }
    public static function photocomment() {
        return new PhotoComment();
    }
    public static function photocommentvote() {
        return new PhotoCommentVote();
    }
    public static function photocommentload() {
        return new PhotoCommentLoad();
    }
    public static function updateprofile() {
        return new ProfileUpdate();
    }
    public static function photocompress() {
        return new PhotoCompress();
    }
    public static function adminsetvis() {
        return new AdminPhotoSetVisibility();
    }
    public static function subscribeuser() {
        return new SubscribeUser();
    }
    public static function checkallphotos() {
        return new PhotoCheckAll();
    }
    public static function recentphotos() {
        return new PhotoLoadRecent();
    }
    public static function loaduser() {
        return new UserLoad();
    }
    public static function photostats() {
        return new PhotoStats();
    }
    public static function admincreatenews() {
        return new AdminCreateNews();
    }
    public static function adminloadnews() {
        return new AdminLoadNews();
    }


}