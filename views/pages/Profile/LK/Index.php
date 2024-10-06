<?php
use \App\Services\{Auth, DB};
use \App\Models\User;
$user = new User(Auth::userid());
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
                <h1>Общая информация</h1>
                <h4>Здравствуйте, <a href="/author/<?=Auth::userid()?>/"><?=htmlspecialchars($user->i('username'))?></a>!</h4>
                <p>
                    Количество ваших фотографий на сайте: <b><?=DB::query('SELECT COUNT(*) FROM photos WHERE user_id=:uid AND moderated=1', array(':uid'=>Auth::userid()))[0]['COUNT(*)']?></b></p>
                <p>
                <?php

                if (NGALLERY['root']['photo']['uploadindex']['enabled'] === true) { 
                    $strokewidth = 4 * $user->i('uploadindex');
                    ?>
                <h4>Индекс загрузки</h4>
<p>Текущее значение <a href="/page/111" class="und">индекса загрузки</a>: <b><?=$user->i('uploadindex')?></b></p>
<div class="p20" style="float:left; padding:15px 15px 20px; width:240px">
<div style="background-color:#fff; width:240px; height:16px"></div>
<div style="background-color:#599fe7; width:<?=$strokewidth?>px; height:14px; position:relative; top:-15px; margin-bottom:-19px"></div>
<img src="/static/img/scale1.png" style="position:relative; top:-12px; margin-left:-5px; margin-bottom:-22px">
</div><br clear="all" />
<p><a href="/lk/pday" class="und">История изменения индекса загрузки</a></p>

                <?php } ?>
              <br clear="all" />
            

                <br />


                <br />&nbsp;

            </td>
        </tr>
        <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
            </tr>
      
    </table>

</body>

</html>