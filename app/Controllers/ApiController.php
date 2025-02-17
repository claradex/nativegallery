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
use \App\Controllers\Api\Images\Favorite as PhotoFavorite;
use \App\Controllers\Api\Images\Stats as PhotoStats;
use \App\Controllers\Api\Images\Comments\Create as PhotoComment;
use \App\Controllers\Api\Images\Comments\Edit as PhotoCommentEdit;
use \App\Controllers\Api\Images\Comments\Delete as PhotoCommentDelete;
use \App\Controllers\Api\Images\Comments\Pin as PhotoCommentPin;
use \App\Controllers\Api\Images\Comments\Load as PhotoCommentLoad;
use \App\Controllers\Api\Images\Comments\Rate as PhotoCommentVote;
use \App\Controllers\Api\Images\Contests\SendPretend as PhotoContestsSendPretend;
use \App\Controllers\Api\Images\Contests\Rate as PhotoContestsRate;
use \App\Controllers\Api\Contests\GetInfo as ContestsGetInfo;
use \App\Controllers\Api\GeoDB\Search as GeoDBSearch;
use \App\Controllers\Api\Vehicles\Load as VehiclesLoad;
use \App\Controllers\Api\Profile\Update as ProfileUpdate;
use \App\Controllers\Api\Users\LoadUser as UserLoad;
use \App\Controllers\Api\Users\EmailVerify as EmailVerify;
use \App\Controllers\Api\Admin\Images\SetVisibility as AdminPhotoSetVisibility;
use \App\Controllers\Api\Admin\CreateNews as AdminCreateNews;
use \App\Controllers\Api\Admin\LoadNews as AdminLoadNews;
use \App\Controllers\Api\Admin\GetVehicleInputs as AdminGetVehicleInputs;
use \App\Controllers\Api\Admin\GeoDB\Create as AdminGeoDBCreate;
use \App\Controllers\Api\Admin\GeoDB\Load as AdminGeoDBLoad;
use \App\Controllers\Api\Admin\GeoDB\Delete as AdminGeoDBDelete;
use \App\Controllers\Api\Admin\Contests\CreateTheme as AdminContestsCreateTheme;
use \App\Controllers\Api\Admin\Contests\Create as AdminContestsCreate;
use \App\Controllers\Api\Admin\Settings\TaskManager as AdminTaskManager;

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
    public static function emailverify() {
        return new EmailVerify();
    }
    public static function photovote() {
        return new PhotoVote();
    }
    public static function photovotecontest() {
        return new PhotoContestsRate();
    }
    public static function photofavorite() {
        return new PhotoFavorite();
    }
    public static function photocomment() {
        return new PhotoComment();
    }
    public static function photocommentedit() {
        return new PhotoCommentEdit();
    }
    public static function photocommentdelete() {
        return new PhotoCommentDelete();
    }
    public static function photocommentpin() {
        return new PhotoCommentPin();
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
    public static function geodbsearch() {
        return new GeoDBSearch();
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
    public static function sendpretendphoto() {
        return new PhotoContestsSendPretend();
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
    public static function admingetvehicleinputs() {
        return new AdminGetVehicleInputs();
    }
    public static function admincontestscreatetheme() {
        return new AdminContestsCreateTheme();
    }
    public static function admincontestscreate() {
        return new AdminContestsCreate();
    }
    public static function admingeodbcreate() {
        return new AdminGeoDBCreate();
    }
    public static function admingeodbload() {
        return new AdminGeoDBLoad();
    }
    public static function admingeodbdelete() {
        return new AdminGeoDBDelete();
    }
    public static function admintaskmanager() {
        return new AdminTaskManager();
    }
    public static function vehiclesload() {
        return new VehiclesLoad();
    }
    public static function contestsgetinfo() {
        return new ContestsGetInfo();
    }


}