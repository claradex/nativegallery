<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\Vehicle;

$id = explode('/', $_SERVER['REQUEST_URI'])[2];
$vehicle = new Vehicle($id);

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
                <h1>Пиксельск, бутылка pepsi № 001</h1>
                
                <table class="horlines">
                    <col width="150">
                    <col>
                    <?php
                    $vehiclevariables = json_decode($vehicle->getvehicle('sampledata'), true);
                    foreach ($vehiclevariables as $vb) {
                        echo '<tr class="h21"><td class="ds nw">'.$vb['name'].':</td><td class="d"><b>1975</b></td></tr>';
                    }
                    ?>

                   
                </table><br>
                
                
               
        <tr>
            <td class="footer"><b><a href="/">Главная</a> &nbsp; &nbsp; <a href="/lk/">Личный кабинет</a> &nbsp; &nbsp; <a href="https://forum.transphoto.org">Форум</a> &nbsp; &nbsp; <a href="/rules/">Правила</a> &nbsp; &nbsp; <a href="/admin/">Редколлегия</a></b><br>
                <a href="/set.php?dark=0" style="display:inline-block; padding:1px 10px; margin-top:5px; background-color:#ddd; color:#333">Светлая тема</a>
                <div class="sitecopy">&copy; Администрация ТрансФото и авторы материалов, 2002—2024<br>Использование фотографий и иных материалов, опубликованных на сайте, допускается только с разрешения их авторов.</div>
                <div style="margin:15px 0">
                    <noindex>

                        <!-- Yandex.Metrika informer -->
                        <a href="https://metrika.yandex.ru/stat/?id=73971775&amp;from=informer" target="_blank" rel="nofollow"><img src="https://informer.yandex.ru/informer/73971775/3_0_DDDDDDFF_DDDDDDFF_0_pageviews"
                                style="width:88px; height:31px; border:0;" alt="Яндекс.Метрика" title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)" class="ym-advanced-informer" data-cid="73971775" data-lang="ru" /></a>
                        <!-- /Yandex.Metrika informer -->

                    </noindex>
                </div>

            </td>
        </tr>
    </table>

</body>

</html>