<?php
// Prevent worker script termination when a client connection is interrupted
require __DIR__ . '/vendor/autoload.php';

use App\Core\{Routes, Page};
use App\Services\{DB, GalleryConfig, ConfigCache};
use Symfony\Component\Yaml\Yaml;
use Tracy\Debugger;

class App
{
    public static function start()
    {
        ini_set('display_errors', 0);
        ini_set('display_startup_errors', 0);
        error_reporting(E_ALL);

        $docRoot = $_SERVER['DOCUMENT_ROOT'] ?? __DIR__;
        $yamlPath = $docRoot . '/ngallery.yaml';

        if (!is_readable($yamlPath)) {
            Page::set('Errors/Problems');
            return;
        }

        $overlayPaths = [
            $yamlPath,
            GalleryConfig::overlayPath(),
            GalleryConfig::serverSettingsPath(),
        ];

        $ngallery = ConfigCache::remember('ngallery', $overlayPaths, static function () use ($yamlPath) {
            $parsed = Yaml::parseFile($yamlPath);
            $config = $parsed['ngallery'] ?? [];
            $config = GalleryConfig::applyAuthOverlay($config);
            return GalleryConfig::applyServerOverlay($config);
        });

        define('NGALLERY', $ngallery);
        require_once $docRoot . '/views/components/AssetHelper.php';

        $tasksPath = $docRoot . '/app/Controllers/Exec/Tasks/ngallery-tasks.yaml';
        $tasks = ConfigCache::remember('ngallery_tasks', [$tasksPath], static function () use ($tasksPath) {
            return Yaml::parseFile($tasksPath)['tasks'] ?? [];
        });
        define('NGALLERY_TASKS', $tasks);

        \App\Services\Date::applySiteTimezone();

        if (NGALLERY['root']['debug'] === true) {
            $logDir = $docRoot . (NGALLERY['root']['logslocation'] ?? '/logs');
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0775, true);
            }
            Debugger::enable(Debugger::DEVELOPMENT, $logDir);
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
            echo '<details><summary class="p20 s5" style="border:none; margin:0 -20px"><b>Произошла ошибка MySQL</b></summary>' . nl2br((string) $ex) . '</details>';
        } catch (Exception $ex) {
            echo '<pre><b>Произошла скриптовая ошибка PHP</b><br><br>' . nl2br((string) $ex) . '</pre>';
        }
    }
}

App::start();