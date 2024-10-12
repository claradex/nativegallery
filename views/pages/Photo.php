<?php

use App\Services\{DB, Auth, Date, Json};
use App\Models\{User, Vote, Comment};

$id = explode('/', $_SERVER['REQUEST_URI'])[2];
$photo = new \App\Models\Photo($id);
if ($photo->i('id') !== null) {
    if ($photo->content('video') != null) {
        $extname = 'видео';
        $extnamef = 'видеоролик';
    } else {
        $extname = 'фото';
        $extnamef = 'фотография';
    }
    $photouser = new \App\Models\User($photo->i('user_id'));
    $user = new \App\Models\User(Auth::userid());
    if ($photo->i('moderated') === 0) {
        if ($photo->i('user_id') === Auth::userid() || $user->i('admin') > 0) {
            $moderated = true;
        } else {
            $moderated = false;
        }
    } else if ($photo->i('moderated') === 1) {
        $moderated = true;
        if (DB::query('SELECT * FROM photos_views WHERE user_id=:uid AND photo_id=:pid ORDER BY id DESC LIMIT 1', array(':uid' => Auth::userid(), ':pid' => $id))[0]['time'] <= time() - 86400) {
            DB::query('INSERT INTO photos_views VALUES (\'0\', :uid, :pid, :time)', array(':uid' => Auth::userid(), ':pid' => $id, ':time' => time()));
        }
    }
}

?>

<!DOCTYPE html>
<html lang="ru">

<head>
    <meta http-equiv="content-type" content="text/html;charset=UTF-8">
    <meta name="description" content="<?= NGALLERY['root']['description'] ?>">
    <meta name="keywords" content="<?= NGALLERY['root']['keywords'] ?>">
    <meta property="og:title" content="<?= $photo->i('title') ?> — Фото">
    <link rel="alternate" hreflang="x-default" href="<?= $_SERVER['REQUEST_URI'] ?>">
    <meta property="og:image" content="<?= $photo->i('photourl') ?>">
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>

</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
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
                <?php
                if ($photo->i('moderated') === 0 && $moderated === true) {
                    echo '<div class="label-orange" style="padding:10px; margin:0 -20px; color:#fff">
<center><h4 style="color:#fff; margin-bottom:3px">Это ' . $extname . ' пока не опубликовано</h4>
<div>Сейчас ' . $extnamef . ' рассматривается модераторами и пока не видна другим пользователям. Это может занять определённое время, иногда до нескольких дней.<br><br>
<b>Здесь Вы можете увидеть, как будет выглядеть страница с фотографией после публикации.</b></center></div>
</div>';
                }
                if ($photo->i('moderated') === 2 && $moderated === true) {
                    echo '<div class="label-red" style="padding:10px; margin:0 -20px; color:#fff"><center>
<h4 style="color:#fff; margin-bottom:3px">Фотография не принята к публикации</h4>
<div></div>
<div style="margin-top:7px">' . $photo->declineReason($photo->content('declineReason')) . '</div></center>
</div>';
                }
                ?>
                <div id="err"></div>
                <?php
                if ($photo->i('id') !== null && $moderated === true) {
                ?>
                    <center>



                        <div id="photobar">
                            <div id="prev" title="Переход по профилю ТС"><span>&lt;</span></div>
                            <div id="next" title="Переход по профилю ТС"><span>&gt;</span></div>
                            <div style="display:inline-block">
                                <div id="underphoto_frame">
                                    <div id="ph_frame">
                                        <?php
                                        if ($photo->content('videourl') != null) { ?>
                                            <video controls>
                                                <source src="<?= $photo->content('videourl') ?>">
                                            </video>

                                        <?php } else { ?>
                                            <img onerror="errimg(); this.onerror = null;" id="ph" src="<?= $photo->i('photourl') ?>" alt="" title="Фотография">
                                        <?php
                                        }
                                        if ($photo->i('priority') === 1) { ?>
                                            <div class="underphoto s17" style="cursor:help" title="Фотография не удовлетворяет действующим на момент публикации критериям качества снимков."><i style="position:relative; top:1px" class="fas fa-info-circle"></i>&ensp;<b class="dot">Условная публикация</b></div>
                                        <?php } else if ($photo->i('priority') === 2) {  ?>
                                            <div class="underphoto s19" style="cursor:help" title="Изображение будет удалено с сайта через некоторое время"><i style="position:relative; top:1px" class="fas fa-clock"></i>&ensp;<b class="dot">Временная публикация</b></div>
                                        <?php } ?>
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
                        <?php
                        if ($photo->i('postbody') != null) { ?>
                            <td class="nw" valign="top" align="right"><b><?= htmlspecialchars($photo->i('postbody')) ?></b></td>
                        <?php } ?>
                    </tr>

                </table>
                <?php
                    if ($photo->i('gallery_id') != 0 || $photo->i('gallery_id') != null) {
                        echo '<div><a href="/articles/' . $photo->i('gallery_id') . '/">' . DB::query('SELECT title FROM galleries WHERE id=:id', array(':id' => $photo->i('gallery_id')))[0]['title'] . '</a></div>';
                    }
                ?>
            </div>
        </div>
        <div>
            <?php
                    if ($photo->content('comment') != null) { ?>
                <div style="padding-top:8px"><?= htmlspecialchars($photo->content('comment')) ?></div>
            <?php } ?>
        </div><br>
        <?php
                    if ($photo->i('posted_at') === 943909200 || Date::zmdate($photo->i('posted_at')) === '30 ноября 1999 в 00:00') {
                        $date = 'не указана';
                    } else {
                        $date = Date::zmdate($photo->i('posted_at'));
                    }
        ?>
        <div>Прислал <a href="/author/<?= $photo->i('user_id') ?>/"><?= $photouser->i('username') ?></a>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Дата: <b><?= $date ?></b></div>
        <table id="pp-items">
            <tr>
                <td id="pp-left-col">
                    <div class="p20a" id="pp-item-info">
                        <h4>Статистика</h4>
                        <div class="sm">
                            <div style="margin-bottom:10px">Лицензия: <b>BY-NC</b></div>
                            Опубликовано <b><?= Date::zmdate($photo->i('timeupload')) ?></b><br>
                            Просмотров — <?= DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id' => $id))[0]['COUNT(*)'] ?>
                            <br><br>
                            <a href="/photoext?id=<?= $id ?>">Подробная информация</a>
                        </div>
                    </div>
                    <div class="p0" id="pp-item-tools">
                        <h4 class="pp-item-header">Инструменты</h4>
                        <div class="pp-item-body" style="margin:7px 5px">
                            <div class="sm">
                                <?php
                                if (DB::query('SELECT user_id FROM photos_favorite WHERE photo_id=:pid AND user_id=:uid', array(':uid' => Auth::userid(), ':pid' => $id))) {
                                    $fav = 1;
                                    $textfav = 'Удалить фото из Избранного';
                                } else {
                                    $fav = 0;
                                    $textfav = 'Добавить фото в Избранное';
                                }
                                ?>
                                <a class="tool-link" href="#" id="favLink" faved="<?= $fav ?>"><?= $textfav ?></a>
                            </div>
                        </div>
                    </div>
                    <?php if ($photo->i('moderated') === 1 && $photo->content('rating') != 'disabled') { ?>
                        <div class="p20a" id="pp-item-vote">
                            <h4 class="pp-item-header">Оценка</h4>
                            <div class="sm">
                                <img class="loader" pid="1361063" src="/img/loader.png">
                                <div class="rtext">Рейтинг: <b id="rating"><?= Vote::count($id) ?></b></div>
                                <div class="star" pid="1361063"></div>
                                <?php
                                if (Auth::userid() > 0) { ?>
                                    <div class="vote" pid="<?= $id ?>">
                                        <a href="#" vote="1" class="vote_btn <?php if (Vote::photo(Auth::userid(), $id) === 1) {
                                                                                    echo 'voted';
                                                                                } ?>"><span>Интересная фотография!</span></a>
                                        <a href="#" vote="0" class="vote_btn <?php if (Vote::photo(Auth::userid(), $id) === 0) {
                                                                                    echo 'voted';
                                                                                } ?>"><span>Мне не&nbsp;нравится</span></a>
                                    </div>
                                <?php } ?>
                                <div id="votes" class="votes">
                                    <table class="vblock pro">
                                        <?php
                                        $votespos = DB::query('SELECT * FROM photos_rates WHERE photo_id=:pid AND type=1 ORDER BY id DESC', array(':pid' => $id));
                                        foreach ($votespos as $ps) {
                                            $uservote = new User($ps['user_id']);
                                            echo ' <tr>
                                        <td><a href="/author/' . $ps['user_id'] . '/">' . htmlspecialchars($uservote->i('username')) . '</a></td>
                                        <td class="vv">+1</td>
                                    </tr>';
                                        }
                                        ?>

                                    </table>
                                    <table class="vblock coN">
                                        <?php
                                        $votespos = DB::query('SELECT * FROM photos_rates WHERE photo_id=:pid AND type=0 ORDER BY id DESC', array(':pid' => $id));
                                        foreach ($votespos as $ps) {
                                            $uservote = new User($ps['user_id']);
                                            echo ' <tr>
                                        <td><a href="/author/' . $ps['user_id'] . '/">' . htmlspecialchars($uservote->i('username')) . '</a></td>
                                        <td class="vv">-1</td>
                                    </tr>';
                                        }
                                        ?>

                                    </table>
                                </div>
                            </div>
                        </div>
                    <?php } ?>


                    <div class="p20a" id="pp-item-link">
                        <h4 style="margin-bottom:7px">Постоянная ссылка на фото</h4>
                        <input type="text" value="https://<?= $_SERVER['SERVER_NAME'] ?>/photo/<?= $id ?>/" readonly="readonly" class="pp-link" onclick="this.select()">
                        <script src="https://yastatic.net/share2/share.js"></script>
                        <div class="ya-share2" data-curtain data-size="s" data-shape="round" data-services="vkontakte,odnoklassniki,telegram,twitter,whatsapp"></div>
                    </div>


                </td>
                <style>
                    .header-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .pp-item-header {
                        margin: 0;
                    }

                    .header-container img {
                        margin-right: 5px;
                        height: 20px;
                    }
                </style>
                <td id="pp-main-col">
                    <div id="pp-item-vdata">
                        <?php
                        if (($photo->content('type') != 'none') && (json_decode($photo->i('exif'), true)['type'] != 'none') && ($photo->content('rating') != 'disabled')) {
                        ?>
                            <div class="p0" id="pp-item-exif">
                                <div class="header-container">
                                    <h4 class="pp-item-header">Параметры съёмки</h4>
                                    <!--img src="/static/img/flex_arrow_open2.png" height="100%"-->
                                </div>
                                <div class="pp-item-body">
                                    <table class="linetable" id="exif">
                                        <?php
                                        $data = json_decode($photo->i('exif'), true);
                                        $exif_translations = [
                                            'FILE.FileName' => 'Имя файла',
                                            'FILE.FileSize' => 'Размер файла',
                                            'FILE.FileDateTime' => 'Дата и время файла',
                                            'COMPUTED.MimeType' => 'Тип MIME',
                                            'IFD0.Make' => 'Производитель камеры',
                                            'IFD0.Model' => 'Модель камеры',
                                            'IFD0.Orientation' => 'Ориентация',
                                            'IFD0.XResolution' => 'Разрешение по X',
                                            'IFD0.YResolution' => 'Разрешение по Y',
                                            'IFD0.ResolutionUnit' => 'Единица разрешения',
                                            'IFD0.Software' => 'Программное обеспечение',
                                            'IFD0.DateTime' => 'Дата и время',
                                            'IFD0.Artist' => 'Автор',
                                            'IFD0.Copyright' => 'Авторские права',
                                            'EXIF.ExposureTime' => 'Время экспозиции',
                                            'EXIF.FNumber' => 'Диафрагма',
                                            'EXIF.ExposureProgram' => 'Программа экспозиции',
                                            'EXIF.ISOSpeedRatings' => 'ISO',
                                            'EXIF.ExifVersion' => 'Версия EXIF',
                                            'EXIF.DateTimeOriginal' => 'Дата и время оригинала',
                                            'EXIF.DateTimeDigitized' => 'Дата и время оцифровки',
                                            'EXIF.ShutterSpeedValue' => 'Значение выдержки',
                                            'EXIF.ApertureValue' => 'Значение диафрагмы',
                                            'EXIF.BrightnessValue' => 'Значение яркости',
                                            'EXIF.ExposureBiasValue' => 'Экспокоррекция',
                                            'EXIF.MaxApertureValue' => 'Максимальная диафрагма',
                                            'EXIF.MeteringMode' => 'Режим экспозамера',
                                            'EXIF.LightSource' => 'Источник света',
                                            'EXIF.Flash' => 'Вспышка',
                                            'EXIF.FocalLength' => 'Фокусное расстояние',
                                            'EXIF.SubjectArea' => 'Область объекта',
                                            'EXIF.FlashpixVersion' => 'Версия Flashpix',
                                            'EXIF.ColorSpace' => 'Цветовое пространство',
                                            'EXIF.PixelXDimension' => 'Размер изображения по X',
                                            'EXIF.PixelYDimension' => 'Размер изображения по Y',
                                            'EXIF.SensingMethod' => 'Метод съёмки',
                                            'EXIF.SceneType' => 'Тип сцены',
                                            'EXIF.ExposureMode' => 'Режим экспозиции',
                                            'EXIF.WhiteBalance' => 'Баланс белого',
                                            'EXIF.FocalLengthIn35mmFilm' => 'Фокусное расстояние для 35мм плёнки',
                                            'EXIF.SceneCaptureType' => 'Тип съёмки',
                                            'EXIF.GainControl' => 'Регулировка усиления',
                                            'EXIF.Contrast' => 'Контрастность',
                                            'EXIF.Saturation' => 'Насыщенность',
                                            'EXIF.Sharpness' => 'Резкость',
                                            'GPS.GPSLatitude' => 'Широта',
                                            'GPS.GPSLongitude' => 'Долгота',
                                            'GPS.GPSAltitude' => 'Высота',
                                            'GPS.GPSTimeStamp' => 'Время GPS',
                                            'GPS.GPSDateStamp' => 'Дата GPS'
                                        ];
                                        function translate_flash_value($flash_value) {
                                            $flash_descriptions = [
                                                0 => 'Выключена',
                                                1 => 'Включена',
                                                2 => 'Сработала с подавлением эффекта красных глаз',
                                                3 => 'Сработала в принудительном режиме',
                                                4 => 'Выключена в принудительном режиме',
                                                5 => 'Автоматический режим',
                                                6 => 'Автоматический режим'
                                            ];
                                            
                                            return $flash_descriptions[$flash_value] ?? 'Неизвестное значение вспышки';
                                        }

                            function translate_orientation($orientation)
                            {
                                $orientation_descriptions = [
                                    1 => '0° (По умолчанию)',
                                    3 => '180°',
                                    6 => '90° по часовой стрелке',
                                    8 => '270° по часовой стрелке'
                                ];

                                return $orientation_descriptions[$orientation] ?? 'Не определена';
                            }


                            function translate_resolution_unit($unit)
                            {
                                $resolution_units = [
                                    1 => 'Дюймы',
                                    2 => 'Сантиметры'
                                ];

                                return $resolution_units[$unit] ?? 'Неизвестная единица';
                            }

                            function translate_light_source($source)
                            {
                                $light_sources = [
                                    0 => 'Неизвестный источник',
                                    1 => 'Дневной свет',
                                    2 => 'Лампа накаливания',
                                    3 => 'Лампа флуоресцентная',
                                    4 => 'Лампа с высоким давлением',
                                    5 => 'Лампа с низким давлением',
                                    255 => 'Другой источник'
                                ];

                                return $light_sources[$source] ?? 'Неизвестный источник света';
                            }

                            function translate_white_balance($balance)
                            {
                                $white_balances = [
                                    0 => 'Автоматический',
                                    1 => 'Ручной'
                                ];

                                return $white_balances[$balance] ?? 'Неизвестный баланс белого';
                            }

                            function translate_color_space($space)
                            {
                                $color_spaces = [
                                    1 => 'sRGB',
                                    2 => 'Adobe RGB',
                                    3 => 'Uncalibrated'
                                ];

                                return $color_spaces[$space] ?? 'Неизвестное цветовое пространство';
                            }

                            function translate_scene_type($type)
                            {
                                $scene_types = [
                                    0 => 'Неизвестный тип',
                                    1 => 'Сцена с обычным светом',
                                    2 => 'Сцена с высоким контрастом',
                                    3 => 'Сцена с низким контрастом',
                                    4 => 'Сцена с движением'
                                ];

                                return $scene_types[$type] ?? 'Неизвестный тип съёмки';
                            }
                            foreach ($data as $key => $value) {
                                if ($key === 'EXIF.Flash') {
                                    $value = translate_flash_value($value);
                                } elseif ($key === 'IFD0.Orientation') {
                                    $value = translate_orientation($value);
                                } elseif ($key === 'IFD0.ResolutionUnit') {
                                    $value = translate_resolution_unit($value);
                                } elseif ($key === 'EXIF.WhiteBalance') {
                                    $value = translate_white_balance($value);
                                } elseif ($key === 'IFD0.LightSource') {
                                    $value = translate_light_source((int)$value);
                                } elseif ($key === 'EXIF.ColorSpace') {
                                    $value = translate_color_space($value);
                                } elseif ($key === 'EXIF.SceneType') {
                                    $value = translate_scene_type($value);
                                }
                                if (!isset($exif_translations[$key])) {
                                    continue;
                                }
                                if (is_array($value)) {
                                    $value = implode(', ', $value);
                                }
                                $key = $exif_translations[$key] ?? $key;


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
                        <?php } ?>
                        <?php
                        if ($photo->content('lat') != null && $photo->content('lng') != null) { ?>
                            <div class="p0" id="pp-item-exif">

                                <h4 class="pp-item-header">Место на карте</h4>
                                <div class="pp-item-body">
                                    <table class="linetable" id="exif">
                                        <tr class="upl-map">
                                            <div id="map_frame" class="s11 p20" style="display:inline-block; padding:3px">
                                                <div id="map_canvas"></div>
                                            </div>
                                            <script>
                                                // Координаты выбранной точки
                                                const selectedPoint = {
                                                    lat: <?= $photo->content('lat') ?>, // Пример: Широта Москвы
                                                    lng: <?= $photo->content('lng') ?> // Пример: Долгота Москвы
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

                        <?php
                        if ($photo->i('moderated') === 1) {
                            $comments = DB::query('SELECT * FROM photos_comments WHERE photo_id=:pid', array(':pid' => $id));
                            $commcount = 0;
                            foreach ($comments as $c) {
                                if (json_decode($c['content'], true)['deleted'] != 'true') {
                                    $commcount++;
                                }
                            }
                            if ($photo->content('comments') != 'disabled') { ?>
                                <div class="p0" id="pp-item-comments">
                                    <?php
                                    if ($commcount > 0) { ?>
                                        <h4 class="pp-item-header">Комментарии<span id="commcount" style="font-weight:normal"> <span style="color:#aaa">&middot;</span> <?= $commcount ?></span></h4>
                                    <?php } ?>
                                    <div id="posts">
                                        <?php
                                        $number = 1;
                                        foreach ($comments as $c) {
                                            $comm = new Comment($c);
                                            if ($comm->content('deleted') != 'true') {
                                                if ($number % 2 == 0) {
                                                    $class = 's11';
                                                } else {
                                                    $class = 's1';
                                                }
                                                $comm->class($class);
                                                $number++;
                                                $comm->i();
                                            }
                                        }
                                        ?>
                                    </div>
                                    <div class="cmt-write s1">
                                        <h4 class="pp-item-header">Ваш комментарий</h4>
                                        <div style="padding:0 11px 11px">
                                            <form action="/comment.php" method="post" id="f1">
                                                <input type="hidden" name="sid" value="hgdl6old9r9qodmvkn1r4t7d6h">
                                                <input type="hidden" name="last_comment_rand" value="893329610">
                                                <input type="hidden" name="id" id="id" value="<?= $id ?>">
                                                <input type="hidden" name="subj" id="subj" value="p">
                                                <textarea name="wtext" id="wtext"></textarea><br>
                                                <p id="statusSend" style="display: none;">Ошибка</p>
                                                <div class="cmt-submit"><input type="submit" value="Добавить комментарий" id="sbmt">&ensp;&emsp;Ctrl + Enter
                                                </div>
                                            </form>
                                        </div>

                                    </div>
                                </div>
                            <?php } else { ?>
                                <div class="p0" id="pp-item-comments">

                                    <center>
                                        <p>Комментарии отключены пользователем или по усмотрению Администрации.</p>
                                    </center>
                                </div>


                        <?php }
                        } ?>
                </td>
            </tr>
            </tbody>
        </table>
    <?php } else { ?>
        <center>
            <h1>Изображение не найдено</h1>
            <div class="p20w" style="margin-bottom:20px; padding:10px 30px">
                <img src="/static/img/pnp.jpg" alt="Пусто" width="400" height="205" border="0">
                <p>Изображения с таким номером нет на сайте.<br />Может быть, его здесь никогда и не было.<br />Если Вы уверены, что что-то здесь всё-таки было, значит, администратор по каким-то причинам это удалил.</p>
            </div>
        </center>
    <?php } ?>
    <table width="100%" style="margin-top: 30px;">
        <tbody>
            <tr>
                <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
            </tr>
        </tbody>
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
                            $('#statusSend').css({
                                display: 'block',
                                color: 'red'
                            });
                            $('#statusSend').text('Комментарий некорректен');
                            //Notify.noty('danger', 'Комментарий неккоректен');
                            //$("#result").html("<div class='alert alert-dangernew container mt-5' role='alert'>Неправильная почта или пароль!</div>");
                        } else if (jsonData.errorcode == "2") {
                            $('#statusSend').css({
                                display: 'block',
                                color: 'yellow'
                            });
                            $('#statusSend').text('Пожалуйста, подождите...');
                            //Notify.noty('warning', 'Пожалуйста, подождите...');
                            setTimeout(function() {
                                window.location.replace(jsonData.twofaurl);
                            }, 1000);
                        } else if (jsonData.errorcode == "0") {
                            $('#wtext').val('');
                            $('#statusSend').css({
                                display: 'block',
                                color: 'green'
                            });
                            $('#statusSend').text('Комментарий отправлен!');
                            //Notify.noty('success', 'Комментарий отправлен!');
                            //$("#result").html("<div class='alert alert-successnew container mt-5' role='alert'>Успешный вход!</div>");
                            $.ajax({


                                type: "POST",
                                url: "/api/photo/getcomments/<?= $id ?>",
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

        function errimg() {
            const content = `<center>
                        <div class="p20 s5" style="border:none; margin:0 -20px; display:none;">
                            <b>Фото потеряно при крахе винчестера</b>
                            <div class="sm" style="margin-top:5px">
                                Если у вас есть это фото, пожалуйста, пришлите его на 
                                <a href="mailto:<?= NGALLERY['root']['adminemail'] ?>?subject=Для восстановления фото <?= $id ?>"><?= NGALLERY['root']['adminemail'] ?></a>
                            </div>
                        </div>
                    </center>`;
            $('#err').html(content);
            $('#err .p20').slideDown(500);
        }
    </script>
    </div>



</html>