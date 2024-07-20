<?php
use \App\Services\{Auth, DB};
use \App\Models\User;
?>
<table class="table" style="margin-top: 15px;">
  <thead>
    <tr>
      <th scope="col">ID</th>
      <th scope="col"></th>
      <th scope="col">Никнейм</th>
      <th scope="col">Почта</th>
      <th scope="col">Прямая загрузка</th>
      <th scope="col">Ссылка</th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody>
    <?php
    $users = DB::query('SELECT * FROM users');
    foreach ($users as $u) {
        $user = new \App\Models\User($u['id']);
        if ($user->content('premoderation') === "true") {
            $prem = 'Да';
        } else {
            $prem = 'Нет';
        }
        echo '<tr>
      <th>'.$u['id'].'</th>
      <td><img src="'.$u['photourl'].'" width="35"></td>
      <td>'.$u['username'].'</td>
      <td>'.$u['email'].'</td>
      <td>'.$prem.'</td>
      <td><a href="https://'.$_SERVER['SERVER_NAME'].'/author/'.$u['id'].'">https://'.$_SERVER['SERVER_NAME'].'/author/'.$u['id'].'</a></td>
      <td><div class="cmt-submit"><a href="/admin?type=UserEdit&user_id='.$u['id'].'">Редактировать</a></div></td>
    </tr>';
    }
    ?>
  </tbody>
</table>