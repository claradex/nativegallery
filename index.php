<?php
require __DIR__ . '/vendor/autoload.php';

use App\Core\{Routes, Page};
use App\Services\{DB, APIResponse};
use Symfony\Component\Yaml\Yaml;
use Tracy\Debugger;
use Symfony\Component\HttpFoundation\Request;


class App
{
    public static function start()
    {
        error_reporting(E_ALL & ~E_WARNING);
        $latte = new Latte\Engine;
        $request = Request::createFromGlobals();
        $problems = [];
        if (!version_compare(PHP_VERSION, "8.3.0", ">=")) {
            $problems[] = "Incompatible PHP version: " . PHP_VERSION . "";
        }
        if (!is_dir(__DIR__ . "/vendor")) {
            $problems[] = "Composer dependencies missing";
        }
        if (!file_exists($_SERVER['DOCUMENT_ROOT'] . '/ngallery.yaml')) {
            $problems[] = "Missing ngallery.yaml (create from ngallery-example.yaml)";
        }
        if (sizeof($problems) === 0) {
            define("NGALLERY", Yaml::parse(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/ngallery.yaml'))['ngallery']);
            define("NGALLERY_TASKS", Yaml::parse(file_get_contents($_SERVER['DOCUMENT_ROOT'] . '/app/Controllers/Exec/Tasks/ngallery-tasks.yaml'))['tasks']);
            if (NGALLERY['root']['debug'] === true) {
                Debugger::enable();
            }
            try {
                if (NGALLERY['root']['maintenance'] === false) {
                    DB::connect();
                    Routes::init();
                } else {
                    $latte->render($_SERVER['DOCUMENT_ROOT'] . "/views/pages/Errors/ServerDown.latte");
                }
            } catch (Exception $ex) {
                http_response_code(500);

                $errorCodes = [
                    'PDOException' => ['code' => '10120', 'type' => 'MYSQL_ERROR', 'message' => 'Произошла ошибка MySQL'],
                    'Exception' => ['code' => '10121', 'type' => 'SCRIPT_ERROR', 'message' => 'Произошла ошибка PHP']
                ];

                $exceptionType = $ex instanceof PDOException ? 'PDOException' : 'Exception';
                $errorDetails = $errorCodes[$exceptionType];

                $errorResponse = NGALLERY['root']['debug'] === true
                    ? ['errorcode' => $errorDetails['code'], 'error' => 1, 'errormsg' => $ex, 'errortype' => $errorDetails['type']]
                    : ['errorcode' => '1', 'error' => 1, 'errormsg' => 'Internal Server Error', 'errortype' => $errorDetails['type']];

                if ($request->isXmlHttpRequest() && !isset($_SERVER['HTTP_USER_AGENT'])) {
                    APIResponse::data($errorResponse, 500)->send();
                } else {
                    echo NGALLERY['root']['debug'] === true
                        ? '<details><summary class="p20 s5" style="border:none; margin:0 -20px"><b>' . $errorDetails['message'] . '</b></summary>' . nl2br($ex) . '</details>'
                        : $errorDetails['message'];
                }
            }
        } else {
            $params['problems'] = $problems;
            $latte->render($_SERVER['DOCUMENT_ROOT'] . "/views/pages/Errors/Problems.latte", $params);
        }
    }
}

App::start();
