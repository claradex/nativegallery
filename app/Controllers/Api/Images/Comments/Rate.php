<?php

namespace App\Controllers\Api\Images\Comments;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class Rate
{
    public function __construct()
    {

        if (isset($_GET['vote']) && isset($_GET['wid'])) {
            if (Vote::comment(Auth::userid(), $_GET['wid']) === -1) {
                DB::query('INSERT INTO photos_comments_rates VALUES (\'0\', :id, :wid, :type)', array(':id'=>Auth::userid(), ':wid' => $_GET['wid'], ':type'=>$_GET['vote']));
                if (Vote::comment(Auth::userid(), $_GET['wid']) != $_GET['vote']) {
                    DB::query('DELETE FROM photos_comments_rates WHERE user_id=:id AND comment_id=:wid AND type=:type', array(':id'=>Auth::userid(), ':wid' => $_GET['wid'], ':type'=>Vote::comment(Auth::userid(), $_GET['wid'])));
                }
            } else if (Vote::comment(Auth::userid(), $_GET['wid']) === (int)$_GET['vote']) {
                DB::query('DELETE FROM photos_comments_rates WHERE user_id=:id AND comment_id=:wid', array(':id'=>Auth::userid(), ':wid' => $_GET['wid']));
            } else {
                DB::query('UPDATE photos_comments_rates SET type=:type WHERE user_id=:id AND comment_id=:wid', array(':id'=>Auth::userid(), ':wid' => $_GET['wid'], ':type'=>$_GET['vote']));
                
            }
            if (Vote::comment(Auth::userid(), $_GET['wid']) === 1) {
                $pos = true;
                $neg = false;
            } else if (Vote::comment(Auth::userid(), $_GET['wid']) === 0) {
                $pos = false;
                $neg = true;
            } else {
                $pos = false;
                $neg = false;
            }
            $array = [
                [1 => $pos, 0 => $neg],
                [1 => Vote::countcommrates($_GET['wid'], 1), 0 => Vote::countcommrates($_GET['wid'], 0)],
                Vote::countcommrates($_GET['wid'], -1)
            ];
            

            $json = json_encode($array);
            

            header('Content-Type: application/json');
            echo $json;
        }
    }
}
