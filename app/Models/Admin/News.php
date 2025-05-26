<?php
namespace App\Models\Admin;
use \App\Services\{DB, Date};

class News {

    public $id;
    public $table;
    function __construct(int $id) {
        $this->id = $id;
        $result = DB::query("SELECT * FROM news WHERE id=:id", [':id' => $this->id]);
        if (!empty($result)) {
            $this->table = (object) $result[0];
        } else {
            $this->table = (object) [];
        }
    }
    public function i($key) {
        return $this->table->$key ?? null;
    }
    public function view() {
        echo '<div class="card mb-3"><div class="card-body"><i>'
            . Date::zmdate($this->table->time) . '</i><br>' 
            . $this->table->body 
            . '<br><a class="btn btn-danger mt-3" href="#" onclick="deleteNews('.$this->id.'); return false;">Удалить</a></div></div>';
    }
}