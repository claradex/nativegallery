<?php

namespace App\Controllers\Api\Admin\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class SetVisibility
{
    public function __construct()
    {
        DB::query('UPDATE photos SET moderated=:mod WHERE id=:id', array(':id'=>$_GET['id'], ':mod'=>$_GET['mod']));
        header('Location: ' . $_SERVER['HTTP_REFERER']);
    }
}