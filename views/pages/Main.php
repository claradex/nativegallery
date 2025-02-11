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
                                        echo '<a href="/photo/' . $p['id'] . '" target="_blank" class="prw pop-prw">
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


                            <h4><a href="/photo/" target="_blank">Случайные фотографии</a></h4>
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
                                    <a href="/photo/<?= $p['id'] ?>" target="_blank" class="prw-animate" style='background-image:url("/api/photo/compress?url=<?= $p['photourl'] ?>")'></a>
                                <?php echo '
                                </div>';
                                }
                                ?>
                            </div>



                            <br>


                            <h4 style="clear:both"><a href="/update">Недавно добавленные фотографии</a></h4>
                            <?php
                            $photos = DB::query('SELECT * FROM photos WHERE moderated=1 ORDER BY id DESC LIMIT 30');

                            $first_id = $photos[0]['id'];
                            $last_id = end($photos)['id'];
                            ?>
                            <div id="recent-photos" class="ix-photos ix-photos-multiline" lastpid="<?=$first_id?>" firstpid="<?=$last_id?>">
                              
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
                                    echo '<div class="ix-news-item"><b>'.Date::zmdate($n['time']).'</b>
                                    <div class="break-links" style="padding-top:3px">'.$n['body'].'</div>
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