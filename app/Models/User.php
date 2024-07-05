<?php
namespace App\Models;
use \App\Services\DB;

class User {

    public $userid;
    function __construct(int $user_id) {
        $this->userid = $user_id;
    }
    public function i($table) {
        return DB::query("SELECT * FROM users WHERE id=:id", array(':id'=>$this->userid))[0][$table];
    }

}