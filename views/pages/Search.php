<?php

use App\Services\{Router, Auth, DB, Date};
?>
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
                <h1>Результаты поиска</h1>
                <div>Найдено изображений: <b>12</b> &nbsp;·&nbsp; <a href="#sf">Новый поиск</a></div><br>
               <?php
               $photos = DB::query('SELECT * FROM photos WHERE user_id=:uid ORDER BY id DESC', array(':uid'=>$_GET['id']));
               foreach ($photos as $p) {
                echo ' <div class="p20p">
                    <table>
                        <tbody>
                            <tr>
                                <td class="pb_photo" id="p1936120"><a href="/photo/'.$p['id'].'" target="_blank" class="prw"><img class="f" src="'.$p['photourl'].'">
                                        
                                    </a></td>
                                <td class="pb_descr">
                                
                                    <p><b class="pw-place">'.$p['place'].'</b></p>
                                    <span class="pw-descr">'.$p['postbody'].'</span>
                                    <p class="sm"><b>'.Date::zmdate($p['timeupload']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">mohooks</a></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>';
               }
               ?>

                </tbody>
    </table>



    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-1" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-2" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-3" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-4" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-5" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-6" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-7" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-8" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-9" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-10" tabindex="0" style="display: none;"></ul>
    <ul class="ui-autocomplete ui-front ui-menu ui-widget ui-widget-content ui-corner-all" id="ui-id-11" tabindex="0" style="display: none;"></ul>
</body>

</html>