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
    public static function fetchAll($user_id = NULL) {
        if ($user_id != NULL) {
            return DB::query("SELECT COUNT(*) FROM photos WHERE user_id=:id", array(':id'=>$user_id))[0]['COUNT(*)'];
        }
    }
    public function content($table) {
        $content = json_decode(self::i('content'), true);
        return $content[$table];
    }

}