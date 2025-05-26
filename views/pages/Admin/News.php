<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

//$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
?>


<h1><b>Новости сайта</b></h1>
<a data-bs-toggle="modal" data-bs-target="#createNewsModal" href="#" class="btn btn-primary">Создать</a>

<div class="modal fade" id="createNewsModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Создать новость</b></h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">

                <div class="mb-3">
                    <label for="body" class="form-label">Содержание</label>
                    <textarea class="form-control" id="body" name="body" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>
                <a href="#" onclick="createNews(); return false;" data-bs-dismiss="modal" class="btn btn-primary">Создать</a>

            </div>
        </div>
    </div>
</div>
<div id="news">
    <?php
    $news = DB::query('SELECT * FROM news ORDER BY id');
    foreach ($news as $n) {
        $nn = new \App\Models\Admin\News($n['id']);
        $nn->view();
    }
    ?>
</div>