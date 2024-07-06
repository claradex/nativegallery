<?php

use App\Services\{DB, Auth, Date, Json};
use App\Models\{User, Vote, Comment};
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<style>
    .ix-country {
        padding-top: 3px;
        white-space: nowrap;
        font-family: var(--narrow-font);
        font-size: 18px;
    }

    .ix-country>a>b {
        border-bottom: dotted 1px;
    }

    .ix-cities {
        padding: 5px 0 15px 15px;
    }

    .ix-arrow {
        display: inline-block;
        width: 9px;
        height: 9px;
        background: url("/img/arrow_blue.png") no-repeat;
        transition: transform .1s ease-out;
        position: relative;
        top: -1px;
    }

    .ix-arrow.ix-arrow-expanded {
        transform: rotate(90deg);
    }
</style>


<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-FSVJTB6RNR"></script>
<script>
    window.dataLayer = window.dataLayer || [];

    function gtag() {
        dataLayer.push(arguments);
    }
    gtag('js', new Date());

    gtag('config', 'G-FSVJTB6RNR');
</script>

<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m, e, t, r, i, k, a) {
        m[i] = m[i] || function() {
            (m[i].a = m[i].a || []).push(arguments)
        };
        m[i].l = 1 * new Date();
        for (var j = 0; j < document.scripts.length; j++) {
            if (document.scripts[j].src === r) {
                return;
            }
        }
        k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })
    (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(73971775, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true
    });
</script>
<noscript>
    <div><img src="https://mc.yandex.ru/watch/73971775" style="position:absolute; left:-9999px;" alt="" /></div>
</noscript>
<!-- /Yandex.Metrika counter -->
<!-- Yandex.RTB -->
<script>
    window.yaContextCb = window.yaContextCb || []
</script>
<script src="https://yandex.ru/ads/system/context.js" async></script>
</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <table id="idx-main">
                    <tr>
                        <td style="vertical-align:top; padding-right:20px">




                        </td>
                        <td style="vertical-align:top; width:100%; padding-top:4px">

                            <div id="morerand">
                                <a id="newrand" style="display:none" href="#">Показать другие</a>
                                <span id="newrand-loader" style="color:#888">Загрузка...</span>
                            </div>
                            <h4><a href="/photo/" target="_blank">Случайные фотографии</a></h4>
                            <div id="random-photos" class="ix-photos ix-photos-oneline">
                            <?php
                                $photos = DB::query('SELECT * FROM photos ORDER BY RAND() DESC LIMIT 7');
                                foreach ($photos as $p) {
                                    $bck = 'background-image:url("' . $p['photourl'] . '")';
                                    echo ' <div class="prw-grid-item">
                                    <div class="prw-wrapper"><span style="word-spacing:-1px"><b>' . $p['place'] . '</b></span>
                                        <div>' . Date::zmdate($p['posted_at']) . '</div>
                                    </div>
                                    '; ?>
                                    <a href="/photo/<?= $p['id'] ?>" target="_blank" class="prw-animate" style='background-image:url("<?= $p['photourl'] ?>")'></a>
                                    <?php echo '
                                </div>';
                                }
                                ?>
                            </div>



                            <br>


                            <h4 style="clear:both"><a href="/update.php?time=72">Недавно добавленные фотографии</a></h4>
                            <div id="recent-photos" class="ix-photos ix-photos-multiline" lastpid="1970527" firstpid="1970550">
                                <?php
                                $photos = DB::query('SELECT * FROM photos ORDER BY id DESC LIMIT 30');
                                foreach ($photos as $p) {
                                    $bck = 'background-image:url("' . $p['photourl'] . '")';
                                    echo ' <div class="prw-grid-item">
                                    <div class="prw-wrapper"><span style="word-spacing:-1px"><b>' . $p['place'] . '</b></span>
                                        <div>' . Date::zmdate($p['posted_at']) . '</div>
                                    </div>
                                    '; ?>
                                    <a href="/photo/<?= $p['id'] ?>" target="_blank" class="prw-animate" style='background-image:url("<?= $p['photourl'] ?>")'></a>
                            </div>';
                        <?php }
                        ?>

                        </div>







                        </td>
                    </tr>
                </table>
            </td>
        </tr>

    </table>


</body>

</html>