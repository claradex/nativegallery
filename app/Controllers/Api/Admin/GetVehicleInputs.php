<?php

namespace App\Controllers\Api\Admin;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Photo};


class GetVehicleInputs
{
    public function __construct()
    {
        $id = explode('/', $_SERVER['REQUEST_URI'])[4];
        $vehicle = DB::query('SELECT * FROM entities WHERE id=:id', array(':id'=>$id))[0];
        $data = json_decode($vehicle['sampledata'], true);
        foreach ($data as $d) {
            echo '
        <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">'.$d['name'].'</label>
            <input type="text" name="title" class="form-control" id="exampleFormControlInput1" placeholder="Вагон метро">
        </div>';
        }
    }
}
