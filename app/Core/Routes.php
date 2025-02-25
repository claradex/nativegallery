<?php

namespace App\Core;

use \App\Services\{Router, Auth, DB};
use \App\Core\{Page};


class Routes
{
    public static function init()
    {
        Router::get('/', 'MainController@i');
        Router::get('/robots.txt', 'MainController@robots');
        Router::get('/t', 'MainController@t');
        Router::get('/login', 'LoginController@i');
        Router::get('/register', 'RegisterController@i');
        Router::get('/photo/$id', 'PhotoController@i');
        Router::get('/author/$id', 'ProfileController@i');
        Router::get('/page/$id', 'MainController@page');
        Router::post('/api/login', 'ApiController@login');
        Router::post('/api/register', 'ApiController@register');
        Router::get('/api/photo/stats', 'ApiController@photostats');
        Router::get('/about', 'MainController@about');
        Router::get('/rules', 'MainController@rules');
        Router::get('/rules/pub', 'MainController@publicationRules');
        Router::get('/rules/photo', 'MainController@photoRules');
        Router::get('/rules/video', 'MainController@videoRules');
        Router::get('/feed', 'MainController@feed');
        Router::get('/tour', 'MainController@tour');
        Router::get('/update', 'MainController@update');
        Router::get('/top30', 'MainController@top30');
        Router::get('/photoext', 'PhotoController@photoext');
        Router::get('/api/photo/compress', 'ApiController@photocompress');
        Router::get('/api/photo/loadrecent', 'ApiController@recentphotos');
        Router::get('/api/users/load/$id', 'ApiController@loaduser');
        Router::get('/api/users/emailverify', 'ApiController@emailverify');
        Router::get('/article/$id', 'MainController@gallery');
        Router::get('/voting', 'ContestsController@index');
        Router::get('/voting/results', 'ContestsController@results');
        Router::get('/voting/waiting', 'ContestsController@waiting');
        Router::get('/comments', 'MainController@comments');
        Router::get('/messages', 'MessagesController@i');
        if (Auth::userid() > 0) {
            $user = new \App\Models\User(Auth::userid());

            Router::get('/lk', 'ProfileController@lk');
            Router::get('/lk/upload', 'ProfileController@upload');
            Router::get('/lk/history', 'ProfileController@lkhistory');
            Router::get('/lk/profile', 'ProfileController@lkprofile');
            Router::get('/lk/pday', 'ProfileController@photoindexhistory');
            Router::get('/fav_authors', 'MainController@favauthors');

            Router::get('/search', 'SearchController@i');

            Router::get('/fav', 'MainController@fav');
            Router::get('/voting/sendpretend', 'ContestsController@sendpretend');

            Router::get('/vehicle/edit', 'VehicleController@iedit');
            Router::get('/vehicle/dbedit', 'VehicleController@dbedit');
            Router::post('/api/upload', 'ApiController@upload');
            Router::post('/api/profile/update', 'ApiController@updateprofile');
            Router::post('/api/photo/comment', 'ApiController@photocomment');
            Router::get('/api/photo/$id/favorite', 'ApiController@photofavorite');
            Router::get('/api/subscribe', 'ApiController@subscribeuser');
            Router::post('/api/photo/getcomments/$id', 'ApiController@photocommentload');
            Router::get('/api/photo/vote', 'ApiController@photovote');
            Router::get('/api/photo/checkall', 'ApiController@checkallphotos');
            Router::get('/api/photo/comment/rate', 'ApiController@photocommentvote');
            Router::post('/api/photo/comment/$id/edit', 'ApiController@photocommentedit');
            Router::post('/api/photo/comment/$id/delete', 'ApiController@photocommentdelete');
            Router::post('/api/photo/comment/$id/pin', 'ApiController@photocommentpin');
            Router::post('/api/photo/contests/sendpretend', 'ApiController@sendpretendphoto');
            Router::get('/api/photo/contests/rate', 'ApiController@photovotecontest');
            Router::get('/api/contests/getinfo', 'ApiController@contestsgetinfo');
            Router::get('/api/vehicles/load', 'ApiController@vehiclesload');
            Router::get('/api/geodb/search', 'ApiController@geodbsearch');
            if ($user->i('admin') > 0) {
                Router::any('/admin', 'AdminController@index');
                Router::any('/api/admin/images/setvisibility', 'ApiController@adminsetvis');
                Router::any('/api/admin/createnews', 'ApiController@admincreatenews');
                Router::any('/api/admin/loadnews', 'ApiController@adminloadnews');
                Router::any('/api/admin/getvehicleinputs/$id', 'ApiController@admingetvehicleinputs');
                Router::any('/api/admin/geodb/create', 'ApiController@admingeodbcreate');
                Router::any('/api/admin/geodb/load', 'ApiController@admingeodbload');
                Router::any('/api/admin/contests/createtheme', 'ApiController@admincontestscreatetheme');
                Router::any('/api/admin/contests/create', 'ApiController@admincontestscreate');
                Router::any('/api/admin/settings/taskmanager', 'ApiController@admintaskmanager');
            }
            Router::get('/logout', 'MainController@logout');
            Router::get('/404', 'ExceptionRegister@notfound');
        } else {
            Router::redirect('/login?return='.$_SERVER['HTTP_REFERER']);
        }
        Router::get('/vehicle/$id', 'VehicleController@i');
    }
}
