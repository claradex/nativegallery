<?php

namespace App\Services;
class TaskScheduler {
    public function __construct() {}

    private function isWindows() {
        return strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    }

    public function addTask($taskName, $command, $interval = "* * * * *") {
        return $this->isWindows() ? $this->addWindowsTask($taskName, $command) : $this->addLinuxTask($command, $interval);
    }

    public function isTaskExists($taskName = null, $command = null) {
        return $this->isWindows() ? $this->isWindowsTaskExists($taskName) : $this->isLinuxTaskExists($command);
    }

    public function removeTask($taskName = null, $command = null) {
        return $this->isWindows() ? $this->removeWindowsTask($taskName) : $this->removeLinuxTask($command);
    }

    public function getTaskStatus($taskName, $command = null) {
        if (!$this->isTaskExists($taskName, $command)) {
            return "❌ Не работает (задача отсутствует)";
        }

        return $this->isWindows() ? $this->getWindowsTaskStatus($taskName) : $this->getLinuxTaskStatus($command);
    }

    public function findHandlerById($array, $id) {
        foreach ($array as $item) {
            if (isset($item['id']) && $item['id'] === $id) {
                return $item['handler'] ?? null;
            }
        }
        return null;
    }

    private function addLinuxTask($command, $interval) {
        $cronJob = "{$interval} {$command}";
        if ($this->isLinuxTaskExists($command)) {
            return "✅ Cron-задача уже установлена.";
        }

        exec("crontab -l 2>&1", $output, $return_var);
        if ($return_var !== 0) {
            $output = [];
        }

        $output[] = $cronJob;
        file_put_contents("/tmp/my_cron", implode(PHP_EOL, $output) . PHP_EOL);
        exec("crontab /tmp/my_cron");
        unlink("/tmp/my_cron");

        return "✅ Cron-задача добавлена!";
    }

    private function isLinuxTaskExists($command = null) {
        exec("crontab -l 2>&1", $output);
        foreach ($output as $line) {
            if (strpos($line, $command) !== false) {
                return true;
            }
        }
        return false;
    }

    private function removeLinuxTask($command = null) {
        exec("crontab -l 2>&1", $output, $return_var);
        if ($return_var !== 0) {
            return "❌ Нет задач для удаления.";
        }

        $filteredOutput = array_filter($output, function ($line) use ($command) {
            return strpos($line, $command) === false;
        });

        file_put_contents("/tmp/my_cron", implode(PHP_EOL, $filteredOutput) . PHP_EOL);
        exec("crontab /tmp/my_cron");
        unlink("/tmp/my_cron");

        return "✅ Cron-задача удалена!";
    }

    private function getLinuxTaskStatus($command) {
        exec("ps aux | grep '" . escapeshellarg($command) . "' | grep -v grep", $output, $return_code);

        if (empty($output)) {
            return "⚠ Не работает (ошибка: процесс не найден)";
        }

        return "✅ Работает корректно";
    }

    private function addWindowsTask($taskName, $command) {
        if ($this->isWindowsTaskExists($taskName)) {
            return "✅ Задача уже существует в Windows.";
        }

        $cmd = "schtasks /Create /SC MINUTE /MO 1 /TN \"{$taskName}\" /TR \"{$command}\" /F";
        exec($cmd, $output, $return_code);

        return ($return_code === 0) ? "✅ Задача добавлена в Windows!" : "❌ Ошибка при добавлении задачи.";
    }

    private function isWindowsTaskExists($taskName = null) {
        exec("schtasks /Query /TN \"". ($taskName) ."\" 2>&1", $output, $return_var);
        return $return_var === 0;
    }

    private function removeWindowsTask($taskName = null) {
        if (!$this->isWindowsTaskExists($taskName)) {
            return "❌ Задача не найдена в Windows.";
        }

        exec("schtasks /Delete /TN \"". ($taskName) ."\" /F", $output, $return_code);
        return ($return_code === 0) ? "✅ Задача удалена из Windows!" : "❌ Ошибка при удалении задачи.";
    }

    private function getWindowsTaskStatus($taskName) {
        exec("schtasks /Query /TN \"{$taskName}\" /FO LIST /V", $output, $return_var);
    
        if ($return_var !== 0) {
            return "❌ Не работает (задача отсутствует)";
        }
    
        $status = "⚠ Не работает (ошибка: неизвестно)";

        $output = array_map(function($line) {
            return iconv('Windows-1251', 'UTF-8', $line);
        }, $output);
    
        // Ищем статус задачи
        foreach ($output as $line) {
            if (strpos($line, "Статус:") !== false) {
                if (stripos($line, "Выполняется") !== false) {
                    $status = "✅ Работает корректно";
                } elseif (stripos($line, "Готово") !== false) {
                    $status = "⚠ Не работает (но активна)";
                } elseif (stripos($line, "Не удалось запустить") !== false) {
                    $status = "⚠ Не работает (ошибка: не удалось запустить)";
                }
                break;
            }
        }
    
        return $status;
    }
    
}
?>