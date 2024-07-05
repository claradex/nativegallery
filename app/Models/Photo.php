<?php
namespace App\Models;
use \App\Services\DB;

class Photo {

    public $photoid;
    function __construct(int $user_id) {
        $this->photoid = $user_id;
    }
    public function i($table) {
        return DB::query("SELECT * FROM photos WHERE id=:id", array(':id'=>$this->photoid))[0][$table];
    }
    public function content($table) {
        $content = json_decode(self::i('content'), true);
        return $content[$table];
    }

}