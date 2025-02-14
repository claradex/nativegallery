<?php

namespace App\Controllers\Api;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, Word};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

use donatj\UserAgent\UserAgentParser;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Beeyev\DisposableEmailFilter\DisposableEmailFilter;

class Register
{


    private static function checkforb($nickname, $nicknames)
    {
        $replacements = [
            '1' => 'i',
            '!' => 'i',
            '|' => 'i',
            'l' => 'i',
            'í' => 'i',
            'ì' => 'i',
            'î' => 'i',
            'ï' => 'i',
            'İ' => 'i',
            '¡' => 'i',
            '0' => 'o',
            '@' => 'a',
            '$' => 's',
            '5' => 's',
            '§' => 's',
            '2' => 'z',
            '3' => 'e',
            '7' => 't',
            '4' => 'a',
            '8' => 'b',
            '6' => 'b',
            '9' => 'g',
            'ß' => 'ss',
            'µ' => 'u',
            'æ' => 'ae',
            'œ' => 'oe',
            'z' => '2',
            'x' => '%',
            'w' => 'vv',
            'v' => 'u',
            'ñ' => 'n',
            'á' => 'a',
            'à' => 'a',
            'â' => 'a',
            'ä' => 'a',
            'ã' => 'a',
            'å' => 'a',
            'é' => 'e',
            'è' => 'e',
            'ê' => 'e',
            'ë' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ò' => 'o',
            'ô' => 'o',
            'ö' => 'o',
            'õ' => 'o',
            'ú' => 'u',
            'ù' => 'u',
            'û' => 'u',
            'ü' => 'u',
            'ç' => 'c',
            'ć' => 'c',
            'č' => 'c',
            'đ' => 'd',
            'š' => 's',
            'ž' => 'z',
            'б' => 'b',
            'в' => 'v',
            'г' => 'g',
            'д' => 'd',
            'е' => 'e',
            'ё' => 'e',
            'ж' => 'zh',
            'з' => 'z',
            'и' => 'i',
            'й' => 'i',
            'к' => 'k',
            'л' => 'l',
            'м' => 'm',
            'н' => 'n',
            'о' => 'o',
            'п' => 'p',
            'р' => 'r',
            'с' => 's',
            'т' => 't',
            'у' => 'u',
            'ф' => 'f',
            'х' => 'kh',
            'ц' => 'ts',
            'ч' => 'ch',
            'ш' => 'sh',
            'щ' => 'shch',
            'ы' => 'y',
            'э' => 'e',
            'ю' => 'yu',
            'я' => 'ya',
            'ѣ' => 'e',
            'і' => 'i',
            'ѳ' => 'f',
            'ѵ' => 'i',
            'қ' => 'k',
            'ғ' => 'g',
            'ң' => 'n',
            'ү' => 'u',
            'ұ' => 'u',
            'ө' => 'o',
            'ә' => 'a',
            'җ' => 'zh',
            'һ' => 'h',
            'ү' => 'u',
            'ұ' => 'u',
            'ҙ' => 'z',
            'ӣ' => 'i',
            'ӯ' => 'u',
            'ҷ' => 'ch',
            'ҳ' => 'h',
            'ѯ' => 'ks',
            'ѱ' => 'ps',
            'ѝ' => 'i',
            'ѫ' => 'u',
            'ѭ' => 'yu',
            'ў' => 'u',
            'џ' => 'dz',
            'є' => 'e',
            'і' => 'i',
            'ї' => 'i',
            'ґ' => 'g',
            'є' => 'e',
            'і' => 'i',
            'ї' => 'i',
            'ґ' => 'g',
            'ä' => 'a',
            'ö' => 'o',
            'ü' => 'u',
            'ß' => 'ss',
            'ā' => 'a',
            'ē' => 'e',
            'ī' => 'i',
            'ō' => 'o',
            'ū' => 'u',
            'ç' => 'c',
            'ğ' => 'g',
            'ş' => 's',
            'ÿ' => 'y',
            'œ' => 'oe',
            'æ' => 'ae',
            'å' => 'a',
            'ø' => 'o',
            'ē' => 'e',
            'ş' => 's',
            'ū' => 'u',
            'ž' => 'z',
            'ž' => 'z',
            'ł' => 'l',
            'đ' => 'd',
            'č' => 'c',
            'ć' => 'c',
            'ś' => 's',
            'ź' => 'z',
            'ń' => 'n',
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' => 'u',
            'ý' => 'y',
            'ř' => 'r',
            'ě' => 'e',
            'ů' => 'u',
            'ű' => 'u',
            'ő' => 'o',
            'ě' => 'e',
            'ň' => 'n',
            'ď' => 'd',
            'ť' => 't',
            'ĺ' => 'l',
            'ľ' => 'l',
            'ŕ' => 'r',
            'ă' => 'a',
            'ș' => 's',
            'ț' => 't',
            'ā' => 'a',
            'ē' => 'e',
            'ī' => 'i',
            'ō' => 'o',
            'ū' => 'u',
            'ė' => 'e',
            'į' => 'i',
            'ų' => 'u',
            'ţ' => 't',
            'ș' => 's',
            'ä' => 'a',
            'ö' => 'o',
            'ü' => 'u',
            'ß' => 'ss',
            'ā' => 'a',
            'ē' => 'e',
            'ī' => 'i',
            'ō' => 'o',
            'ū' => 'u',
            'ç' => 'c',
            'ğ' => 'g',
            'ş' => 's',
            'ÿ' => 'y',
            'œ' => 'oe',
            'æ' => 'ae',
            'å' => 'a',
            'ø' => 'o',
            'ē' => 'e',
            'ş' => 's',
            'ū' => 'u',
            'ž' => 'z',
            'ž' => 'z',
            'ł' => 'l',
            'đ' => 'd',
            'č' => 'c',
            'ć' => 'c',
            'ś' => 's',
            'ź' => 'z',
            'ń' => 'n',
            'á' => 'a',
            'é' => 'e',
            'í' => 'i',
            'ó' => 'o',
            'ú' => 'u',
            'ý' => 'y',
            'ř' => 'r',
            'ě' => 'e',
            'ů' => 'u',
            'ű' => 'u',
            'ő' => 'o',
            'ě' => 'e',
            'ň' => 'n',
            'ď' => 'd',
            'ť' => 't',
            'ĺ' => 'l',
            'ľ' => 'l',
            'ŕ' => 'r',
            'ă' => 'a',
            'ș' => 's',
            'ț' => 't',
            'ā' => 'a',
            'ē' => 'e',
            'ī' => 'i',
            'ō' => 'o',
            'ū' => 'u',
            'ė' => 'e',
            'į' => 'i',
            'ų' => 'u',
            'ţ' => 't',
            'ș' => 's'
        ];

        $normalized_nickname = strtr(strtolower($nickname), $replacements);

        foreach ($nicknames as $nick) {
            $normalized_nick = strtr(strtolower($nick), $replacements);
            $lev_distance = levenshtein($normalized_nickname, $normalized_nick);
            if ($lev_distance <= 2) {
                return true;
            }
        }
        return false;
    }

    public function __construct()
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $lockFile = $_SERVER['DOCUMENT_ROOT'] . '/lock/request_lock_' . $ip;
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
        $forbusernames = explode(',', NGALLERY['root']['registration']['prohibited_usernames']);
        $status = 0;
        if (!self::checkforb($_POST['username'], $forbusernames)) {

            if (!strcasecmp(DB::query('SELECT username FROM users WHERE (LOWER(username) LIKE :username)', array(':username' => '%' . $username . '%'))[0]['username'], $username) === false) {
                if (Word::strlen(ltrim($username)) >= 2 && Word::strlen(ltrim($username)) <= 20) {


                    if (Word::strlen(ltrim($password)) >= 5 && Word::strlen(ltrim($password)) <= 120) {

                        if (filter_var($email, FILTER_VALIDATE_EMAIL)) {


                            if (!DB::query('SELECT email FROM users WHERE email=:email', array(':email' => $email))) {



                                $content = Json::return(
                                    array(
                                        'route' => 'NONE',
                                        'regdate' => time()
                                    )
                                );
                                if (NGALLERY['root']['registration']['emailverify'] === true) {
                                    $status === 3;
                                }
                                $token = GenerateRandomStr::gen_uuid();
                                DB::query('INSERT INTO users VALUES (\'0\', :username, :email, :password, :photourl, 5, :online, 0, :status, :content)', array(':username' => ltrim($username), ':password' => password_hash(ltrim($password), PASSWORD_BCRYPT), ':photourl' => '/static/img/avatar.png', ':email' => $email, ':content' => $content, ':online' => time(), ':status'=>$status));
                                $user_id = DB::query('SELECT id FROM users WHERE username=:username', array(':username' => $username))[0]['id'];
                                if (NGALLERY['root']['registration']['emailverify'] === true) {
                                    $disposableEmailFilter = new DisposableEmailFilter();
                                    if ($disposableEmailFilter->isDisposableEmailAddress($_POST['email'])) {
                                        echo json_encode(
                                            array(
                                                'errorcode' => '9',
                                                'errortitle' => 'Почта запрещена для регистрации',
                                                'error' => 1
                                            )
                                        );
                                        die();
                                    }
                                    $key = GenerateRandomStr::gen_uuid();
                                    $content = Json::return(
                                        array(
                                            'user_id' => $user_id
                                        )
                                    );
                                    $mail = new PHPMailer(true);
                                    DB::query('INSERT INTO servicekeys VALUES (\'0\', :token, :type, 1, :content)', array(':token'=>$key, ':type'=>'EMAILVERIFY', ':content'=>$content));
                                    try {
                                        $mail->isSMTP();
                                        $mail->Host = NGALLERY['root']['email']['credentials']['host'];
                                        $mail->SMTPAuth = true;
                                        $mail->CharSet = "UTF-8";
                                        $mail->Username = NGALLERY['root']['email']['credentials']['username'];
                                        $mail->Password = NGALLERY['root']['email']['credentials']['password'];
                                        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                                        $mail->Port = NGALLERY['root']['email']['credentials']['port'];

                                        $mail->setFrom(NGALLERY['root']['email']['from']['address'], NGALLERY['root']['title']);
                                        $mail->addAddress($_POST['email']);

                                        $mail->isHTML(true);
                                        $mail->Subject = 'Подтверждение регистрации | '.NGALLERY['root']['title'];

                                        $mail->Body = '
                                        <!DOCTYPE html>
                                        <html lang="ru">
                                        <head>
                                            <meta charset="UTF-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                            <style>
                                                body {
                                                    font-family: Arial, sans-serif;
                                                    background-color: #f4f4f4;
                                                    margin: 0;
                                                    padding: 20px;
                                                }
                                                .container {
                                                    background-color: #ffffff;
                                                    border-radius: 8px;
                                                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                                                    padding: 20px;
                                                    max-width: 600px;
                                                    margin: auto;
                                                }
                                                h1 {
                                                    color: #333;
                                                }
                                                .code {
                                                    font-size: 24px;
                                                    font-weight: bold;
                                                    color: #007bff;
                                                    margin: 20px 0;
                                                }
                                                .footer {
                                                    margin-top: 20px;
                                                    font-size: 12px;
                                                    color: #777;
                                                }
                                            </style>
                                        </head>
                                        <body>
                                           <div class="container">
                                            <h1>Подтверждение регистрации</h1>
                                            <p>Это письмо было отправлено на ваш почтовый ящик, так как оно было указано при регистрации на '.NGALLERY['root']['title'].' ('.$_SERVER['HTTP_HOST'].')<br>Если вы его не запрашивали, проигнорируйте его.</p><br><br>Ссылка для подтверждения адреса: <a href="https://'.$_SERVER['HTTP_HOST'].'/api/users/emailverify?token='.$key.'">https://'.$_SERVER['HTTP_HOST'].'/api/users/emailverify?token='.$key.'</a>
                                        </div>
                                        </body>
                                        </html>';
                                    
                                        
                                        $mail->send();
                                    } catch (Exception $e) {
                                        echo json_encode(
                                            array(
                                                'errorcode' => '8',
                                                'errortitle' => 'Не удалось отправить письмо: '.$mail->ErrorInfo,
                                                'error' => 1,
                                            )
                                        );
                                        die();
                                    }
                                }
                              

                                if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                                    $ip = $_SERVER['HTTP_CLIENT_IP'];
                                } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                                    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
                                } else {
                                    $ip = $_SERVER['REMOTE_ADDR'];
                                }
                                $url = 'http://ip-api.com/json/' . $ip;

                                $response = file_get_contents($url);

                                $data = json_decode($response, true);
                                DB::query('INSERT INTO login_tokens VALUES (\'0\', :token, :user_id)', array(
                                    ':token' => $token,
                                    ':user_id' => $user_id,

                                ));

                                setcookie("NGALLERYSESS", $token, time() + 120 * 180 * 240 * 720, '/', NULL, NULL, TRUE);
                                setcookie("NGALLERYSESS_", '1', time() + 120 * 180 * 240 * 360, '/', NULL, NULL, TRUE);
                                setcookie("NGALLERYID", $user_id, time() + 10 * 10 * 24 * 72, '/', NULL, NULL, TRUE);
                                echo json_encode(
                                    array(
                                        'errorcode' => '0',
                                        'error' => 0,
                                        'token' => $token
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
                        'errortitle' => 'Никнейм уже существует!',
                        'error' => 1
                    )
                );
            }
        } else {
            echo json_encode(
                array(
                    'errorcode' => '7',
                    'errortitle' => 'Никнейм ' . $_POST['username'] . ' запрещён на сервере.',
                    'error' => 1
                )
            );
        }
        unlink($lockFile);
    }
}
