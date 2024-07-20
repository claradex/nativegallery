<?php
use App\Services\{Router, Auth};

$user = new \App\Models\User(Auth::userid());

if (!isset($_GET['type']) || $_GET['type'] != 'Photo') {
    if ($user->i('admin') === 2) {
        header('Location: ?type=Photo');
    }
}

?>
<!DOCTYPE html>
<html lang="ru">




<body>
<div class="container">
<?=\App\Controllers\AdminController::loadMenu();?>
<?=\App\Controllers\AdminController::loadContent();?> 
</div>



</body>

</html>