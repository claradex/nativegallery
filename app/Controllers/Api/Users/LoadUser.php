<?php

namespace App\Controllers\Api\Users;

use \App\Services\{Auth, DB, Date, HTMLParser};
use DOMDocument, DOMXPath;

class LoadUser
{

    public function __construct()
    {
        $id = explode('/', $_SERVER['REQUEST_URI'])[4];
        $user = new \App\Models\User($id);
        $response = [];
            
        if ($_POST['serverhost'] != 'transphoto.org') {
            if ($user->i('id') != null) {
                $response[] = [
                    'id' => $user->i('id'),
                    'username' => $user->i('username'),
                    'regdate' => $user->content('regdate'),
                    'online' => $user->i('online'),
                    'photourl' => $user->i('photourl'),
                ];
            } else {
                $response = [
                    'error' => 1,
                    'errorcode' => 'Пользователь не найден'
                 ];
            }

        } else {
            $url = "https://transphoto.org/author/".$id;
            
            // Инициализируем cURL
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Cookie: '.NGALLERY['transphoto']['cookie']
            ));
            

            $html = curl_exec($ch);
            curl_close($ch);

            $dom = new DOMDocument();
            libxml_use_internal_errors(true);
            $dom->loadHTML($html);
            libxml_clear_errors();
            
            $xpath = new DOMXPath($dom);
            $mainNode = $xpath->query('//td[@class="main"]')->item(0);

            if ($mainNode) {
               

                $titleNode = $xpath->query('.//h1', $mainNode)->item(0);
                $title = $titleNode ? $titleNode->textContent : 'Не найдено';
            
                $realNameNode = $xpath->query('.//tr[td[contains(text(),"Реальное имя:")]]/td[2]/b', $mainNode)->item(0);
                $realName = $realNameNode ? $realNameNode->textContent : 'Не найдено';
            
                // Откуда
                $city = $xpath->query('.//tr[td[contains(text(),"Откуда:")]]/td[2]', $mainNode)->item(0)->textContent;
            
                // Дата рождения
                $birthDate = $xpath->query('.//tr[td[contains(text(),"Дата рождения:")]]/td[2]', $mainNode)->item(0)->textContent;
            
                // Дата регистрации
                $regDate = $xpath->query('.//tr[td[contains(text(),"Дата регистрации:")]]/td[2]/span', $mainNode)->item(0)->textContent;
            
                // Рейтинг
                $rating = $xpath->query('.//tr[td[contains(text(),"Рейтинг:")]]/td[2]/span', $mainNode)->item(0)->textContent;
            
                // Пол
                $gender = $xpath->query('.//tr[td[contains(text(),"Пол:")]]/td[2]/span', $mainNode)->item(0)->textContent;
            
                // Владение языками
                $languages = $xpath->query('.//tr[td[contains(text(),"Владение языками:")]]/td[2]/span', $mainNode)->item(0)->textContent;
            

              
                $response[] = [
                    'id' => $id,
                    'username' => $title,
                    'online' => 0,
                    'photourl' => 'https://transphoto.org/_update_temp/userphotos/'.$id.'.jpg'
                ];
              
            } else {
                echo "Блок не найден.";
            }

          
            


           
        }


        header('Content-Type: application/json');
        echo json_encode($response);
    }
}
