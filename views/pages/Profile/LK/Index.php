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
                    Количество ваших фотографий на сайте: <b><?=DB::query('SELECT COUNT(*) FROM photos WHERE user_id=:uid', array(':uid'=>Auth::userid()))[0]['COUNT(*)']?></b></p>
                <p>
                <h4>Индекс загрузки</h4>
                <p>Текущее значение <a href="/page/111" class="und">индекса загрузки</a>: <b><?=$user->i('uploadindex')?></b></p>
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