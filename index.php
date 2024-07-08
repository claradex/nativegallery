<?php
// Prevent worker script termination when a client connection is interrupted
require __DIR__.'/vendor/autoload.php';

use App\Core\{Routes, Page};
use App\Services\DB;
use Symfony\Component\Yaml\Yaml;
use Tracy\Debugger;

class App
{
    public static function start()
    {
        error_reporting(E_ALL & ~E_WARNING);

        if (file_exists($_SERVER['DOCUMENT_ROOT'] . '/ngallery.yaml')) {
            define("NGALLERY", Yaml::parse(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/ngallery.yaml'))['ngallery']);
            if (NGALLERY['root']['debug'] === true) {
                Debugger::enable();
            }
            try {
                if (NGALLERY['root']['maintenance'] === false) {
                $userIP = $_SERVER['REMOTE_ADDR'];

                    function getCountryCodeByIP($ip)
                    {
                        $url = "http://ip-api.com/json/{$ip}?fields=countryCode";
                        $response = file_get_contents($url);
                        $data = json_decode($response, true);
                        return $data['countryCode'] ?? null;
                    }
                    $countryCode = getCountryCodeByIP($userIP);

                    if (in_array(strtolower($countryCode), explode(',', NGALLERY['root']['access']['countries']))) {
                        die(Page::set('Errors/ForbiddenCountry'));
                    }
                    DB::connect();
                    Routes::init();
                } else {
                    Page::set('Errors/ServerDown');
                }
            } catch (PDOException $ex) {
                echo '<details><summary class="p20 s5" style="border:none; margin:0 -20px"><b>Произошла ошибка MySQL</b></summary>'.nl2br($ex).'</details>';
                
            } catch (Exception $ex) {
                echo '<details><summary class="p20 s5" style="border:none; margin:0 -20px"><b>Произошла скриптовая ошибка PHP</b></summary>'.nl2br($ex).'</details>';
            }
        } else {
            Page::set('Errors/Problems');
        }
    }
}

App::start();
