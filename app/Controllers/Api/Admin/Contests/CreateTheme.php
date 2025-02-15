<?php

namespace App\Controllers\Api\Admin\Contests;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class CreateTheme
{
    public function __construct()
    {
        if ($_POST['active'] === "1") {
            $status = 1;
        } else {
            $status = 0;
        }
        DB::query('INSERT INTO contests_themes VALUES (\'0\', :title, :status)', array(':title' => $_POST['body'], ':status' => $status));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
