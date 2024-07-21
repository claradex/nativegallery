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
                            <td class="ds"><b><?=floor((time() - $photo->i('timeupload')) / 86400)?></b></td>
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
                <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
            </tr>
    </table>


</body>

</html>