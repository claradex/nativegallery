<?php
namespace App\Models;
use \App\Services\DB;

class Photo {

    public $photoid;
    private $photo;
    function __construct($photo_id) {
        $this->photoid = $photo_id;
        $this->photo = DB::query("SELECT * FROM photos WHERE id=:id", array(':id'=>$this->photoid))[0];
    }
    public function i($table) {
        return $this->photo[$table];
    }
    public function exists(): bool
    {
       return $this->i('id') !== null;
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
            case 6:
                return 'Файл сломан';
                break;
            default:
                return 'Не подходит для сайта';
                break;
        }
    }

}