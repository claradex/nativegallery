<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <h1>О сервере <b><?= NGALLERY['root']['title'] ?></b></h1>
                <p><?=NGALLERY['root']['description']?></p>
                <table width="100%">
                <div class="p20">
                        <h4><img src="/static/img/go-home.png">Общая информация</h4>
                        <ul class="straight">
                            <li>Зарегистрировано пользователей: <b><?=DB::query('SELECT COUNT(*) FROM users')[0]['COUNT(*)'];?></b></li>
                            <li>Опубликовано фотографий: <b><?=DB::query('SELECT COUNT(*) FROM photos')[0]['COUNT(*)'];?></b></li>
                        </ul>
                    </div>
                    <div class="p20">
                        <h4><img src="/static/img/220.ico">Администраторы</h4>
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            <?php
                            $admins = DB::query('SELECT * FROM users WHERE admin=1');
                            foreach ($admins as $a) {
                                echo '<li><b><a href="/author/'.$a['id'].'/"><img onerror="this.src = `/static/img/avatar.png`; this.onerror = null;" src="'.$a['photourl'].'" width="32" style="border-radius: 3px; margin-right: 5px;">'.htmlspecialchars($a['username']).'</a></b></li>';
                            }
                            ?>
                        </ul>
                    </div>
                </table>

            </td>
        </tr>
        <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>


</body>

</html>