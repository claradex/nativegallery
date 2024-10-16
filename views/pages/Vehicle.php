<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{Vehicle, User};

$id = explode('/', $_SERVER['REQUEST_URI'])[2];
$data = DB::query('SELECT * FROM entities_data WHERE id=:id', array(':id' => $id))[0];
$vehicle = new Vehicle($data['entityid']);

$vehicledatavariables = json_decode($data['content'], true);


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
                <h1><?= $data['title'] ?></h1>

                <table class="horlines">
                    <col width="150">
                    <col>
                    <?php
                    $vehiclevariables = json_decode($vehicle->i('sampledata'), true);
                    $num = 1;
                    foreach ($vehiclevariables as $vb) {
                        echo '<tr class="h21"><td class="ds nw">' . $vb['name'] . ':</td><td class="d"><b>' . $vehicledatavariables[$num]['value'] . '</b></td></tr>';
                        $num++;
                    }
                    ?>


                </table><br>
                <?php
                $photos = DB::query('SELECT * FROM photos WHERE entitydata_id=:id', array(':id'=>$id));
                foreach ($photos as $p) {
                    $author = new User($p['user_id']);
                    echo '<div class="p20p s11"><table><tbody><tr>
<td class="pb_photo" id="p1987895"><a href="/photo/1987895/ target="_blank" class="prw"><img class="f" src="/api/photo/compress?url='.$p['photourl'].'" alt="678 КБ">
<div class="hpshade">';
 if (DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'] >= 1) {
                                            echo '<div class="com-icon">'.DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div>';
                                        }
                                        echo '
                                        <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div></div>

</div></a></td>
<td class="pb_descr">
 <p><b class="pw-place">'.htmlspecialchars($p['place']).'</b></p>
                                    <span class="pw-descr">'.htmlspecialchars($p['postbody']).'</span>
                                    <p class="sm"><b>'.Date::zmdate($p['timeupload']).'</b><br>Автор: <a href="/author/'.$author->i('user_id').'/">'.htmlspecialchars($author->i('username')).'</a></p>
</td>
</tr></tbody></table></div>';
                }
                ?>



        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>