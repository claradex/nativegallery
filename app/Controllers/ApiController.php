<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;
use \App\Controllers\Api\{Login, Register};
use \App\Controllers\Api\Images\{Upload};
use \App\Controllers\Api\Images\Rate as PhotoVote;
use \App\Controllers\Api\Images\Comment as PhotoComment;
use \App\Controllers\Api\Images\CommentsLoad as PhotoCommentLoad;
use \App\Controllers\Api\Profile\Update as ProfileUpdate;
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
    public static function photocommentload() {
        return new PhotoCommentLoad();
    }
    public static function updateprofile() {
        return new ProfileUpdate();
    }


}