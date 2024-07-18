<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

//$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
?>


<tr>
    <style>
    #sbmt {
        display: inline-block;
    box-sizing: border-box;
    vertical-align: middle;
    cursor: pointer;
    position: relative;
    padding: 2px 15px 3px;
    height: auto;
    text-align: center;
    font-family: var(--narrow-font);
    font-size: 17px;
    font-weight: bold;
    color: var(--theme-fg-color);
    background-color: #777;
    background-color: var(--theme-bg-color);
    transition: none;
    border: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    border-radius: 0;
    -webkit-border-radius: 0;
    }
    </style>
                <td class="main">
                    <h1>Журнал</h1>
                    <script src="/js/diff.js"></script>
                    <script src="/js/pwrite-compare.js"></script>
                    <div class="sm">
                        <div class="p20 s1" style="float:left; padding:1px 5px 2px; margin-right:15px">Требуют рассмотрения</div>
                        <div class="p20 s2" style="float:left; padding:1px 5px 2px; margin-right:15px">Принято</div>
                        <div class="p20 s7" style="float:left; padding:1px 5px 2px; margin-right:15px">Принято условно</div>
                        <div class="p20 s9" style="float:left; padding:1px 5px 2px; margin-right:15px">Принято как временное</div>
                        <div class="p20 s3" style="float:left; padding:1px 5px 2px; margin-right:15px">Задержано до исправления замечаний</div>
                        <div class="p20 s5" style="float:left; padding:1px 5px 2px; margin-right:15px">Не подходит для сайта</div>
                        <div class="p20 s8" style="float:left; padding:1px 5px 2px; margin-right:15px">Удалено</div>
                    </div><br clear="all"><br>
                    <div class="p20w" style="display:block">
                        <table>
                            <tbody>
                                <tr>
                                    <th width="100">Изображение</th>
                                    <th width="90%">Информация</th>
                                    <th>Действия</th>
                                    <th class="c nw">Покинуло очередь</th>
                                </tr>
                                
                               <?php
                               $photos = DB::query('SELECT * FROM photos WHERE moderated=0 ORDER BY id DESC');
                               foreach ($photos as $p) {
                                    if ($p['moderated'] === 0) {
                                        $color = 's0';
                                    } else if ($p['moderated'] === 2) {
                                        $color = 's15';
                                    } else {
                                        $color = 's12';
                                    }
                                    $author = new User($p['user_id']);
                                    echo ' <tr class="'.$color.'">
                                    <td class="pb-photo pb_photo">
                                        <a href="/photo/'.$p['id'].'/" target="_blank" class="prw">
                                            <img src="'.$p['photourl'].'" class="f">
                                            
                                        </a>
                                    </td>
                                    <td class="d">
                                        <p><span style="word-spacing:-1px"><b>'.htmlspecialchars($p['place']).'</b></span></p>
                                        <p class="sm"><b>'.Date::zmdate($p['posted_at']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">'.htmlspecialchars($author->i('username')).'</a></p>
                                       
                                    </td>
                                    <td class="c">
                                   ';
                                   if ($p['moderated'] === 0) {
                                    echo ' <div class="cmt-submit"><a href="/api/admin/images/setvisibility?id='.$p['id'].'&mod=1" id="sbmt">Принять</a></div><div style="font-size: 11px;"><a href="/api/admin/images/setvisibility?id='.$p['id'].'&mod=1" style="background-color:red !important; margin-top: 15px;" type="submit" id="sbmt">Отклонить</a></div>';
                                   }
                                   echo '
                                    </td>';
                                    if ($p['endmoderation'] === -1) {
                                        $endm = 'На модерации';
                                    } else {
                                        $endm = Date::zmdate($p['endmoderation']).'<div style="margin-top:15px">Оценка<br><b>И+ К+</b></div>';
                                    }
                                    echo '
                                    <td class="cs">'.$endm.'
                                        
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