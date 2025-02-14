<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

?>


<h1><b>Страницы</b></h1>
<a href="?type=PageCreate" class="btn btn-primary mb-3">Создать</a>

<div id="pages">
    <?php
    $pages = DB::query('SELECT * FROM pages ORDER BY id');
    foreach ($pages as $p) {
        echo '<div class="card mb-3"><div class="card-body">' . Date::zmdate($n['time']) . '<br>' . $n['body'] . '</div></div>';
    }
    ?>
</div>
