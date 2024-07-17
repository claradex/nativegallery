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
                <div>Найдено изображений: <b><?=DB::query('SELECT COUNT(*) FROM photos WHERE user_id=:uid AND moderated=1 ORDER BY id DESC', array(':uid'=>$_GET['id']))[0]['COUNT(*)']?></b> &nbsp;·&nbsp; <a href="#sf">Новый поиск</a></div><br>
               <?php
               $photos = DB::query('SELECT * FROM photos WHERE user_id=:uid AND moderated=1 ORDER BY id DESC', array(':uid'=>$_GET['id']));
               foreach ($photos as $p) {
                echo '<div class="p20p">
                    <table>
                        <tbody>
                            <tr>
                                <td class="pb_photo" id="p1936120"><a href="/photo/'.$p['id'].'" target="_blank" class="prw"><img class="f" src="'.$p['photourl'].'">
                                        
                                    </a></td>
                                <td class="pb_descr">
                                
                                    <p><b class="pw-place">'.htmlspecialchars($p['place']).'</b></p>
                                    <span class="pw-descr">'.htmlspecialchars($p['postbody']).'</span>
                                    <p class="sm"><b>'.Date::zmdate($p['timeupload']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">'.htmlspecialchars($p['username']).'</a></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>';
               }
               ?>

                </tbody>
    </table>


</body>

</html>