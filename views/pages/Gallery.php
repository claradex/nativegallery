<?php

use App\Services\{DB, Auth, Date, Json};
use App\Models\{User, Vote, Comment, Photo};
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
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php');
        $gallery = DB::query('SELECT * FROM galleries WHERE id=:id', array(':id'=>explode('/', $_SERVER['REQUEST_URI'])[2]));
        ?>
        <tr>
            <td class="main">
                <h1><?=$gallery['title']?></h1>
               
             
               <?php
               $photos = DB::query('SELECT * FROM photos WHERE gallery_id=:id ORDER BY id DESC LIMIT 100', array(':id'=>$gallery['id']));
               foreach ($photos as $p) {
                $photo = new Photo($p['photo_id']);
                $user = new User($p['user_id']);
                echo ' <div class="p20p" style="padding:0 5px">
                    <table>
                        <tr>
                            
                            <td class="pb_photo" id="p2017137"><a href="/photo/'.$photo->i('id').'" target="_blank" class="prw"><img class="f" src="/api/photo/compress?url=' . $photo->i('photourl') . '" alt="598 КБ">
                                    <div class="hpshade">
                                        <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$photo->i('id')))[0]['COUNT(*)'].'</div>
                                    </div>
                                </a></td>
                            <td class="pb_descr">
                                <p>'.htmlspecialchars($photo->i('postbody')).'</p>
                                <p><b class="pw-place">'.htmlspecialchars($photo->i('place')).'</b></p>
                                <p class="sm"><b>'.Date::zmdate($photo->i('posted_at')).'</b><br>Автор: <a href="/author/'.$photo->i('user_id').'/">'.$user->i('username').'</a></p>
                            </td>
                        </tr>
                    </table>
                </div><br>';
               }
               ?>

             
               
                <div id="scroll_anchor"></div>
            </td>
        </tr>
        <tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>

</body>

</html>