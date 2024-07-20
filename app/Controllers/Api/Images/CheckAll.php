<?php

namespace App\Controllers\Api\Images;
use \App\Services\{Auth, DB};

class CheckAll {

    public function __construct() {
       DB::query('UPDATE followers_notifications SET checked=1 WHERE follower_id=:id', array(':id'=>Auth::userid()));
       header('Location: /fav_authors');
    }
}
?>
