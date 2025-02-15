<?php

namespace App\Controllers\Api\Images;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote};

class Rate
{
    public function __construct()
    {
        if (isset($_GET['vote']) && isset($_GET['pid'])) {
            $userId = Auth::userid();
            $photoId = $_GET['pid'];
            $voteType = (int) $_GET['vote'];
            $contest = (isset($_GET['action']) && $_GET['action'] === 'vote-konk') ? 1 : 0;

            if ($contest === 1) {
                if (Vote::photoContest($userId, $photoId) === -1) {
                    DB::query(
                        'INSERT INTO photos_rates (id, user_id, photo_id, type, contest) VALUES (NULL, :id, :pid, :type, 1)',
                        [':id' => $userId, ':pid' => $photoId, ':type' => $voteType]
                    );
                    if (Vote::photoContest($userId, $photoId) != $voteType) {
                        DB::query(
                            'DELETE FROM photos_rates WHERE user_id=:id AND photo_id=:pid AND type=:type AND contest=1',
                            [':id' => $userId, ':pid' => $photoId, ':type' => Vote::photo($userId, $photoId)]
                        );
                    }
                } elseif (Vote::photoContest($userId, $photoId) === $voteType) {
                    DB::query(
                        'DELETE FROM photos_rates WHERE user_id=:id AND photo_id=:pid AND contest=1',
                        [':id' => $userId, ':pid' => $photoId]
                    );
                } else {
                    DB::query(
                        'UPDATE photos_rates SET type=:type WHERE user_id=:id AND photo_id=:pid AND contest=1',
                        [':id' => $userId, ':pid' => $photoId, ':type' => $voteType]
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
            $contCurrentVote = Vote::photoContest($userId, $photoId);
            $result = [
                'buttons' => [
                    'negbtn' => $currentVote === 0,
                    'posbtn' => $currentVote === 1,
                    'negbtn_contest' => $contCurrentVote === 0,
                    'posbtn_contest' => $contCurrentVote === 1,
                ],
                'errors' => '',
                'rating' => Vote::count($photoId),
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
