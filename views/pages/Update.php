<?php
use App\Services\{Router, Auth, DB, Date};
?>
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
                <h1>Новые фотографии за 72 часа</h1>
                
              
                <?php
               $photos = DB::query('SELECT * FROM photos WHERE moderated=1 AND timeupload>=:time ORDER BY timeupload DESC', array(':time'=>time()-259200));
               foreach ($photos as $p) {
                $photouser = new \App\Models\User($p['user_id']);
                echo '<div class="p20p">
                    <table>
                        <tbody>
                            <tr>
                                <td class="pb_photo" id="p1936120"><a href="/photo/'.$p['id'].'" target="_blank" class="prw"><img class="f" src="'.$p['photourl'].'">
                                        <div class="hpshade">
                                        ';
                                        if (DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'] >= 1) {
                                            echo '<div class="com-icon">'.DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div>';
                                        }
                                        echo '
                                        <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div></div>
                                    </a></td>
                                <td class="pb_descr">
                                
                                    <p><b class="pw-place">'.htmlspecialchars($p['place']).'</b></p>
                                    <span class="pw-descr">'.htmlspecialchars($p['postbody']).'</span>
                                    <p class="sm"><b>'.Date::zmdate($p['timeupload']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">'.htmlspecialchars($photouser->i('username')).'</a></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>';
               }
               ?>
              
                <br>
                
             
            </td>
        </tr>
      
        <tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>

</body>

</html>