<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, Photo};

//$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
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
                    <h1>Журнал</h1>
                    <script src="/js/diff.js"></script>
                    <script src="/js/pwrite-compare.js"></script>
                    <div class="sm">
                        <div class="p20 s1" style="float:left; padding:1px 5px 2px; margin-right:15px">В рассмотрении</div>
                        <div class="p20 s2" style="float:left; padding:1px 5px 2px; margin-right:15px">Принято</div>
                        <div class="p20 s7" style="float:left; padding:1px 5px 2px; margin-right:15px">Принято условно</div>
                        <div class="p20 s9" style="float:left; padding:1px 5px 2px; margin-right:15px">Принято как временное</div>
                        <div class="p20 s3" style="float:left; padding:1px 5px 2px; margin-right:15px">Задержано до исправления замечаний</div>
                        <div class="p20 s5" style="float:left; padding:1px 5px 2px; margin-right:15px">Не подходит для сайта</div>
                        <div class="p20 s8" style="float:left; padding:1px 5px 2px; margin-right:15px">Удалено</div>
                    </div><br clear="all"><br>
                    <div class="sm">Сортировка фотографий:&ensp;<b>в порядке загрузки</b>&ensp;·&ensp;<a href="/set.php?lk_upl_sort=1">в порядке выхода из очереди</a>&ensp;·&ensp;<a href="/set.php?lk_upl_sort=2">сначала неопубликованные (в порядке загрузки)</a></div><br>
                    <div class="p20w" style="display:block">
                        <table>
                            <tbody>
                                <tr>
                                    <th width="100">Изображение</th>
                                    <th width="90%">Информация</th>
                                    <th></th>
                                    <th class="c nw">Покинуло очередь</th>
                                    <th class="c nw">Действия</th>
                                </tr>
                                
                               <?php
                               $photos = DB::query('SELECT * FROM photos WHERE user_id=:uid ORDER BY id DESC', array(':uid'=>Auth::userid()));
                               foreach ($photos as $p) {
                                    if ($p['moderated'] === 0) {
                                        $color = 's0';
                                    } else if ($p['moderated'] === 2) {
                                        $color = 's15';
                                    } else {
                                        $color = 's12';
                                    }
                                    $author = new User($p['user_id']);
                                    $photo = new Photo($p['id']);
                                    echo ' <tr class="'.$color.'">
                                    <td class="pb-photo pb_photo">
                                        <a href="/photo/'.$p['id'].'/" target="_blank" class="prw">
                                            <img src="'.$p['photourl'].'" class="f">
                                            
                                        </a>
                                    </td>
                                    <td class="d">
                                        <p><span style="word-spacing:-1px"><b>'.htmlspecialchars($p['place']).'</b></span></p>
                                        <p class="sm"><b>'.Date::zmdate($p['posted_at']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">'.htmlspecialchars($author->i('username')).'</a></p>';
                                        if ($p['moderated'] === 2) {
                                            echo '<p class="sm"><b>Причина отклонения: '.$photo->declineReason((int)$photo->content('declineReason')).'</b></p>';
                                        }
                                        if ($photo->content('declineComment') != null) {
                                            echo '<p class="sm"><b>Комментарий: </b> '.$photo->content('declineComment').'</p>';
                                        }
                                        echo '
                                       
                                    </td>
                                    <td class="c" style="padding:10px">
                                    </td>';
                                    if ($p['endmoderation'] === -1) {
                                        $endm = 'На модерации';
                                    } else {
                                        if ($photo->content('iRate') === 0) {
                                            $irate = '-';
                                        } else {
                                            $irate = '+';
                                        }
                                        if ($photo->content('kRate') === 0) {
                                            $krate = '-';
                                        } else {
                                            $krate = '+';
                                        }
                                        $endm = Date::zmdate($p['endmoderation']).'<div style="margin-top:15px">Оценка<br><b>И'.$irate.' К'.$irate.'</b></div>';
                                    }
                                    echo '
                                    <td class="cs">'.$endm.'
                                        
                                    </td>';
                                    echo '
                                    <td class="cs"><a type="button" href="/lk/editimage?id='.$p['id'].'">Редактировать</a>
                                        
                                    </td>
                                </tr>';
                               }
                               ?>
                             

                            </tbody>
                        </table>
                    </div><br>

                </td>
            </tr>
            <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
            </tr>
           
        </tbody>
    </table>



</body>

</html>