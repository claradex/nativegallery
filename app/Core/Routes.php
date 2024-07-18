<?php

namespace App\Core;

use \App\Services\{Router, Auth, DB};
use \App\Core\{Page};


class Routes
{
    public static function init()
    {
        Router::get('/', 'MainController@i');
        Router::get('/t', 'MainController@t');
        Router::get('/login', 'LoginController@i');
        Router::get('/register', 'RegisterController@i');
        Router::get('/photo/$id', 'PhotoController@i');
        Router::get('/author/$id', 'ProfileController@i');
        Router::post('/api/login', 'ApiController@login');
        Router::post('/api/register', 'ApiController@register');
        Router::get('/about', 'MainController@about');
        Router::get('/rules', 'MainController@rules');




        if (Auth::userid() > 0) {
            $user = new \App\Models\User(Auth::userid());
            Router::get('/lk', 'ProfileController@lk');
            Router::get('/lk/upload', 'ProfileController@upload');
            Router::get('/lk/history', 'ProfileController@lkhistory');
            Router::get('/lk/profile', 'ProfileController@lkprofile');

            Router::get('/search', 'SearchController@i');

            Router::post('/api/upload', 'ApiController@upload');
            Router::post('/api/profile/update', 'ApiController@updateprofile');
            Router::post('/api/photo/comment', 'ApiController@photocomment');
            Router::get('/api/photo/compress', 'ApiController@photocompress');
            Router::post('/api/photo/getcomments/$id', 'ApiController@photocommentload');
            Router::get('/api/photo/vote', 'ApiController@photovote');
            Router::get('/api/photo/comment/rate', 'ApiController@photocommentvote');
            if ($user->i('admin') > 0) {
                Router::any('/admin', 'AdminController@index');
                Router::any('/api/admin/images/setvisibility', 'ApiController@adminsetvis');
            }
            Router::get('/logout', 'MainController@logout');
            Router::get('/404', 'ExceptionRegister@notfound');
        } else {
            Router::redirect('/login?return='.$_SERVER['HTTP_REFERER']);
        }
    }
}
