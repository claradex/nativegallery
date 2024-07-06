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
<?=Vote::photo(Auth::userid(), $id)?>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
        #map_canvas {
            width: 600px !important;
        }
        #photobar {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
#photobar {
    background-color: #000;
}
#photobar {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}
#photobar {
    margin: 0 -20px;
    position: relative;
    background-color: #333;
}
    </style>
            <td class="main">
                <center>
                 


                    <div id="photobar">
                        <div id="prev" title="Переход по профилю ТС"><span>&lt;</span></div>
                        <div id="next" title="Переход по профилю ТС"><span>&gt;</span></div>
                        <div style="display:inline-block">
                            <div id="underphoto_frame">
                                <div id="ph_frame">
                                    <img class="nozoom" id="ph" src="<?= $photo->i('photourl') ?>" alt="" title="Фотография">
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
                                <a href="#" vote="1" class="vote_btn <?php if (Vote::photo(Auth::userid(), $id) === 1) { echo 'voted'; } ?>"><span>Интересная фотография!</span></a>
                                <a href="#" vote="0" class="vote_btn <?php if (Vote::photo(Auth::userid(), $id) === 0) { echo 'voted'; } ?>"><span>Мне не&nbsp;нравится</span></a>
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
                        <?php
                        if ($photo->content('lat') != null && $photo->content('lng') != null) { ?>
                        <div class="p0" id="pp-item-exif">
                          
                            <h4 class="pp-item-header">Место на карте</h4>
                            <div class="pp-item-body">
                                <table class="linetable" id="exif">
                                <tr class="upl-map">
                                    <div id="map_frame" class="s11 p20" style="display:inline-block; padding:3px">
                                <div id="map_canvas"></div></div>
                                <script>
                                // Координаты выбранной точки
const selectedPoint = {
    lat: <?=$photo->content('lat')?>, // Пример: Широта Москвы
    lng: <?=$photo->content('lng')?>  // Пример: Долгота Москвы
};

// Создание карты
const map = L.map('map_canvas').setView([selectedPoint.lat, selectedPoint.lng], 13);

// Добавление базового слоя карты (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Добавление маркера на выбранной точке
const marker = L.marker([selectedPoint.lat, selectedPoint.lng]).addTo(map);

// Установка всплывающего окна на маркере
marker.bindPopup("<b>Выбранная точка</b>").openPopup();

</script>
	</tr>

                                </table>
                            </div>
                        </div>
                        <?php } ?>


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