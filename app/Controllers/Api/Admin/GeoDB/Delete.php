<?php

namespace App\Controllers\Api\Admin\GeoDB;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class Delete
{
    public function __construct()
    {
        DB::query('DELETE FROM geodb WHERE id=:id', array(':id' => $_GET['id']));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
