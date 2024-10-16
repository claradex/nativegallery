<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>

    <body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <center>
                    <h1>30 самых просматриваемых фото за 24 часа</h1>
                    <div style="width:80%">
                    <?php
        $photos = DB::query('SELECT photo_id, COUNT(*) as view_count
FROM photos_views
WHERE time >= UNIX_TIMESTAMP(NOW()) - 86400
GROUP BY photo_id
ORDER BY view_count DESC
LIMIT 30;');
$top = 0;
foreach ($photos as $pd) {
    
    $photo = DB::query('SELECT * FROM photos WHERE id=:id', array(':id'=>$pd['photo_id']));
    foreach ($photo as $p) {
        $top++;
         $author = new User($p['user_id']);
         echo ' <div class="p20p">
                            <table>
                                <tr>
                                    <td style="text-align:center; padding:10px"><b style="font-size:25px">'.$top.'</b><br><br><small>Новых просмотров:</small><br><b>+'.$pd['view_count'].'</b><br><br>
                                        
                                    </td>
                                    <td class="pb_photo" id="p1977446"><a href="/photo/'.$p['id'].'/" target="_blank" class="prw"><img class="f" src="'.$p['photourl'].'" alt="347 КБ">
                                            
                                        </a></td>
                                    <td class="pb_descr">
                                
                                    <p><b class="pw-place">'.htmlspecialchars($p['place']).'</b></p>
                                    <span class="pw-descr">'.htmlspecialchars($p['postbody']).'</span>
                                    <p class="sm"><b>'.Date::zmdate($p['timeupload']).'</b><br>Автор: <a href="/author/'.$author->i('user_id').'/">'.htmlspecialchars($author->i('username')).'</a></p>
                                </td>
                                </tr>
                            </table>
                        </div>';
         
}
}
        ?>
                       
                      
                    </div>
                </center>
            </td>
        </tr>
       
        <tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>

</body>

</html>