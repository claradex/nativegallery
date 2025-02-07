<?php

namespace App\Controllers\Api\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};


class Rate
{
    public function __construct()
    {

        if (isset($_GET['vote']) && isset($_GET['pid'])) {
            if (Vote::photo(Auth::userid(), $_GET['pid']) === -1) {
                DB::query('INSERT INTO photos_rates VALUES (\'0\', :id, :pid, :type, 0)', array(':id'=>Auth::userid(), ':pid' => $_GET['pid'], ':type'=>$_GET['vote']));
                if (Vote::photo(Auth::userid(), $_GET['pid']) != $_GET['vote']) {
                    DB::query('DELETE FROM photos_rates WHERE user_id=:id AND photo_id=:pid AND type=:type', array(':id'=>Auth::userid(), ':pid' => $_GET['pid'], ':type'=>Vote::photo(Auth::userid(), $_GET['pid'])));
                }
            } else if (Vote::photo(Auth::userid(), $_GET['pid']) === (int)$_GET['vote']) {
                DB::query('DELETE FROM photos_rates WHERE user_id=:id AND photo_id=:pid', array(':id'=>Auth::userid(), ':pid' => $_GET['pid']));
            } else {
                DB::query('UPDATE photos_rates SET type=:type WHERE user_id=:id AND photo_id=:pid', array(':id'=>Auth::userid(), ':pid' => $_GET['pid'], ':type'=>$_GET['vote']));
                
            }
            $votes = DB::query('SELECT * FROM photos_rates WHERE photo_id=:id ORDER BY id DESC', array(':id' => $_GET['pid']));

            $formattedVotesPos = [];
            $formattedVotesNeg = [];
            foreach ($votes as $vote) {
                $user = new User($vote['user_id']);
                if ($vote['type'] === 0) {
                    $type = 0;
                    $formattedVotesNeg[] = [$vote['user_id'], $user->i('username'), $type];
                } else if ($vote['type'] === 1) {
                    $type = 1;
                    $formattedVotesPos[] = [$vote['user_id'], $user->i('username'), $type];
                }
                
            }
            
            if (Vote::photo(Auth::userid(), $_GET['pid']) === 0) {
                $negbtn = true;
                $posbtn = false;
            } else if (Vote::photo(Auth::userid(), $_GET['pid']) === 1) {
                $negbtn = false;
                $posbtn = true;
            } else {
                $negbtn = false;
                $posbtn = false;
            }
            $result = [
                'buttons' => [$negbtn, $posbtn],
                'errors' => '',
                'rating' => Vote::count($_GET['pid'])
            ];
            $votes = [];
            $votes[1] = $formattedVotesPos;
            $votes[0] = $formattedVotesNeg;

            if (!empty($votes)) {
                $result['votes'] = $votes;
            }
            
            

            header('Content-Type: application/json');
            echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
    }
}
