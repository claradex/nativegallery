<?php

namespace App\Controllers\Api\Users;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};
use \App\Core\Page;

class Search
{
    public function __construct()
    {
        $query = $_GET['q'];
        $users = DB::query('SELECT * FROM users WHERE (LOWER(username) LIKE :username) LIMIT 10', array(':username' => '%' . $query . '%'));
        foreach ($users as $u) {
            $result[] = [
                'id' => $u['id'],
                'username' => $u['username'],
                'photourl' => $u['photourl'],
            ];
        }
        echo json_encode($result);
    }
}
