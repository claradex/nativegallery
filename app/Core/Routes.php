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
        Router::post('/api/login', 'ApiController@login');
        Router::post('/api/register', 'ApiController@register');
        Router::get('/api/photo/stats', 'ApiController@photostats');
        Router::get('/about', 'MainController@about');
        Router::get('/rules', 'MainController@rules');
        Router::get('/vehicle', 'MainController@vehicle');
        Router::get('/rules/pub', 'MainController@publicationRules');
        Router::get('/rules/photo', 'MainController@photoRules');
        Router::get('/rules/video', 'MainController@videoRules');
        Router::get('/update', 'MainController@update');
        Router::get('/top30', 'MainController@top30');
        Router::get('/photoext', 'PhotoController@photoext');
        Router::get('/api/photo/compress', 'ApiController@photocompress');
        Router::get('/api/photo/loadrecent', 'ApiController@recentphotos');
        Router::get('/api/users/load/$id', 'ApiController@loaduser');


        if (Auth::userid() > 0) {
            $user = new \App\Models\User(Auth::userid());
            Router::get('/lk', 'ProfileController@lk');
            Router::get('/lk/upload', 'ProfileController@upload');
            Router::get('/lk/history', 'ProfileController@lkhistory');
            Router::get('/lk/profile', 'ProfileController@lkprofile');

            Router::get('/fav_authors', 'MainController@favauthors');

            Router::get('/search', 'SearchController@i');

            Router::post('/api/upload', 'ApiController@upload');
            Router::post('/api/profile/update', 'ApiController@updateprofile');
            Router::post('/api/photo/comment', 'ApiController@photocomment');
            Router::get('/api/subscribe', 'ApiController@subscribeuser');
            Router::post('/api/photo/getcomments/$id', 'ApiController@photocommentload');
            Router::get('/api/photo/vote', 'ApiController@photovote');
            Router::get('/api/photo/checkall', 'ApiController@checkallphotos');
            Router::get('/api/photo/comment/rate', 'ApiController@photocommentvote');
            if ($user->i('admin') > 0) {
                Router::any('/admin', 'AdminController@index');
                Router::any('/api/admin/images/setvisibility', 'ApiController@adminsetvis');
                Router::any('/api/admin/createnews', 'ApiController@admincreatenews');
                Router::any('/api/admin/loadnews', 'ApiController@adminloadnews');
            }
            Router::get('/logout', 'MainController@logout');
            Router::get('/404', 'ExceptionRegister@notfound');
        } else {
            Router::redirect('/login?return='.$_SERVER['HTTP_REFERER']);
        }
    }
}
