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
        if (DB::query('SELECT email FROM users WHERE email=:username OR username=:username', array(':username' => $username))) {
            $email = DB::query('SELECT email FROM users WHERE email=:username OR username=:username', array(':username'=>$username))[0]['email'];
            if (password_verify($password, DB::query('SELECT password FROM users WHERE email=:username', array(':username' => $email))[0]['password'])) {
                $cstrong = True;
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
                    $url = 'http://ip-api.com/json/'.$ip;

                    $response = file_get_contents($url);
                
                    $data = json_decode($response, true);
                    $loc = $data['country'].', '.$data['city'];
                    DB::query('INSERT INTO login_tokens VALUES (\'0\', :token, :user_id, :platform, :browser, :browserversion, 0, :ip, :servicekey, :loc)', array(
                        ':token' => $token,
                        ':user_id' => $user_id,
                        ':platform' => $ua->platform(),
                        ':browser' => $ua->browser(),
                        ':browserversion' => $ua->browserVersion(),
                        ':ip' => $ip,
                        ':servicekey' => $servicekey,
                        ':loc' => $loc
                    ));

                    setcookie("BIRUXSESS", $token, time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);
                    setcookie("BIRUXSERVICE", $servicekey, time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);
                    setcookie("BIRUXSESS_", '1', time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);
                    setcookie("BIRUXID", $user_id, time() + 50 * 50 * 54 * 72, '/', NULL, NULL, TRUE);

                echo Json::return (
                    array(
                        'errorcode' => '0',
                        'error' => 0
                    )
                );



            } else {
                echo Json::return (
                    array(
                        'errorcode' => '1',
                        'error' => 1
                    )
                );
            }

        } else {
            echo Json::return (
                array(
                    'errorcode' => '1',
                    'error' => 1
                )
            );

        }
    }
}
