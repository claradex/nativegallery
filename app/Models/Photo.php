<?php
namespace App\Models;
use \App\Services\DB;

class Photo {

    public $photoid;
    function __construct($user_id) {
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
    public function declineReason($number) {
        switch ($number) {
            case 1:
                return 'Малоинформативный бред';
                break;
            case 2:
                return 'Не подходит для сайта';
                break;
            case 3:
                return 'Порнография';
                break;
            case 4:
                return 'Травля/Издевательство над человеком';
                break;
            case 5:
                return 'Расчленёнка';
                break;
            default:
                return 'Не подходит для сайта';
                break;
        }
    }

}