<?php

namespace App\Controllers\Api\Admin\GeoDB;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF, Date};
use App\Models\{User, Vote, Photo};


class Load
{
    public function __construct()
    {
        $geodb = DB::query('SELECT * FROM geodb');
        foreach ($geodb as $u) {
            echo '<tr>
      <th>' . $u['id'] . '</th>
      <td>' . $u['title'] . '</td>
      <td><div class="cmt-submit"><a class="btn btn-sm btn-primary" href="/admin?type=UserEdit&user_id=' . $u['id'] . '">Редактировать</a><a style="margin-left: 15px;" class="btn btn-sm btn-danger" href="/admin?type=UserEdit&user_id=' . $u['id'] . '">Удалить</a></div></td>
    </tr>';
        }
    }
}
