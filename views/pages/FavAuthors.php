<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, Photo};

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
                <h1>Фотографии избранных авторов</h1>
                <?php
                $followimgs = DB::query('SELECT * FROM followers_notifications WHERE follower_id=:id AND checked=0', array(':id'=>Auth::userid()));
                if (count($followimgs) > 0) {
                    echo '<div class="mark-btn"><a class="button" href="#" onclick="return markAllRead(1)">Отметить все фотографии просмотренными</a></div>';
                } else {
                    echo '<div class="p20" style="margin-bottom:15px" id="no_photos"><h4>Новых фотографий пока нет.</h4></div>';
                }
                foreach ($followimgs as $f) {
                    $author = new User($f['user_id']);
                    $p = new Photo($f['photo_id']);
                    echo ' <div class="p20p">
                    <table>
                        <tr>
                            
                            <td class="pb_photo" id="p1941865"><a href="/photo/'.$f['photo_id'].'/" target="_blank" class="prw"><img class="f" src="'.$p->i('photourl').'" alt="620 КБ">
                                    <div class="hpshade">
                                        <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$f['photo_id']))[0]['COUNT(*)'].'</div>
                                    </div>
                                </a></td>
                             <td class="pb_descr">
                                
                                    <p><b class="pw-place">'.htmlspecialchars($p->i('place')).'</b></p>
                                    <span class="pw-descr">'.htmlspecialchars($p->i('postbody')).'</span>
                                    <p class="sm"><b>'.Date::zmdate($p->i('timeupload')).'</b><br>Автор: <a href="/author/'.$author->i('user_id').'/">'.htmlspecialchars($author->i('username')).'</a></p>
                                </td>
                        </tr>
                    </table>
                </div>';
                }
                ?>
               
              
              
               
            </td>
        </tr>
        <script>
var ltime = 1721508467;
function markAllRead(force)
{
	if (confirm('Действительно отметить эти фотографии просмотренными?'))
	{
		var ts = ltime+1;
		window.location.href = '/api/photo/checkall';
	}

	return false;
}

</script>
        <tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>

</body>

</html>