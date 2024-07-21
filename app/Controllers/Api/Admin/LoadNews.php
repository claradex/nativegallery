<?php

namespace App\Controllers\Api\Admin;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF, Date};
use App\Models\{User, Vote, Photo};


class LoadNews
{
    public function __construct()
    {
        $news = DB::query('SELECT * FROM news ORDER BY id');
        foreach ($news as $n) {
            echo '<div class="card mb-3"><div class="card-body">' . Date::zmdate($n['time']) . '<br>' . $n['body'] . '</div></div>';
        }
    }
}
