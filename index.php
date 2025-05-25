<?php
// Prevent worker script termination when a client connection is interrupted
require __DIR__.'/vendor/autoload.php';
session_start();
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
            define("NGALLERY_TASKS", Yaml::parse(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/app/Controllers/Exec/Tasks/ngallery-tasks.yaml'))['tasks']);
            if (NGALLERY['root']['debug'] === true) {
                Debugger::enable();
            }
            try {

                if (NGALLERY['root']['maintenance'] === false) {
                    DB::init([
                        'driver' => 'mysql',
                        'host' => NGALLERY['root']['db']['host'],
                        'database' => NGALLERY['root']['db']['name'],
                        'username' => NGALLERY['root']['db']['login'],
                        'password' => NGALLERY['root']['db']['password'],
                    ]);
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