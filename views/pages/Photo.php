<?php

use App\Services\{DB, Auth, Date, Json};

$photo = new \App\Models\Photo(explode('/', $_SERVER['REQUEST_URI'])[2]);
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
                            Опубликовано <b>13.07.2020 17:47 MSK</b><br>
                            Просмотров — <b>1693</b><br><br>
                            <a href="/photoext.php?pid=1361063">Подробная информация</a>
                        </div>
                    </div>


                    <div class="p20a" id="pp-item-vote">
                        <h4 class="pp-item-header">Оценка</h4>
                        <div class="sm">
                            <img class="loader" pid="1361063" src="/img/loader.png">
                            <div class="rtext">Рейтинг: <b id="rating">+48</b></div>
                            <div class="star" pid="1361063"></div>
                            <div id="votes" class="votes">
                                <table class="vblock pro">
                                    <tr>
                                        <td><a href="/author/22530/">Alexey Becker</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/9169/">tatra t4su</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/32862/">kostyan_piterski</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/15634/">Victor Irkut</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/11756/">Яков Фёдоров</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/3907/">Сергей Валерьевич</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/23757/">Empty Underground</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/34845/">KILATIV</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/6206/">Никита Лапин</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/26544/">Aleksandr_Urickiy</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/27099/">Silbervogel</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/21326/">VOLGA</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/25878/">Андрей Ширинкин</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/6185/">TOXA</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/8718/">Diman</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/26699/">Qwerty_qwertovich</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/25475/">Алексей ЛВ</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/33168/">Владислав Масев</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/19680/">Сергей Александров</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/31083/">Yastrebov Nikolay</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/33941/">Trains63</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/36219/">Темерник</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/862/">AVB</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/1028/">IvanPG</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/14003/">Михаил_123</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/259/">АК (Александр)</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/1464/">Mitay</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/533/">Андрей Янковский</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/369/">Юрий А.</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/4572/">Alexandr Matr</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/7686/">Томич</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/1560/">Александр Рябов</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/5075/">Etix1979</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/17149/">Timofeiikarus</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/11563/">Lasselan</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/5899/">Э.В.Ротгрифф</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/15817/">Егор Шмаков (Василий Фрескин)</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/11424/">Натаныч</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/986/">Александров Николай</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/359/">Виктор Бергман</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/12232/">Александр Vl</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/1572/">Palmer</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/20725/">Sergei 34</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/21132/">New_Wave</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/5929/">Barbar1s</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/515/">Andrew Gri-Shen</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/1676/">Сэм</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                    <tr>
                                        <td><a href="/author/8764/">nss991</a></td>
                                        <td class="vv">+1</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>


                    <div class="p20a" id="pp-item-link">
                        <h4 style="margin-bottom:7px">Постоянная ссылка на фото</h4>
                        <input type="text" value="https://transphoto.org/photo/1361063/" readonly="readonly" class="pp-link" onclick="this.select()">
                        <script src="//yandex.st/share/share.js" charset="utf-8" async defer></script>
                        <div class="yashare-auto-init" data-yashareL10n="ru" data-yashareType="none" data-yashareQuickServices="yaru,vkontakte,facebook,twitter,odnoklassniki,moimir,lj"></div>
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
                            <div class="s11 comment" wid="2681468">
                                <div style="float:right; text-align:right" class="sm">
                                    <span class="message_date">12.08.2020</span> 16:57 MSK<br>
                                    <a href="#2681468" class="cmLink dot">Ссылка</a>
                                </div>
                                <a name="2681468"></a><a name="last"></a>
                                <div><b><a href="/author/533/" class="message_author">Андрей Янковский</a></b> &middot; <span class="flag"><img src="/img/r/3.gif" title="Украина"> Днепр</span></div>
                                <div class="rank">Фото: 1585</div>
                                <div class="message-text">Есть аналогичное фото в цвете:<br><a href="https://smart-lab.ru/uploads/images/00/00/16/2011/10/16/433a3c.jpg" target="_blank">https://smart-lab.ru/uploads/images/00/0...a3c.jpg</a></div>
                                <div class="comment-votes-block">
                                    <div class="wvote" wid="2681468">
                                        <div class="w-rating pro">+1</div>
                                        <div class="w-rating-ext">
                                            <div><span class="pro">+1</span> / <span class="con">–0</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="cmt-write s1">
                                <h4 class="pp-item-header">Ваш комментарий</h4>
                                <div style="padding:0 11px 11px">
                                    <div class="no-politics">За обсуждение политики будет выноситься бан на 1 месяц и более.</div>
                                    Вы не <a href="/login.php">вошли на сайт</a>.<br />Комментарии могут оставлять только зарегистрированные пользователи.
                                </div>
                            </div>
                        </div>
                </td>
            </tr>
        </table>
    </div>
    <table width="100%">
        <tr>
            <td>
                </center>
            </td>
        </tr>
        <tr>
            <td id="adframe">
                <!-- Yandex.RTB R-A-115118-1 -->
                <div id="yandex_rtb_R-A-115118-1"></div>
                <script>
                    window.yaContextCb.push(() => {
                        Ya.Context.AdvManager.render({
                            renderTo: 'yandex_rtb_R-A-115118-1',
                            blockId: 'R-A-115118-1'
                        })
                    })
                </script>
            </td>
        </tr>
        <tr>
            <td class="footer"><b><a href="/">Главная</a> &nbsp; &nbsp; <a href="https://forum.transphoto.org">Форум</a> &nbsp; &nbsp; <a href="/rules/">Правила</a> &nbsp; &nbsp; <a href="/admin/">Редколлегия</a></b><br>
                <a href="/set.php?pcver=0">Мобильная версия</a><br><a href="/set.php?dark=1" style="display:inline-block; padding:1px 10px; margin-top:5px; background-color:#333; color:#fff">Тёмная тема</a>
                <div class="sitecopy">&copy; Администрация ТрансФото и авторы материалов, 2002—2024<br>Использование фотографий и иных материалов, опубликованных на сайте, допускается только с разрешения их авторов.</div>
                <div style="margin:15px 0">
                    <noindex>

                        <!-- Yandex.Metrika informer -->
                        <a href="https://metrika.yandex.ru/stat/?id=73971775&amp;from=informer" target="_blank" rel="nofollow"><img src="https://informer.yandex.ru/informer/73971775/3_0_DDDDDDFF_DDDDDDFF_0_pageviews" style="width:88px; height:31px; border:0;" alt="Яндекс.Метрика" title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)" class="ym-advanced-informer" data-cid="73971775" data-lang="ru" /></a>
                        <!-- /Yandex.Metrika informer -->

                    </noindex>
                </div>

            </td>
        </tr>
    </table>

    <script>
        (function() {
            function c() {
                var b = a.contentDocument || a.contentWindow.document;
                if (b) {
                    var d = b.createElement('script');
                    d.innerHTML = "window.__CF$cv$params={r:'89de09cd798e66c9',t:'MTcyMDA4NDgxNS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
                    b.getElementsByTagName('head')[0].appendChild(d)
                }
            }
            if (document.body) {
                var a = document.createElement('iframe');
                a.height = 1;
                a.width = 1;
                a.style.position = 'absolute';
                a.style.top = 0;
                a.style.left = 0;
                a.style.border = 'none';
                a.style.visibility = 'hidden';
                document.body.appendChild(a);
                if ('loading' !== document.readyState) c();
                else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c);
                else {
                    var e = document.onreadystatechange || function() {};
                    document.onreadystatechange = function(b) {
                        e(b);
                        'loading' !== document.readyState && (document.onreadystatechange = e, c())
                    }
                }
            }
        })();
    </script>
</body>

</html>