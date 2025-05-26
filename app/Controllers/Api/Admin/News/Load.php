<?php

namespace App\Controllers\Api\Admin\News;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF, Date};
use App\Models\{User, Vote, Photo};


class Load
{
    public function __construct()
    {
        $news = DB::query('SELECT * FROM news ORDER BY id');
        foreach ($news as $n) {
            $nn = new \App\Models\Admin\News($n['id']);
            $nn->view();
        }
    }
}
