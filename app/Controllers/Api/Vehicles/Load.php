<?php

namespace App\Controllers\Api\Vehicles;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Models\{User, Vote, Comment, Vehicle};


class Load
{
    public function __construct()
    {

        $entities_data = DB::query('SELECT * FROM entities_data WHERE (LOWER(title) LIKE :value) OR (LOWER(id) LIKE :value) AND entityid=:pid', array(':pid' => $_GET['type'], ':value'=>'%'.$_GET['num'].'%'));
        echo '<table>';
        foreach ($entities_data as $e) {
            $vehicle = new Vehicle($e['entityid']);
            echo '<tbody class="found_vehicle s11" data-state="1" data-vid="'.$e['id'].'" data-cid="2" data-type="3" data-twoside="0">
                <tr>
                    <th width="100">ID</th>
                    <th width="90%">Название</th>
                    <th>Примечание</th>
                    <th class="c nw">Тип</th>
                </tr>
                <tr>
                    <td style="padding:10px"><a href="/vehicle/'.$e['id'].'" target="_blank" class="num pcnt">'.$e['id'].'</a>
                    </td>
                    <td style="padding:10px; font-size:16px" class="mname">hhhhh</td>
                    <td style="padding:10px" class="d">
                       '.$e['comment'].'
                    </td>
                    <td style="padding:10px" class="d">
                        '.$vehicle->i('title').'
                    </td>
                </tr>
               
                </tr>
            </tbody>';
        }
        echo '</table>';

      
           
       
                }
            }
