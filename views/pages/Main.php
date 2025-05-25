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

                            <h4><a href="/top30">Самые популярные за 24 часа</a></h4>
                            <div>
                                <?php
                                $photos = DB::query('SELECT photo_id, COUNT(*) as view_count
FROM photos_views
WHERE time >= UNIX_TIMESTAMP(NOW()) - 86400
GROUP BY photo_id
ORDER BY view_count DESC
LIMIT 10;');
                                foreach ($photos as $pd) {
                                    $photo = DB::query('SELECT * FROM photos WHERE id=:id', array(':id' => $pd['photo_id']));
                                    foreach ($photo as $p) {
                                        $author = new User($p['user_id']);
                                        echo '<a href="/photo/' . $p['id'] . '" class="prw pop-prw">
   <img width="250" src="/api/photo/compress?url=' . $p['photourl'] . '">
   <div class="hpshade">
      <div class="eye-icon">+' . $pd['view_count'] . '</div>
   </div>';
                                        if ((int)$p['priority'] === 1) {
                                            echo '<div class="temp" style="background-image:url(/static/img/cond.png)"></div>';
                                        }
                                        echo '
</a>';
                                    }
                                }
                                ?>
                            </div>


                            <div style="text-align:center; margin-bottom:20px">
                                <div style="width: 250px;"></div>
                            </div>



                        </td>
                        <td style="vertical-align:top; width:70%; padding-top:4px">


                            <h4><a href="/photo/">Случайные фотографии</a></h4>
                            <div id="random-photos" class="ix-photos ix-photos-oneline">
                                <?php
                                $photos = DB::query('SELECT * FROM photos WHERE moderated=1 ORDER BY RAND() DESC LIMIT 7');
                                foreach ($photos as $p) {
                                    if ($p['posted_at'] === 943909200 || Date::zmdate($p['posted_at']) === '30 ноября 1999 в 00:00') {
                                        $date = 'дата не указана';
                                    } else {
                                        $date = Date::zmdate($p['posted_at']);
                                    }
                                    $bck = 'background-image:url("/api/photo/compress?url=' . $p['photourl'] . '")';
                                    echo ' <div class="prw-grid-item">
                                    <div class="prw-wrapper"><span style="word-spacing:-1px"><b>' . htmlspecialchars($p['place']) . '</b></span>
                                        <div>' . $date . '</div>
                                    </div>
                                    '; ?>
                                    <a href="/photo/<?= $p['id'] ?>" class="prw-animate" style='background-image:url("/api/photo/compress?url=<?= $p['photourl'] ?>")'></a>
                                <?php echo '
                                </div>';
                                }
                                ?>
                            </div>
                            <style>
                                #contestNotify {
                                    background-size: 550px 211.2px;
                                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 550 211.2" width="550" height="211.2" style="opacity: 0.3; filter: grayscale(0);"><text x="0em" y="1em" font-size="88" transform="rotate(17 55 52.8)">🎁</text><text x="1.25em" y="2em" font-size="88" transform="rotate(17 165 140.8)">🎈</text><text x="2.5em" y="1em" font-size="88" transform="rotate(17 275 52.8)">🎀</text><text x="3.75em" y="2em" font-size="88" transform="rotate(17 385 140.8)">🎊</text><text x="5em" y="1em" font-size="88" transform="rotate(17 495 52.8)">🎉</text></svg>');
                                }
                            </style>
                            
                            <?php
                            if (DB::query('SELECT status FROM contests WHERE status=2')[0]['status'] === 2) {
                                $contest = DB::query('SELECT * FROM contests WHERE status=2')[0];
                                $theme = DB::query('SELECT * FROM contests_themes WHERE id=:id', array(':id' => $contest['themeid']))[0];
                                echo ' <div id="contestNotify" style="float:left; border:solid 1px #171022; padding:6px 10px 7px; margin-bottom:13px; background-color:#E5D6FF"><h4>Фотоконкурс!</h4>
                                <span id="timett">Закончится через:</span> <b id="countdown"></b><br>
                                Тематика: <b>' . $theme['title'] . '</b><br>
                                <b style="color: #412378;">Голосуйте за лучшие фотографии, которые должны стать победителями сегодняшнего конкурса!</b><br><br>
                                <div id="contestBtns"><a href="/voting" style="background-color: #37009D; color: #fff;" type="button">Голосовать!</a></div>
                                <script>startCountdown(' . $contest['closedate'] . ');</script>';
                            } else if (DB::query('SELECT status FROM contests WHERE status=1')[0]['status'] === 1) {
                                $contest = DB::query('SELECT * FROM contests WHERE status=1')[0];
                                $theme = DB::query('SELECT * FROM contests_themes WHERE id=:id', array(':id' => $contest['themeid']))[0];
                                echo ' <div id="contestNotify" style="float:left; border:solid 1px #171022; padding:6px 10px 7px; margin-bottom:13px; background-color:#E5D6FF"><h4>Фотоконкурс!</h4>
                                <span id="timett">Начнётся через:</span> <b id="countdown"></b><br>
                                Тематика: <b>' . $theme['title'] . '</b><br>
                                <b id="textContest" style="color: #412378;">Лучшие фотографии по мнению сообщества ' . NGALLERY['root']['title'] . ' будут отмечены</b><br><br>
                                <div id="contestBtns"><a href="/voting/sendpretend" style="background-color: #37009D; color: #fff;" type="button">Участвовать!</a> <a href="/voting/waiting" style="background-color: #37009D; color: #fff;" type="button">Голосовать за претендентов</a></div>
                                <script>
                                 $(document).ready(function () {
                                    let unixThreshold = '.$contest['closepretendsdate'].'; // Задайте нужное значение UNIX
                                    let checkInterval = 1000; // Интервал проверки в миллисекундах (1 секунда)
                                    let isRequestSent = false;

                                    function checkUnixTime() {
                                        let currentUnixTime = Math.floor(Date.now() / 1000);
                                        
                                        if (currentUnixTime > unixThreshold) {
                                            $("#countdown").text("Ожидаем ответ от сервера...");

                                            $.ajax({
                                                url: "/api/contests/getinfo", // Укажите свой URL
                                                method: "GET",
                                                success: function (response) {

                                                    let data = typeof response === "string" ? JSON.parse(response) : response;
                                                      if (data.statuses.pretends === "closed" && data.statuses.public === "opened") {
                                                        clearInterval(pingInterval); // Останавливаем старый пинг
                                                        $("#textContest").text("Голосуйте за лучшие фотографии, которые должны стать победителями сегодняшнего конкурса!");
                                                        $("#timett").text("Закончится через:");
                                                        $("#contestBtns").html(`<a href="/voting" style="background-color: #37009D; color: #fff;" type="button">Голосовать!</a>`)
                                                        unixThreshold = data.contest.closedate;
                                                        startCountdown(data.contest.closedate);
                                                        pingInterval = setInterval(checkUnixTime, checkInterval);
                                                    }
                                                },
                                                error: function (xhr, status, error) {
                                                    console.error("Ошибка запроса:", error);
                                                }
                                            });
                                        } else {
                                            console.log(currentUnixTime);
                                        }
                                    }

                                    // Запускаем периодический пинг
                                    let pingInterval = setInterval(checkUnixTime, checkInterval);
                                });


                                </script>';
                            }


                            ?>




                            </div>

                            </div>



                            <br>


                            <h4 style="clear:both"><a href="/update">Недавно добавленные фотографии</a></h4>
                            <?php
                            $photos = DB::query('SELECT * FROM photos WHERE moderated=1 ORDER BY id DESC LIMIT 30');

                            $first_id = $photos[0]['id'];
                            $last_id = end($photos)['id'];
                            ?>
                            <div id="recent-photos" class="ix-photos ix-photos-multiline" lastpid="<?= $first_id + 1 ?>" firstpid="<?= $last_id ?>">

                            </div>
                            </div>
                            <div style="text-align:center; margin:10px 0"><input type="button" name="button" id="loadmore" class="" value="Загрузить ещё"></div>





                            <h4>Сейчас на сайте (<?= DB::query('SELECT COUNT(*) FROM users WHERE online>=:time-300 ORDER BY online DESC', array(':time' => time()))[0]['COUNT(*)'] ?>)</h4>
                            <div>
                                <?php
                                $online = DB::query('SELECT * FROM users WHERE online>=:time-300 ORDER BY online DESC', array(':time' => time()));
                                foreach ($online as $o) {
                                    echo '<a href="/author/' . $o['id'] . '/">' . htmlspecialchars($o['username']) . '</a>, ';
                                }
                                ?>

                            </div>
                        </td>
                        <td style="padding-left:20px; width:254px; vertical-align:top">

                            <h4>Новости сайта</h4>
                            <div class="sm" style="margin-bottom:15px; line-height:13px; white-space:normal">
                                <?php
                                $news = DB::query('SELECT * FROM news ORDER BY id DESC LIMIT 10');
                                foreach ($news as $n) {
                                    echo '<div class="ix-news-item"><b>' . Date::zmdate($n['time']) . '</b>
                                    <div class="break-links" style="padding-top:3px">' . $n['body'] . '</div>
                                </div>';
                                }
                                ?>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>


</body>

</html>