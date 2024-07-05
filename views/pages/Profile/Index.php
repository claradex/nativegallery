<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
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
                <h1><?= $userprofile->i('username') ?></h1>
                <?php
                if ($userprofile->i('id') === Auth::userid()) { ?>
                    <p><b><a href="/lk/profile">Редактировать мой профиль</a></b></p>
                <?php } ?>
                <table width="100%">
                    <tr>
                        <td valign="top" width="100%">
                            <div class="p20" style="padding-right:12px">
                                <table>
                                    <col width="170px">
                                    <?php
                                    if ($userprofile->content('location') !== null) { ?>
                                        <tr>
                                            <td class="sm" style="padding:3px 10px 3px 0">Откуда:</td>
                                            <td><?= $userprofile->content('location') ?></td>
                                        </tr>
                                    <?php } ?>
                                    <tr>
                                        <td class="sm" style="padding:3px 10px 3px 0">Дата регистрации:</td>
                                        <td><span class="sm"><?= Date::zmdate($userprofile->content('regdate')) ?></span></td>
                                    </tr>
                                    <tr>
                                        <td class="sm" style="padding:3px 10px 3px 0">Был на сайте:</td>
                                        <td><span class="sm"><?= Date::zmdate($userprofile->i('online')) ?> <?php if (time() - 300 <= $userprofile->i('online')) { ?>(<b>online</b>)<?php } ?></span></td>
                                    </tr>
                                </table>
                            </div><br />
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

                            <a href="<?= $userprofile->i('photourl') ?>" onclick="showUserPhoto(); return false;"><img src="<?= $userprofile->i('photourl') ?>" alt="" id="userphoto_img" class="f" style="width:auto; max-width:100px"></a>
                        </td>
                    </tr>
                </table>
              
            </td>
        </tr>
    </table>


</body>

</html>