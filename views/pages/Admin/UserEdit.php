<?php
use \App\Services\Date;
$user = new \App\Models\User($_GET['user_id']);

if ($user->i('id') === null) {
    die('Пользователь не найден');
}

?>
<form method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block; min-width:500px;">

    <p><img src="<?=$user->i('photourl')?>" width="50">   <?=$user->i('username')?></p>
    <p>Был в сети: <b><?= Date::zmdate($user->i('online')) ?> <?php if (time() - 300 <= $user->i('online')) { ?><i>(online)</i><?php } ?></b></p>
    <p>Ссылка на профиль: <b><a href="/author/<?=$_GET['user_id']?>">https://<?= $_SERVER['SERVER_NAME'] ?>/author/<?= $_GET['user_id'] ?></a></b></p>
    <div class="p20" style="text-align:left; margin-bottom:15px">

        <h4>Настройки</h4>



        <div style="margin-bottom:3px; margin-top:5px">Прямая загрузка</div>
        <select name="aboutrid" style="width:100%">
            <option value="0">Да</option>
            <option value="24">Нет</option>
        </select>
        <div style="margin-bottom:3px; margin-top:5px">Статус аккаунта</div>
        <select name="aboutrid" style="width:100%">
            <option value="0">Без ограничений</option>
            <option value="24">Заблокирован</option>
        </select>
        <div style="margin-bottom:3px; margin-top:5px">Фотомодератор</div>
        <select name="aboutrid" style="width:100%">
            <option value="0">Да</option>
            <option value="24">Нет</option>
        </select>
       
    </div>
    <div class="p20" style="text-align:left; margin-bottom:15px">

<h4>Операции</h4>


<div class="cmt-submit"><a href="/admin?type=UserEdit&user_id='.$u['id'].'">Сбросить аватар</a></div>

</div>

<div class="cmt-submit"><input type="submit" value="Применить"></div>

</form>