<?php

namespace App\Controllers\Api\Images\Contests;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class Rate
{
    public function __construct()
    {
        $count = 3;
        $uservotes = DB::query('SELECT COUNT(*) FROM contests_rates WHERE user_id=:uid AND contest_id=:cid', array(':uid' => Auth::userid(), ':cid' => $_GET['kid']))[0]['COUNT(*)'];
        $countvotes = $count - $uservotes;
        $contest = DB::query('SELECT * FROM contests WHERE id=:id', array(":id" => $_GET['kid']))[0];
        $photo = new Photo($_GET['pid']);
        if ($contest['status'] != 2) {
            exit;
        }
        if ($photo->i('on_contest') != 1 && $photo->i('contest_id') != $_GET['kid']) {
            exit;
        }
        if ((int)DB::query('SELECT photo_id FROM contests_rates WHERE photo_id=:pid AND user_id=:uid AND contest_id=:cid', array(':uid' => Auth::userid(), ':pid' => $_GET['pid'], ':cid' => $_GET['kid']))[0]['photo_id'] === (int)$_GET['pid']) {
            DB::query('DELETE FROM contests_rates WHERE user_id=:uid AND photo_id=:pid AND contest_id=:cid', array(':pid' => $_GET['pid'], ':uid' => Auth::userid(), ':cid' => $_GET['kid']));
            $status = 0;
            $newval = $countvotes + 1;
        } else {
            $newval = $countvotes - 1;
            if ($newval >= 0) {
                DB::query('INSERT INTO contests_rates VALUES (\'0\', :pid, :uid, :cid)', array(':pid' => $_GET['pid'], ':uid' => Auth::userid(), ':cid' => $_GET['kid']));
                $status = 1;
            }
        }
        if ($newval < 0) {
            $text = 'Вы можете выбрать максимум 3 фотографии.';
        } else if ($newval === 0) {
            $text = 'Вы выбрали 3 фотографии. Спасибо за голосование!';
        } else {
            $text = "Вы можете выбрать ещё {$newval} фото.";
        }
        echo '[{"' . $_GET['pid'] . '":'.$status.'},"' . $text . '"]';
    }
}
