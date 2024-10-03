<?php

namespace App\Controllers\Api\Images;

use \App\Services\{Auth, DB, Date, HTMLParser};
use DOMDocument, DOMXPath;

class LoadRecent
{

    public function __construct()
    {
        $response = [];

        if ($_POST['serverhost'] === 'transphoto.org') {
            $photos = DB::query('SELECT * FROM photos WHERE moderated=1 ORDER BY id DESC LIMIT 30');


            foreach ($photos as $p) {
                if ($p['posted_at'] === 943909200 || Date::zmdate($p['posted_at']) === '30 ноября 1999 в 00:00') {
                    $date = 'дата не указана';
                } else {
                    $date = Date::zmdate($p['posted_at']);
                }
                $user = DB::query('SELECT * FROM users WHERE id=:id', array(':id' => $p['user_id']))[0];

                $response[] = [
                    'id' => $p['id'],
                    'place' => htmlspecialchars($p['place']),
                    'date' => $date,
                    'user_name' => $user['username'],
                    'user_id' => $p['user_id'],
                    'photourl' => $p['photourl'],
                    'photourl_small' => 'https://' . $_SERVER['SERVER_NAME'] . '/api/photo/compress?url=' . $p['photourl']
                ];
            }
        } else {
            $url = 'https://transphoto.org/api.php?action=get-recent-photos&width=802&lastpid=0&hidden=0';
            $ch = curl_init();

            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $responsed = curl_exec($ch);
            if (curl_errno($ch)) {
                $response = [
                   'error' => 1,
                   'errorcode' => 'СТТС не отвечает. Попробуйте позже'
                ];
            } else {
                $data = json_decode($responsed, true);
                foreach ($data as $d) {
                    $response[] = [
                        'id' => $d['pid'],
                        'place' => strip_tags($d['links']),
                        'date' => $d['pdate'],
                        'photourl_small' => 'https://transphoto.org'.$d['prw'],
                    ];
                }
            }

            curl_close($ch);


           
        }


        header('Content-Type: application/json');
        echo json_encode($response);
    }
}
