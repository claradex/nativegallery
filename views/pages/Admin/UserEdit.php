<?php
use \App\Services\{Date, DB, Auth};
$user = new \App\Models\User($_GET['user_id']);

if ($user->i('id') === null) {
    die('Пользователь не найден');
}

function updateJson($data, $key, $value) {
    $data[$key] = $value;
    return $data;
}

if (isset($_POST['subbtn'])) {
    $premoderation = $_POST['premoderation'];
    $accountstatus = $_POST['accountstatus'];
    $admin = $_POST['admin'];

    $userId = $_GET['user_id'];
    $currentJson = $user->i('content');

    if (!empty($currentJson)) {
        $currentJson = json_decode($currentJson, true);

        $updatedJson = updateJson($currentJson, 'premoderation', $premoderation);
        $updatedJsonString = json_encode($updatedJson, JSON_PRETTY_PRINT);

        if (($admin === 1 && Auth::userid() === 1) || ($admin != 1 && Auth::userid() != 1)) {
            DB::query("UPDATE users SET status = ?, admin = ?, content = ? WHERE id = ?", [
                $accountstatus,
                $admin,
                $updatedJsonString,
                $userId
            ]);
            echo "Данные успешно обновлены.";
        } else  {
            echo 'Не удалось обновить данные';
        }
       

        
    } else {
        echo "Ошибка: JSON данные не найдены.";
    }
}

?>
<form action="/admin?type=UserEdit&user_id=<?=$_GET['user_id']?>" method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block; min-width:500px;">

    <p><img src="<?=$user->i('photourl')?>" width="50">   <?=$user->i('username')?></p>
    <p>Был в сети: <b><?= Date::zmdate($user->i('online')) ?> <?php if (time() - 300 <= $user->i('online')) { ?><i>(online)</i><?php } ?></b></p>
    <p>Ссылка на профиль: <b><a href="/author/<?=$_GET['user_id']?>">https://<?= $_SERVER['SERVER_NAME'] ?>/author/<?= $_GET['user_id'] ?></a></b></p>
    <div class="p20" style="text-align:left; margin-bottom:15px">

        <h4>Настройки</h4>



        <div style="margin-bottom:3px; margin-top:5px">Прямая загрузка</div>
    <select name="premoderation" style="width:100%">
        <option value="true" <?php if ($user->content('premoderation') === 'true') { echo 'selected'; } ?>>Да</option>
        <option value="false" <?php if ($user->content('premoderation') === 'false' || $user->content('premoderation') === null) { echo 'selected'; } ?>>Нет</option>
    </select>
    <div style="margin-bottom:3px; margin-top:5px">Статус аккаунта</div>
    <select name="accountstatus" style="width:100%">
        <option value="0" <?php if ($user->i('status') === 0) { echo 'selected'; } ?>>Без ограничений</option>
        <option value="1" <?php if ($user->i('status') === 1) { echo 'selected'; } ?>>Заблокирован</option>
    </select>
    <div style="margin-bottom:3px; margin-top:5px">Статус аккаунта</div>
    <select name="admin" style="width:100%">
        <option value="0" <?php if ((int)$user->i('admin') === 0) { echo 'selected'; } ?>>Пользователь</option>
        <option value="1" <?php if ((int)$user->i('admin') === 1) { echo 'selected'; } if (Auth::userid() === 1) { echo 'disabled'; } ?>>Администратор</option>
        <option value="2" <?php if ((int)$user->i('admin') === 2) { echo 'selected'; } ?>>Фотомодератор</option>
        <option value="3" <?php if ((int)$user->i('admin') === 3) { echo 'selected'; } ?>>Модератор</option>
    </select>
       
    </div>
    <div class="p20" style="text-align:left; margin-bottom:15px">

<h4>Операции</h4>


<div class="cmt-submit"><a href="/admin?type=UserEdit&user_id='.$u['id'].'">Сбросить аватар</a></div>

</div>

<div class="cmt-submit"><input name="subbtn" type="submit" value="Применить"></div>

</form>