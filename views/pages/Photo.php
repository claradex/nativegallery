<?php

use App\Services\{DB, Auth, Date, Json};
use App\Models\{User, Vote, Comment};

$id = explode('/', $_SERVER['REQUEST_URI'])[2];
$photo = new \App\Models\Photo($id);
$photouser = new \App\Models\User($photo->i('user_id'));
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
                <center>
                    <script>
                        var pid = 1361063;
                        var video = 0;
                        var self_p = 0;
                        var subscr_pro = 0;
                        var subscr_fav = 0;
                        addTexts({
                            'P_CURRENT': 'Это — текущая фотография.',
                            'P_MOVE_FIRST': 'Это самое первое фото',
                            'P_MOVE_LAST': 'Это самое новое фото',
                            'P_MOVE_ALONE_V': 'Это единственное фото ТС',
                            'P_MOVE_ALONE_G': 'Это единственное фото в галерее',
                            'P_QUOTE_MSG': 'Нет смысла цитировать последнее сообщение целиком.<br />Если Вы хотите процитировать часть сообщения, выделите часть текста и нажмите на ссылку ещё раз.',
                            'P_QUOTE_LEN': 'Слишком длинная цитата. Пользователям будет неудобно читать такой комментарий.<br>Пожалуйста, выделите конкретное предложение, на которое вы отвечаете, и нажмите на ссылку еще раз.',
                            'P_QUOTE_TXT': 'Цитата',
                            'P_DEL_CONF': 'Вы действительно хотите удалить свой комментарий?',
                            'P_WAIT': 'Пожалуйста, подождите...',
                            'P_ADDFAV': 'Добавить фото в Избранное',
                            'P_DELFAV': 'Удалить фото из Избранного',
                            'P_ENTERTEXT': 'Введите текст комментария',
                            'LOADING': 'Загрузка...',
                            'NO_VOTES': 'Нет голосов',
                            'MAP_OSM': 'Карта OpenStreetMap',
                            'MAP_OSM_BW': 'Чёрно-белая карта OpenStreetMap',
                            'MAP_OSM_HOT': 'Карта Humanitarian OpenStreetMap Team',
                            'MAP_TOPO': 'Карта OpenTopoMap',
                            'MAP_WIKIMEDIA': 'Карта Wikimedia',
                            'MAP_OPNV': 'Карта ÖPNVKarte',
                            'MAP_OPENPTMAP': 'Общественный транспорт от OpenPtMap',
                            'MAP_RAILWAY': 'Железная дорога от OpenRailwayMap',
                            'MAP_BING': 'Спутник Bing',
                            'MAP_YANDEX': 'Карта Яндекс',
                            'MAP_YANDSAT': 'Спутник Яндекс'
                        });
                        var showmap = false;
                        var vid = 78618;
                        var gid = 0;
                        var aid = 0;
                        var upd = 0;
                    </script>
                    <div style="background-color:#555; margin:0 -20px; padding:7px">
                        <!-- Yandex.RTB R-A-115118-6 -->
                        <div id="yandex_rtb_R-A-115118-6"></div>
                        <script>
                            window.yaContextCb.push(() => {
                                Ya.Context.AdvManager.render({
                                    renderTo: 'yandex_rtb_R-A-115118-6',
                                    blockId: 'R-A-115118-6'
                                })
                            })
                        </script>
                    </div>

                    <div id="photobar">
                        <div id="prev" title="Переход по профилю ТС"><span>&lt;</span></div>
                        <div id="next" title="Переход по профилю ТС"><span>&gt;</span></div>
                        <div style="display:inline-block">
                            <div id="underphoto_frame">
                                <div id="ph_frame">
                                    <img id="ph" src="<?= $photo->i('photourl') ?>" alt="" title="Фотография">
                                </div>
                            </div>
                        </div>
                    </div>
                    <script>
                        function checkPhotoSize() {
                            var photo = $('#ph');
                            if (!photo.length) return;

                            var w = photo[0].naturalWidth;
                            var h = photo[0].naturalHeight;

                            var pw = photo.width();
                            var ww = $(window).width();
                            var wh = $(window).height();

                            if (h > w && w < ww)
                                photo.addClass('v-zoom');
                            else photo.removeClass('v-zoom');

                            if (w === undefined || w == 0 || w > pw || w > ww || (h > wh && h > w)) {
                                photo.removeClass('nozoom').off('click').on('click', function() {
                                    photo.toggleClass('zoomed');
                                });
                            } else photo.addClass('nozoom').off('click');
                        }

                        // Масштабирование фото
                        $('#ph').on('load', checkPhotoSize);
                        $(window).on('resize', checkPhotoSize);
                        checkPhotoSize();
                    </script>
                </center>
            </td>
        </tr>
    </table>
    <div id="pmain">
        <div>
            <div style="line-height:15px; margin-bottom:10px">
                <table class="pwrite">
                    <tr>
                        <td class="nw" valign="top" align="right"><b><?= $photo->i('place') ?></b></td>
                        <td class="nw" align="left" valign="top"></td>
                    </tr>

                </table>
            </div>
        </div>
        <div>
            <div style="padding-top:8px"><?= $photo->content('comment') ?></div>
        </div><br>
        <div>Прислал <a href="/author/<?= $photo->i('user_id') ?>/"><?= $photouser->i('username') ?></a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Дата: <b><?= Date::zmdate($photo->i('posted_at')) ?></b></div>
        <table id="pp-items">
            <tr>
                <td id="pp-left-col">
                    <div class="p20a" id="pp-item-info">
                        <h4>Статистика</h4>
                        <div class="sm">
                            <div style="margin-bottom:10px">Лицензия: <b>BY-NC</b></div>
                            Опубликовано <b><?= Date::zmdate($photo->i('timeupload')) ?></b><br>
                        </div>
                    </div>


                    <div class="p20a" id="pp-item-vote">
                        <h4 class="pp-item-header">Оценка</h4>
                        <div class="sm">
                            <img class="loader" pid="1361063" src="/img/loader.png">
                            <div class="rtext">Рейтинг: <b id="rating"><?= Vote::count($id) ?></b></div>
                            <div class="star" pid="1361063"></div>
                            <div class="vote" pid="<?= $id ?>">
                                <a href="#" vote="1" class="vote_btn"><span>Интересная фотография!</span></a><a href="#" vote="0" class="vote_btn"><span>Мне не&nbsp;нравится</span></a>
                            </div>
                            <div id="votes" class="votes">
                                <table class="vblock pro">
                                    <?php
                                    $votespos = DB::query('SELECT * FROM photos_rates WHERE photo_id=:pid AND type=1', array(':pid' => $id));
                                    foreach ($votespos as $ps) {
                                        $uservote = new User($ps['user_id']);
                                        echo ' <tr>
                                        <td><a href="/author/' . $ps['user_id'] . '/">' . $uservote->i('username') . '</a></td>
                                        <td class="vv">+1</td>
                                    </tr>';
                                    }
                                    ?>

                                </table>
                                <table class="vblock coN">
                                    <?php
                                    $votespos = DB::query('SELECT * FROM photos_rates WHERE photo_id=:pid AND type=0', array(':pid' => $id));
                                    foreach ($votespos as $ps) {
                                        $uservote = new User($ps['user_id']);
                                        echo ' <tr>
                                        <td><a href="/author/' . $ps['user_id'] . '/">' . $uservote->i('username') . '</a></td>
                                        <td class="vv">-1</td>
                                    </tr>';
                                    }
                                    ?>

                                </table>
                            </div>
                        </div>
                    </div>


                    <div class="p20a" id="pp-item-link">
                        <h4 style="margin-bottom:7px">Постоянная ссылка на фото</h4>
                        <input type="text" value="https://<?= $_SERVER['SERVER_NAME'] ?>/photo/<?= $id ?>/" readonly="readonly" class="pp-link" onclick="this.select()">
                        <script src="https://yastatic.net/share2/share.js"></script>
                        <div class="ya-share2" data-curtain data-size="s" data-shape="round" data-services="vkontakte,odnoklassniki,telegram,twitter,whatsapp"></div>
                    </div>


                </td>
                <td id="pp-main-col">
                    <div id="pp-item-vdata">

                        <div class="p0" id="pp-item-exif">
                            <h4 class="pp-item-header">Параметры съёмки</h4>
                            <div class="pp-item-body">
                                <table class="linetable" id="exif">
                                    <?php
                                    $data = json_decode($photo->i('exif'), true);

                                    foreach ($data as $key => $value) {
                                        if ($key === 'FILE.FileDateTime') {
                                            $value = Date::zmdate($value);
                                        }
                                        if (is_array($value)) {
                                            $value = implode(', ', $value); // Convert array to a comma-separated string
                                        }

                                        echo '
                                            <tr class="s11 h21">
                                                <td class="ds nw" width="30%">' . htmlspecialchars($key) . ':</td>
                                                <td class="ds">' . htmlspecialchars($value) . '</td>
                                            </tr>';
                                    }


                                    ?>

                                </table>
                            </div>
                        </div>

                        <div class="p0" id="pp-item-comments">
                            <h4 class="pp-item-header">Комментарии<span style="font-weight:normal"> <span style="color:#aaa">&middot;</span> 1</span></h4>
                           <div id="posts">
                           <?php
                           $comments = DB::query('SELECT * FROM photos_comments WHERE photo_id=:pid', array(':pid'=>$id));
                           foreach ($comments as $c) {
                                $comm = new Comment($c);
                                $comm->i();
                           }
                           ?>
                           </div>
                            <div class="cmt-write s1">
                                <h4 class="pp-item-header">Ваш комментарий</h4>
                                <div style="padding:0 11px 11px">
                                    <form action="/comment.php" method="post" id="f1">
                                        <input type="hidden" name="sid" value="hgdl6old9r9qodmvkn1r4t7d6h">
                                        <input type="hidden" name="last_comment_rand" value="893329610">
                                        <input type="hidden" name="id" id="id" value="<?=$id?>">
                                        <input type="hidden" name="subj" id="subj" value="p">
                                        <textarea name="wtext" id="wtext"></textarea><br>
                                        <div class="cmt-submit"><input type="submit" value="Добавить комментарий" id="sbmt">&ensp;&emsp;Ctrl + Enter
                                        </div>
                                    </form>
                                </div>
                                
                            </div>
                        </div>
                </td>
            </tr>
        </table>
        <script>
             $(document).ready(function() {
        $('#f1').submit(function(e) {
            e.preventDefault();
            $.ajax({
                type: "POST",
                url: '/api/photo/comment',
                data: $(this).serialize(),
                success: function(response) {
                    var jsonData = JSON.parse(response);
                    if (jsonData.errorcode == "1") {
                        Notify.noty('danger', 'Комментарий неккоректен');
                        //$("#result").html("<div class='alert alert-dangernew container mt-5' role='alert'>Неправильная почта или пароль!</div>");
                    } else if (jsonData.errorcode == "2") {
                        Notify.noty('warning', 'Пожалуйста, подождите...');
                        setTimeout(function(){
                            window.location.replace(jsonData.twofaurl);
                        }, 1000);
                    } else if (jsonData.errorcode == "0") {
                        Notify.noty('success', 'Комментарий отправлен!');
                        //$("#result").html("<div class='alert alert-successnew container mt-5' role='alert'>Успешный вход!</div>");
                        $.ajax({


                        type: "POST",
                        url: "/api/photo/getcomments/<?=$id?>",
                        processData: false,
                        async: true,
                        success: function(r) {
                            $('#posts').html(r)


                        },
                        error: function(r) {
                            console.log(r)
                        }

                        });
                                                
                    } else {
                        Notify.noty('danger', 'Неизвестная ошибка');
                    }
                }
            });
        });
    });
    </script>
    </div>



</html>