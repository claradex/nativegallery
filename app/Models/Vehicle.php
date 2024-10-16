<?php
namespace App\Models;
use \App\Services\DB;

class Vehicle {

    public $userid;
    function __construct(int $user_id) {
        $this->userid = $user_id;
    }
    public function i($table) {
        return DB::query("SELECT * FROM entities WHERE id=:id", array(':id'=>$this->userid))[0][$table];
    }
    public function getvehicle($table) {
        return DB::query("SELECT * FROM entities WHERE id=:id", array(':id'=>self::i('entityid')))[0][$table];
    }
 

}