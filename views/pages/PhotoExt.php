<?php
use \App\Services\DB;
$photo = new \App\Models\Photo($_GET['id']);
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
                    <h1>Информация об изображении</h1>
                    <div style="display:inline-block"><a href="/photo/<?=$_GET['id']?>/"><img src="/api/photo/compress?url=<?= $photo->i('photourl') ?>" width="250" alt="347 КБ" class="f"></a></div>
                    <br /><br />

                    <table class="p20">
                        <tr class="s1 h21">
                            <td class="ds">Идентификатор изображения:</td>
                            <td class="ds"><b><?=$photo->i('id')?></b></td>
                        </tr>
                       
                        <tr class="s1 h21">
                            <td class="ds">Автор:</td>
                            <td class="ds"><b><?=(new \App\Models\User($photo->i('user_id')))->i('username')?></b></td>
                        </tr>
                        <tr class="s11 h21">
                            <td class="ds">Опубликовано:</td>
                            <td class="ds"><b><?=gmdate("d.m.Y H:i:s", $photo->i('timeupload'));?></b></td>
                        </tr>
                        <tr class="s1 h21">
                            <td class="ds">Находится на сайте, дней:</td>
                            <td class="ds"><b><?=floor((time() - $photo->i('timeupload')) / 8600)?></b></td>
                        </tr>
                        <tr class="s11 h21">
                            <td class="ds">Уникальных просмотров:</td>
                            <td class="ds"><b><?=DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$_GET['id']))[0]['COUNT(*)']?></b></td>
                        </tr>
                        <tr class="s1 h21">
                            <td class="ds">Комментариев:</td>
                            <td class="ds"><b><?=DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$_GET['id']))[0]['COUNT(*)']?></b></td>
                        </tr>
                    </table><br />



                    <h4>Динамика просмотров по датам</h4>

                    <div class="p20w" style="padding:5px">
                        <img width="500" src="/api/photo/stats?id=<?=$_GET['id']?>">
                    </div><br />

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
            <td class="footer"><b><a href="/">Главная</a> &nbsp; &nbsp; <a href="/lk/">Личный кабинет</a> &nbsp; &nbsp; <a href="https://forum.transphoto.org">Форум</a> &nbsp; &nbsp; <a href="/rules/">Правила</a> &nbsp; &nbsp; <a href="/admin/">Редколлегия</a></b><br>
                <a href="/set.php?dark=0" style="display:inline-block; padding:1px 10px; margin-top:5px; background-color:#ddd; color:#333">Светлая тема</a>
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
                    d.innerHTML = "window.__CF$cv$params={r:'8a660706db3f005f',t:'MTcyMTUxMDc2NC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
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