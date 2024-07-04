<?php

namespace App\Controllers\Api;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, Word};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

use donatj\UserAgent\UserAgentParser;


class Register
{




    public function __construct()
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $lockFile = $_SERVER['DOCUMENT_ROOT'].'/lock/request_lock_' . $ip;
        file_put_contents($lockFile, 'lock');

        $ch = curl_init('http://' . $_SERVER['HTTP_HOST'] . '/' . $_GET['username']);
        curl_setopt($ch, CURLOPT_URL, 'http://' . $_SERVER['HTTP_HOST'] . '/' . $_GET['username']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($ch, CURLOPT_NOBODY, true); 
        curl_setopt($ch, CURLOPT_HEADER, true); 
        curl_setopt($ch, CURLOPT_SSL_VERIFYSTATUS, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');

        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36');
        curl_exec($ch);

        $username = $_POST['username'];
        $password = $_POST['password'];
        $email = $_POST['email'];
        if (!strcasecmp(DB::query('SELECT username FROM users WHERE (LOWER(username) LIKE :username)', array(':username' => '%' . $username . '%'))[0]['username'], $username) === false || Router::checkCurl($_SERVER['HTTP_HOST'] . '/' . $username) != 200 ) {
            if (Word::strlen(ltrim($username)) >= 5 && Word::strlen(ltrim($username)) <= 20 && !preg_match("#^[a-zA-Z0-9]+$#", $username)) {


                        if (Word::strlen(ltrim($password)) >= 5 && Word::strlen(ltrim($password)) <= 120) {

                            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {


                                if (!DB::query('SELECT email FROM users WHERE email=:email', array(':email' => $email))) {

                                   

                                    $content = Json::return(
                                        array(
                                            'route' => 'NONE',
                                            'regdate' => time()
                                        )
                                    );

                                    DB::query('INSERT INTO users VALUES (\'0\', :username, :email, :password 5, :content)', array(':username' => ltrim($username), ':password' => password_hash(ltrim($password), PASSWORD_BCRYPT), ':email' => $email, ':content' => $content));
                                    $cstrong = True;
                                    $token = GenerateRandomStr::gen_uuid();
                                    $user_id = DB::query('SELECT id FROM users WHERE username=:username', array(':username' => $username))[0]['id'];

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

                                    setcookie("NGALLERYSESS", $token, time() + 120 * 180 * 240 * 720, '/', NULL, NULL, TRUE);
                                    setcookie("NGALLERYSESS_", '1', time() + 120 * 180 * 240 * 360, '/', NULL, NULL, TRUE);
                                    setcookie("NGALLERYID", $user_id, time() + 10 * 10 * 24 * 72, '/', NULL, NULL, TRUE);
                                    
                                    echo json_encode(
                                        array(
                                            'errorcode' => '0',
                                            'error' => 0
                                        )
                                    );
                                } else {
                                    echo json_encode(
                                        array(
                                            'errorcode' => '2',
                                            'errortitle' => 'Пользователь с такой почтой уже существует!',
                                            'error' => 1
                                        )
                                    );
                                }
                          
                    } else {
                        echo json_encode(
                            array(
                                'errorcode' => '3',
                                'errortitle' => 'Почта некорректного формата!',
                                'error' => 1
                            )
                        );
                    }
                } else {
                    echo json_encode(
                        array(
                            'errorcode' => '4',
                            'errortitle' => 'Пароль меньше 5 символов!',
                            'error' => 1
                        )
                    );
                }
            } else {
                echo json_encode(
                    array(
                        'errorcode' => '5',
                        'errortitle' => 'Никнейм некорректный!',
                        'error' => 1
                    )
                );
            }
        } else {
            echo json_encode(
                array(
                    'errorcode' => '6',
                    'errortitle' => 'Никнейм уже существует!!',
                    'error' => 1
                )
            );
        }
        unlink($lockFile);
    }
}
