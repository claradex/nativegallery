<?php
session_start();

use \App\Services\{Auth, DB, ThemeManager};
use \App\Models\User;

$themeManager = new ThemeManager();
$themeManager->loadThemes();

$themesList = $themeManager->getAllThemes();
var_dump($_SESSION);
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['theme_id'])) {
  try {
    $themeManager->saveThemeToProfile($_POST['theme_id']);
    header('Location: ' . $_SERVER['REQUEST_URI']);
    exit;
  } catch (Exception $e) {
    error_log($e->getMessage());
  }
}
?>


<form method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block">














  <div class="p20" style="text-align:left; margin-bottom:15px">

    <h4>Оформление сайта</h4>

    <div style="margin-bottom:3px; margin-top:5px">Тема</div>
    <select name="theme_id" style="width:100%" onchange="this.form.submit()">
      <option value="standard" <?= $selectedTheme === 'standard' ? 'selected' : '' ?>>Стандартная</option>
      <?php foreach ($themesList as $t): ?>
        <option value="<?= htmlspecialchars($t['id']) ?>"
          <?= $selectedTheme === $t['id'] ? 'selected' : '' ?>>
          <?= htmlspecialchars($t['name']) ?>
        </option>
      <?php endforeach; ?>
    </select>

  </div>




  <div style="text-align:center; margin-top:25px">
    <input type="submit" id="submitBtn" style="width:250px; height:30px; margin-bottom:5px" value="Сохранить">
    <div><span style="color:red; font-weight:bold; display:none" id="errors"></span><span style="display:none; font-weight:bold; color:green" id="applied">✔&ensp;Изменения внесены</span></div>
  </div>

  </div>
</form>