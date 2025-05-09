<?php
namespace App\Models;
use \App\Services\DB;

class User {

    public $userid;
    public $user;
    function __construct($user_id) {
        $this->userid = $user_id;
        $this->user = DB::query("SELECT * FROM users WHERE id=:id", array(':id'=>$this->userid))[0];
    }
    public function i($table) {
        return $this->user[$table];
    }
    public function content($table) {
        $content = json_decode(self::i('content'), true);
        return $content[$table];
    }

}