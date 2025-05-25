<?php

namespace App\Controllers\Api\Images;

use \App\Services\{DB, Image};
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class LoadMap
{
    private const CHUNK_SIZE = 25;

    public function __construct()
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            error_log("API Request: " . json_encode($_GET));

            $bounds = $this->validateBounds($_GET);
            $photos = $this->fetchPhotos($bounds);

            error_log("Fetched photos count: " . count($photos));

            $validPhotos = $this->parallelProcessing($photos);

            echo json_encode($validPhotos);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function validateBounds(array $get): array
    {
        return [
            'north' => (float)($get['north'] ?? 90),
            'south' => (float)($get['south'] ?? -90),
            'west' => (float)($get['west'] ?? -180),
            'east' => (float)($get['east'] ?? 180)
        ];
    }

    private function fetchPhotos(array $bounds): array
    {
        return DB::query("
            SELECT p.id, p.photourl, p.content 
            FROM photos p
            WHERE 
                JSON_VALUE(p.content, '$.lat') BETWEEN ? AND ? AND
                JSON_VALUE(p.content, '$.lng') BETWEEN ? AND ?
            LIMIT 100
        ", [$bounds['south'], $bounds['north'], $bounds['west'], $bounds['east']]);
    }

    private function parallelProcessing(array $photos): array
    {
        $result = [];
        $scriptPath = str_replace('/', DIRECTORY_SEPARATOR, $_SERVER['DOCUMENT_ROOT'] . '/app/Controllers/Exec/Tasks/BlurNewImage.php');

        $chunks = array_chunk($photos, self::CHUNK_SIZE);
        $processes = [];

        try {
            foreach ($chunks as $chunk) {
                $process = new Process(
                    ['php', $scriptPath],
                    null,
                    null,
                    json_encode($chunk)
                );
                $process->start();
                $processes[] = $process;
                error_log("Started process PID: " . $process->getPid());
            }

            while (count($processes)) {
                foreach ($processes as $i => $process) {
                    if ($process->isRunning()) continue;

                    if (!$process->isSuccessful()) {
                        error_log("Process failed: " . $process->getErrorOutput());
                        throw new ProcessFailedException($process);
                    }

                    $output = json_decode($process->getOutput(), true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        throw new \RuntimeException("Invalid JSON response from worker");
                    }

                    $result = array_merge($result, $output);
                    unset($processes[$i]);
                }
                usleep(100000);
            }
        } catch (\Throwable $e) {
            foreach ($processes as $process) {
                if ($process->isRunning()) {
                    $process->stop(0);
                }
            }
            throw $e;
        }

        return $result;
    }
}
