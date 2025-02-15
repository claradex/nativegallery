<?php

namespace App\Services;
class TaskScheduler {
    private $taskName;
    private $command;
    private $interval;

    public function __construct() {
        // Конструктор теперь не принимает аргументы
    }

    private function isWindows() {
        return strtoupper(substr(PHP_OS, 0, 3)) === 'WIN';
    }

    // Метод для добавления задачи с параметрами
    public function addTask($taskName, $command, $interval = "* * * * *") {
        $this->taskName = $taskName;
        $this->command = $command;
        $this->interval = $interval;

        return $this->isWindows() ? $this->addWindowsTask() : $this->addLinuxTask();
    }

    public function isTaskExists($taskName = null, $command = null) {
        return $this->isWindows() 
            ? $this->isWindowsTaskExists($taskName) 
            : $this->isLinuxTaskExists($command);
    }

    public function removeTask($taskName = null, $command = null) {
        return $this->isWindows() 
            ? $this->removeWindowsTask($taskName) 
            : $this->removeLinuxTask($command);
    }

    private function addLinuxTask() {
        $cronJob = "{$this->interval} {$this->command}";
        if ($this->isLinuxTaskExists($this->command)) {
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
            if (strpos($line, $command ?? $this->command) !== false) {
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
            return strpos($line, $command ?? $this->command) === false;
        });

        file_put_contents("/tmp/my_cron", implode(PHP_EOL, $filteredOutput) . PHP_EOL);
        exec("crontab /tmp/my_cron");
        unlink("/tmp/my_cron");

        return "✅ Cron-задача удалена!";
    }

    private function addWindowsTask() {
        if ($this->isWindowsTaskExists($this->taskName)) {
            return "✅ Задача уже существует в Windows.";
        }

        $command = "schtasks /Create /SC MINUTE /MO 1 /TN \"{$this->taskName}\" /TR \"{$this->command}\" /F";
        exec($command, $output, $return_code);

        return ($return_code === 0) ? "✅ Задача добавлена в Windows!" : "❌ Ошибка при добавлении задачи.";
    }

    private function isWindowsTaskExists($taskName = null) {
        exec("schtasks /Query /TN \"". ($taskName ?? $this->taskName) ."\" 2>&1", $output, $return_var);
        return $return_var === 0;
    }

    private function removeWindowsTask($taskName = null) {
        if (!$this->isWindowsTaskExists($taskName)) {
            return "❌ Задача не найдена в Windows.";
        }

        exec("schtasks /Delete /TN \"". ($taskName ?? $this->taskName) ."\" /F", $output, $return_code);
        return ($return_code === 0) ? "✅ Задача удалена из Windows!" : "❌ Ошибка при удалении задачи.";
    }
}
?>