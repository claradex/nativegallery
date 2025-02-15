<?php

namespace App\Controllers\Api\Admin\Contests;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class Create
{
    public function __construct()
    {
        $openprdate = strtotime($_POST['openpretendsdate']);
        $closeprdate = strtotime($_POST['closepretendsdate']);
        $opendate = strtotime($_POST['opendate']);
        $closedate = strtotime($_POST['closedate']);

        if ($_POST['startContestNow'] === "1") {
            $opendate = $closeprdate;
        }
        DB::query('INSERT INTO contests VALUES (\'0\', :themeid, :openprdate, :closeprdate, :opendate, :closedate, 0)', array(':themeid' => $_POST['themeid'], ':openprdate' => $openprdate, ':closeprdate'=>$closeprdate, ':opendate' => $opendate, ':closedate'=>$closedate));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
}
