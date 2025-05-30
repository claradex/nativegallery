<?php

namespace App\Controllers\Api;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

use donatj\UserAgent\UserAgentParser;


class Login
{
    public function __construct()
    {
        $username = $_POST['username'];
        $password = $_POST['password'];
        if (DB::query('SELECT email FROM users WHERE (LOWER(username) LIKE :username1) OR (LOWER(email) LIKE :username2)', array(':username1' => '%'.$username.'%', ':username2' => '%'.$username.'%'))) {
            $email = DB::query('SELECT email FROM users WHERE (LOWER(username) LIKE :username1) OR (LOWER(email) LIKE :username2)', array(':username1' => '%'.$username.'%', ':username2' => '%'.$username.'%'))[0]['email'];
            if (password_verify($password, DB::query('SELECT password FROM users WHERE email=:username', array(':username' => $email))[0]['password'])) {
                $token = GenerateRandomStr::gen_uuid();
                $user_id = DB::query('SELECT id FROM users WHERE email=:username', array(':username' => $email))[0]['id'];


                if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                    $ip = $_SERVER['HTTP_CLIENT_IP'];
                } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
                } else {
                    $ip = $_SERVER['REMOTE_ADDR'];
                }

                $parser = new UserAgentParser();

                $ua = $parser->parse();
                $ua = $parser();

                $servicekey = GenerateRandomStr::gen_uuid();
                $url = 'http://ip-api.com/json/' . $ip;

                $response = file_get_contents($url);

                $data = json_decode($response, true);
                $loc = $data['country'] . ', ' . $data['city'];
                $device = $ua->platform();
                $os = $ua->platform();
                $encryptionKey = NGALLERY['root']['encryptionkey'];

                $iv = openssl_random_pseudo_bytes(16);
                $encryptedIp = openssl_encrypt($ip, 'AES-256-CBC', $encryptionKey, 0, $iv);
                $encryptedLoc = openssl_encrypt($loc, 'AES-256-CBC', $encryptionKey, 0, $iv);
                DB::query('INSERT INTO login_tokens VALUES (\'0\', :token, :user_id, :device, :os, :ip, :loc, :la, :crd, :iv)', array(
                    ':token' => $token,
                    ':user_id' => $user_id,
                    ':device' => $device,
                    ':os' => $os,
                    ':ip' => $encryptedIp,
                    ':loc' => $encryptedLoc,
                    ':la' => time(),
                    ':crd' => time(),
                    ':iv' => $iv
                ));

                setcookie("NGALLERYSESS", $token, time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);
                setcookie("NGALLERYSERVICE", $servicekey, time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);
                setcookie("NGALLERYSESS_", '1', time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);
                setcookie("NGALLERYID", $user_id, time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);

                echo Json::return(
                    array(
                        'errorcode' => '0',
                        'error' => 0,
                        'token' => $token
                    )
                );
            } else {
                echo Json::return(
                    array(
                        'errorcode' => '1',
                        'error' => 1
                    )
                );
            }
        } else {
            echo Json::return(
                array(
                    'errorcode' => '1',
                    'error' => 1
                )
            );
        }
    }
}
