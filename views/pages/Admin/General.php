<?php
use \App\Services\{Auth, DB};
use \App\Models\User;
?>
<table class="table" style="margin-top: 15px;">
  <thead>
    <tr class="sticky">
      <th class="c">ID</th>
      <th class="c"></th>
      <th class="c">Никнейм</th>
      <th class="c">Почта</th>
      <th class="c">Прямая загрузка</th>
      <th class="c">Ссылка</th>
      <th class="c"></th>
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
      <th class="n">'.$u['id'].'</th>
      <td class="cs"><img src="'.$u['photourl'].'" width="35"></td>
      <td class="cs">'.$u['username'].'</td>
      <td class="cs">'.$u['email'].'</td>
      <td class="cs">'.$prem.'</td>
      <td class="cs"><a href="https://'.$_SERVER['SERVER_NAME'].'/author/'.$u['id'].'">https://'.$_SERVER['SERVER_NAME'].'/author/'.$u['id'].'</a></td>
      <td class="cs"><div class="cmt-submit"><a href="/admin?type=UserEdit&user_id='.$u['id'].'">Редактировать</a></div></td>
    </tr>';
    }
    ?>
  </tbody>
</table>