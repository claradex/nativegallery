<?php

namespace App\Controllers\Api\Admin\Settings;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF, TaskScheduler};
use App\Models\{User, Vote, Photo};


class TaskManager
{
    public function __construct()
    {
        $task = new TaskScheduler();
        foreach (NGALLERY_TASKS as $t) {
            $id = $_GET['id'];
            if (isset($t['id']) && $t['id'] == $id) {
                if ($_GET['type'] === 0) {
                    $task->removeTask($t['id'], "php ".$_SERVER['DOCUMENT_ROOT'].$t['handler']);
                } else {
                    $task->addTask(
                        $t['id'],
                        "php ".$_SERVER['DOCUMENT_ROOT'].$t['handler']." >> ".$_SERVER['DOCUMENT_ROOT'].NGALLERY['root']['logslocation']." 2>&1",
                        "* * * * *"
                    );
                }
                echo json_encode(
                    array(
                        'errorcode' => 0,
                        'error' => 0
                    )
                );
            }
        }
    }
}
