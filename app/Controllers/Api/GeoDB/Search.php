<?php

namespace App\Controllers\Api\GeoDB;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF, Date};
use App\Models\{User, Vote, Photo};

class Search
{
    public function __construct()
    {
        $query = $_GET['place'];

        if ($query) {
            $addresses = DB::query('SELECT title FROM geodb WHERE LOWER(title) LIKE LOWER(:query)', array(':query' => "%$query%"));

            $titles = array_map(function($address) {
                return $address['title'];
            }, $addresses);

            echo json_encode($titles, JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(["error" => "No query provided"], JSON_UNESCAPED_UNICODE);
        }
    }
}
