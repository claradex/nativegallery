<?php

namespace App\Controllers\Api\Images;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, VoteContest};

class Rate
{
    public function __construct()
    {
        if (isset($_GET['vote']) && isset($_GET['pid'])) {
            $userId = Auth::userid();
            $photoId = $_GET['pid'];
            $voteType = (int) $_GET['vote'];
            $contest = (isset($_GET['action']) && $_GET['action'] === 'vote-konk') ? 1 : 0;
            $contestId = $_GET['cid'];

            if ($contest === 1) {
                if (VoteContest::photo($userId, $photoId, $contestId) === -1) {
                    DB::query(
                        'INSERT INTO photos_rates_contest (id, user_id, photo_id, type, contest_id) VALUES (NULL, :id, :pid, :type, :cid)',
                        [':id' => $userId, ':pid' => $photoId, ':type' => $voteType, ':cid'=>$contestId]
                    );
                    if (VoteContest::photo($userId, $photoId, $contestId) != $voteType) {
                        DB::query(
                            'DELETE FROM photos_rates_contest WHERE user_id=:id AND photo_id=:pid AND type=:type AND contest_id=:cid',
                            [':id' => $userId, ':pid' => $photoId, ':type' => VoteContest::photo($userId, $photoId, $contestId), ':cid'=>$contestId]
                        );
                    }
                } elseif (VoteContest::photo($userId, $photoId, $contestId) === $voteType) {
                    DB::query(
                        'DELETE FROM photos_rates_contest WHERE user_id=:id AND photo_id=:pid AND contest_id=:cid',
                        [':id' => $userId, ':pid' => $photoId, ':cid'=>$contestId]
                    );
                } else {
                    DB::query(
                        'UPDATE photos_rates_contest SET type=:type WHERE user_id=:id AND photo_id=:pid AND contest_id=:cid',
                        [':id' => $userId, ':pid' => $photoId, ':type' => $voteType, ':cid'=>$contestId]
                    );
                }
            } else {
                if (Vote::photo($userId, $photoId) === -1) {
                    DB::query(
                        'INSERT INTO photos_rates (id, user_id, photo_id, type, contest) VALUES (NULL, :id, :pid, :type, 0)',
                        [':id' => $userId, ':pid' => $photoId, ':type' => $voteType]
                    );
                    if (Vote::photo($userId, $photoId) != $voteType) {
                        DB::query(
                            'DELETE FROM photos_rates WHERE user_id=:id AND photo_id=:pid AND type=:type AND contest=0',
                            [':id' => $userId, ':pid' => $photoId, ':type' => Vote::photo($userId, $photoId)]
                        );
                    }
                } elseif (Vote::photo($userId, $photoId) === $voteType) {
                    DB::query(
                        'DELETE FROM photos_rates WHERE user_id=:id AND photo_id=:pid AND contest=0',
                        [':id' => $userId, ':pid' => $photoId]
                    );
                } else {
                    DB::query(
                        'UPDATE photos_rates SET type=:type WHERE user_id=:id AND photo_id=:pid AND contest=0',
                        [':id' => $userId, ':pid' => $photoId, ':type' => $voteType]
                    );
                }
            }

            $votes = DB::query('SELECT * FROM photos_rates WHERE photo_id=:id ORDER BY id DESC', [':id' => $photoId]);
            $formattedVotesPos = [];
            $formattedVotesNeg = [];

            foreach ($votes as $vote) {
                $user = new User($vote['user_id']);
                if ($vote['type'] === 0) {
                    $formattedVotesNeg[] = [$vote['user_id'], $user->i('username'), 0];
                } elseif ($vote['type'] === 1) {
                    $formattedVotesPos[] = [$vote['user_id'], $user->i('username'), 1];
                }
            }

            $currentVote = Vote::photo($userId, $photoId);
            $contCurrentVote = VoteContest::photo($userId, $photoId, $contestId);

            if ($contest === 0) {
                $count = Vote::count($photoId);
            } else {
                $count = VoteContest::count($photoId, $contestId);
            }
            $result = [
                'buttons' => [
                    'negbtn' => $currentVote === 0,
                    'posbtn' => $currentVote === 1,
                    'negbtn_contest' => $contCurrentVote === 0,
                    'posbtn_contest' => $contCurrentVote === 1,
                ],
                'errors' => '',
                'rating' => $count,
                'votes' => [
                    1 => $formattedVotesPos,
                    0 => $formattedVotesNeg
                ]
            ];

            header('Content-Type: application/json');
            echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
    }
}
