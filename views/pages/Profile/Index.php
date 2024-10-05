<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, UserCTTC};



$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
$usercttc = False;
$city = htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutlive']['value']);
$photourl = $userprofile->i('photourl');
$regdate = Date::zmdate($userprofile->content('regdate'));
$about = json_decode($userprofile->i('content'), true)['aboutmemo']['value'];
$birthdate = json_decode($userprofile->i('content'), true)['aboutbirthday']['value'];

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
                
                <?php

                if (((int)$userprofile->i('id') === (int)explode('/', $_SERVER['REQUEST_URI'])[2]) || $usercttc === True) { ?>
                <h1><?= htmlspecialchars($userprofile->i('username')) ?><?php if ($userprofile->i('admin') === 1) { echo '<img width="32" src="/static/img/star.png">'; } ?></h1>
                
                <?php
                if ($usercttc === True) {
                    echo '<div style="float:left; border:solid 1px #3b7dc1; padding:6px 10px 7px; margin-bottom:13px; background-color:#0199ff44"><b>Профиль на transphoto.org</b><br>Пользователь не зарегистрирован на сервере '.NGALLERY['root']['title'].'. Информация может быть неполной.<br><a href="https://transphoto.org/author/'.(int)explode('/', explode('@', $_SERVER['REQUEST_URI'])[0])[2].'" target="_blank">Открыть на transphoto.org</a></div>';
                }
                if ($userprofile->i('admin') === 1) {
                    echo 'Администратор сервера';
                } else if ($userprofile->i('admin') === 2) {
                    echo 'Фотомодератор';
                }
               
                if ($userprofile->i('id') === Auth::userid()) { ?>
                    <p><b><a href="/lk/profile">Редактировать мой профиль</a></b></p>
                <?php } ?>
                <div class="p20" style="padding-right:12px; background-color: white !important;">
                <table width="100%">
                    <tr>
                    <?php if ($userprofile->content('badge') !== null) { ?>
                    <div style="float:left; border:solid 1px #3b7dc1; padding:6px 10px 7px; margin-bottom:13px; background-color:#0199ff44"><b><?=nl2br($userprofile->content('badge'))?></div><br>
                    <?php } ?>
                        <td style="vertical-align:top; width:100%" valign="top" width="100%">
                                <table style="margin-bottom: 15px;">
                                <colgroup><col width="170px">
                                </colgroup>
                                    <col width="170px">
                        
                                    <?php
                                    if ($city != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Откуда:</td>
                                            <td><?= $city ?></td>
                                        </tr>
                                    <?php } ?>
                                    
                                    <?php
                                    if ($birthdate != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">День рождения:</td>
                                            <td><?= $birthdate ?></td>
                                        </tr>
                                    <?php } ?>
                                    </col></table>
                                    <table style="margin-bottom: 15px;">
                                    <colgroup><col width="170px">
                                    </colgroup>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutlangs']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Владение языками:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutlangs']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['abouttelegram']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Telegram:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['abouttelegram']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutvk']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">ВКонтакте:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutvk']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['abouttwitter']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Twitter/X:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['abouttwitter']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutyoutube']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">YouTube:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutyoutube']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutemail']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Почта:</td>
                                            <td><a href="emailto:<?=htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutemail']['value'])?>"><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutemail']['value']) ?></a></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutinstagram']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Instagram:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutinstagram']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['abouttransphoto']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">TransPhoto:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['abouttransphoto']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutwebsite']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Личный сайт:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutwebsite']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    </table>
                                    <table style="margin-bottom: 15px;">
                                    <colgroup><col width="170px">
                                    </colgroup>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutfavs_trains']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Любимые модели поездов:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutfavs_trains']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutfavs_countries']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Любимые страны:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutfavs_countries']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    <?php
                                    if (json_decode($userprofile->i('content'), true)['aboutfavs_cities']['value'] != null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Любимые города:</td>
                                            <td><?= htmlspecialchars(json_decode($userprofile->i('content'), true)['aboutfavs_cities']['value']) ?></td>
                                        </tr>
                                    <?php } ?>
                                    </table>
                                    <table>
                                    <colgroup><col width="170px">
                                    </colgroup>
                                    <tr>
                                        <td class="sm" style="padding:3px 10px 3px 0">Дата регистрации:</td>
                                        <td><span class="sm"><?=$regdate?></span></td>
                                    </tr>
                                    <tr>
                                        <td class="sm" style="padding:3px 10px 3px 0">Был на сайте:</td>
                                        <td><span class="sm"><?= Date::zmdate($userprofile->i('online')) ?> <?php if (time() - 300 <= $userprofile->i('online')) { ?>(<b>online</b>)<?php } ?></span></td>
                                    </tr>
                                </table>
                           <br />
                            <div class="sm" style="float:right"><a href="/lk/ticket.php?action=add&amp;aid=140"></a></div>
                        </td>
                        
                        <td valign="top" align="right">
                            <script>
                                function getBodyScrollTop() {
                                    return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
                                }

                                function showUserPhoto() {
                                    _getID('userphoto_big_img').src = '<?= $userprofile->i('photourl') ?>';
                                    _getID('userphoto_big_div').style.top = '' + (getBodyScrollTop() + 10) + 'px';
                                    _getID('userphoto_big_div').style.display = 'block';
                                }

                                function hideUserPhoto() {
                                    _getID('userphoto_big_div').style.display = 'none';
                                }

                                document.onclick = function(e) {
                                    e = e || window.event;
                                    E = e.target || e.srcElement;
                                    if (E.id != 'userphoto_big_div' && E.id != 'userphoto_img') {
                                        _getID('userphoto_big_div').style.display = 'none';
                                    }
                                }
                            </script>

                            <div id="userphoto_big_div" style="position:absolute; display:none; border:1px solid gray; padding:10px; background-color:white; margin:auto; text-align:center; right:100px; z-index:3000" class="p5 shadow"><a href="#" onclick="hideUserPhoto(); return false"><img src="" id="userphoto_big_img" border="0" style="vertical-align:middle"></a>
                                <div style="margin-top:8px"><a class="dot" href="#" onclick="hideUserPhoto(); return false">закрыть</a></div>
                            </div>

                            <a href="<?=$photourl?>" onclick="showUserPhoto(); return false;"><img onerror="this.src = '/static/img/avatar.png'; this.onerror = null;" src="<?= $photourl ?>" alt="" id="userphoto_img" class="f" style="width:auto; max-width:100px"></a>
                        </td>
                    </tr>
                </table>
                            </div>
                <?php

                    if (($about != null) && $usercttc === False) { ?>
                    <div class="p20" style="margin-top: 8px; background-color: white !important;">
                    <h4>О себе</h4>
                    <?=
                   $about
                    ?>
                    </div>
                <?php } else if ($usercttc === True) { 
                    echo $about;
                    } ?>


                <div style="margin-top: 25px;"><b><a href="/search?id=<?=$userprofile->i('id')?>">Найти все фотографии, сделанные этим пользователем</a></b></div>
                
                <?php
                if ($userprofile->i('id') != Auth::userid()) { ?>
                <script>


$(document).ready(function()
{
	$('.toggle, .toggle-label').on('click', function()
	{
		var toggle = $('.toggle').toggleClass('on');

		var subscr_cnt = $('#subscr_cnt');
		var cnt = parseInt(subscr_cnt.text());
		subscr_cnt.html(toggle.is('.on') ? cnt+1 : cnt-1);

		$.get('/api/subscribe', { action: 'subscribe', id: <?=$userprofile->i('id')?>, subj: 'a' }, function (r)
		{
			if (r != 0 && r != 1)
			{
				toggle.toggleClass('on');
				alert(r);
			}
			else toggle.attr('class', (r == 1) ? 'toggle on' : 'toggle');
		});
	});
});


</script>
<?php
if (DB::query('SELECT follower_id FROM followers WHERE user_id=:userid AND follower_id=:followerid', array(':userid' => $userprofile->i('id'), ':followerid' => Auth::userid()))) {
$class = 'on';
                }
                ?>
                <div style="margin-top: 8px;"><div class="toggle <?=$class?>"><div class="handle"></div></div> &nbsp;<label class="toggle-label"><b>Подписка на новые фотографии этого автора</b> (подписаны: <b id="subscr_cnt"><?=DB::query('SELECT COUNT(*) FROM followers WHERE user_id=:uid', array(':uid'=>$userprofile->i('id')))[0]['COUNT(*)'];?></b>)</label></div>

                <?php } else { ?>
                    <div style="margin-top: 8px;">Пользователей, подписанных на мои фотографии: <b><?=DB::query('SELECT COUNT(*) FROM followers WHERE user_id=:uid', array(':uid'=>$userprofile->i('id')))[0]['COUNT(*)'];?></b></div>
                <?php } ?>
                <?php } else { ?>
                    <center><h1>Пользователь не найден</h1></center>
                    <center><img src="/static/img/404.jpg"></center>
                <?php } ?>
            </td>
        </tr>
        <tr>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
    </tr>
    </table>


</body>

</html>