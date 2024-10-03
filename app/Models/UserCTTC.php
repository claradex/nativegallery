<?php
namespace App\Models;
use \App\Services\DB;
use DOMDocument, DOMXPath;
use PHPHtmlParser\Dom;

class UserCTTC {

    public $userid;
    public $dataarray;
    function __construct(int $user_id) {
        $this->userid = $user_id;
        $url = "https://transphoto.org/author/".$user_id;
        $dataarray = [];
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Cookie: '.NGALLERY['transphotoapi']['cookie']
        ));
        

        $html = curl_exec($ch);
        curl_close($ch);

        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();
        
        $xpath = new DOMXPath($dom);
        $mainNode = $xpath->query('//td[@class="main"]')->item(0);

        $dom = new Dom;
        $dom->loadStr($html);
        $contents = $dom->find('.p20');

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



        




            $dataarray['username'] = $title;
            $dataarray['realname'] = $realName;
            $dataarray['birthdate'] = $birthDate;
            $dataarray['city'] = $city;
            $dataarray['regdate'] = $regDate;
            $dataarray['photourl'] = "https://transphoto.org/_update_temp/userphotos/".$user_id.".jpg";
            $dataarray['about'] = $contents[1];
                        
            $this->dataarray = $dataarray;
        }

       


    }
    public function i($table) {
        return $this->dataarray[$table];
    }
    public function content($table) {
       
        
            
        
    }

}