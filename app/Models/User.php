<?php
namespace App\Models;
use \App\Services\DB;

class User {

    public $userid;
    function __construct($user_id) {
        $this->userid = $user_id;
    }
    public function i($table) {
        return DB::query("SELECT * FROM users WHERE id=:id", array(':id'=>$this->userid))[0][$table];
    }
    public function content($table) {
        $content = json_decode(self::i('content'), true);
        return $content[$table];
    }
    public function getPhotoUrl(): string
    {
        return $this->i('photourl');
    }
    
    public function getId(): int
    {
        return (int)$this->i('user_id');
    }

}