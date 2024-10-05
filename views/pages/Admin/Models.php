<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, Vehicle};


$user = new \App\Models\User(Auth::userid());

if (!isset($_GET['type']) || $_GET['type'] != 'Photo') {
    if ($user->i('admin') === 2) {
        header('Location: ?type=Photo');
    }
}

?>
<!DOCTYPE html>
<html lang="ru">
<script src="https://code.jquery.com/jquery-3.7.1.js"></script>
<link rel="stylesheet" href="/static/css/notie.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) {
                                                        echo '?' . time();
                                                    } ?>">
<script src="/static/js/notie.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) {
                                    echo '?' . time();
                                } ?>"></script>

<script>
    notie.setOptions({
        transitionCurve: 'cubic-bezier(0.2, 0, 0.2, 1)'
    });
    var Notify = {
        noty: function(status, text) {

            if (status == 'danger') status = 'error';

            return notie.alert({
                type: status,
                text: text
            })

        },
    }
</script>

<body>
    <div class="container">
        <?= \App\Controllers\AdminController::loadMenu(); ?>
        <?= \App\Controllers\AdminController::loadContent(); ?>
        <h1><b>Модели</b></h1>
        <a href="?type=ModelsCreate" class="btn btn-primary">Создать</a>
        <div class="p20w" style="display:block">
            <table class="table">
                <tbody>
                    <tr>
                        <th width="100">ID</th>
                        <th width="20%">Название</th>
                        <th width="50%">Сущность</th>
                        <th>Действия</th>
                    </tr>

                    <?php
                    $photos = DB::query('SELECT * FROM entities_data ORDER BY id DESC');
                    foreach ($photos as $p) {
                        $entity = new Vehicle($p['entityid']);

                        echo ' <tr id="pht' . $p['id'] . '" class="' . $color . '">
                                    <td>
                                      '.$p['id'].'
                                    </td>
                                    <td>
                                       '.$p['title'].'
                                       
                                    </td>
                                     <td>
                                       '.$entity->i('title').'
                                       
                                    </td>
                                    <td class="c">
                                   ';

                            echo '<a href="/admin?type=EntityEdit&id=' . $p['id'] . '&mod=1" class="btn btn-primary">Редактировать</a>
                                    <a data-bs-toggle="modal" data-bs-target="#declinePhotoModal' . $p['id'] . '" href="#" class="btn btn-danger">Удалить</a>
                      
                                    </td>';
                     
                        echo '
                                </tr>
                                
                          
                                
                                ';
                    }
                    ?>


                </tbody>
            </table>
        </div><br>
        <?php
        $entities = DB::query('SELECT * FROM entities');
        foreach ($entities as $e) {
        }
        ?>


    </div>



</body>

</html>