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

	<h4><a href="top30.php">Самые популярные за 24 часа</a></h4>
	<div>
		<?php
        $photos = DB::query('SELECT photo_id, COUNT(*) as view_count
FROM photos_views
WHERE time >= UNIX_TIMESTAMP(NOW()) - 86400
GROUP BY photo_id
ORDER BY view_count DESC
LIMIT 10;');
foreach ($photos as $pd) {
    $photo = DB::query('SELECT * FROM photos WHERE id=:id', array(':id'=>$pd['photo_id']));
    foreach ($photo as $p) {
         $author = new User($p['user_id']);
         echo '<a href="/photo/'.$p['id'].'" target="_blank" class="prw pop-prw">
   <img width="250" src="/api/photo/compress?url='.$p['photourl'].'">
   <div class="hpshade">
      <div class="eye-icon">+'.$pd['view_count'].'</div>
   </div>
</a>';
    }
}
        ?>
	</div>

	
	<div style="text-align:center; margin-bottom:20px">
<div style="width: 250px;"></div></div>



</td>
                        <td style="vertical-align:top; width:100%; padding-top:4px">

                          
                            <h4><a href="/photo/" target="_blank">Случайные фотографии</a></h4>
                            <div id="random-photos" class="ix-photos ix-photos-oneline">
                            <?php
                                $photos = DB::query('SELECT * FROM photos ORDER BY RAND() DESC LIMIT 7');
                                foreach ($photos as $p) {
                                    $bck = 'background-image:url("/api/photo/compress?url=' . $p['photourl'] . '")';
                                    echo ' <div class="prw-grid-item">
                                    <div class="prw-wrapper"><span style="word-spacing:-1px"><b>' . htmlspecialchars($p['place']) . '</b></span>
                                        <div>' . Date::zmdate($p['posted_at']) . '</div>
                                    </div>
                                    '; ?>
                                    <a href="/photo/<?= $p['id'] ?>" target="_blank" class="prw-animate" style='background-image:url("/api/photo/compress?url=<?= $p['photourl'] ?>")'></a>
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
                                    $bck = 'background-image:url("/api/photo/compress?url=' . $p['photourl'] . '")';
                                    echo ' <div class="prw-grid-item">
                                    <div class="prw-wrapper"><span style="word-spacing:-1px"><b>' . htmlspecialchars($p['place']) . '</b></span>
                                        <div>' . Date::zmdate($p['posted_at']) . '</div>
                                    </div>
                                    '; ?>
                                    <a href="/photo/<?= $p['id'] ?>" target="_blank" class="prw-animate" style='background-image:url("/api/photo/compress?url=<?= $p['photourl'] ?>")'></a>
                            </div>
                        <?php }
                        ?>

                        </div>





                        <h4>Сейчас на сайте (<?=DB::query('SELECT COUNT(*) FROM users WHERE online>=:time-300 ORDER BY online DESC', array(':time'=>time()))[0]['COUNT(*)']?>)</h4>
                        <div>
                        <?php
                        $online = DB::query('SELECT * FROM users WHERE online>=:time-300 ORDER BY online DESC', array(':time'=>time()));
                        foreach ($online as $o) {
                            echo '<a href="/author/'.$o['id'].'/">'.htmlspecialchars($o['username']).'</a>, ';
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