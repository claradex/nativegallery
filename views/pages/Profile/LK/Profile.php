<?php
use \App\Services\{Auth, DB, Date};
use \App\Models\User;

$user = new User(Auth::userid());
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
                <center>
                    <div class="tabs">
                        <nav class="tab-nav">
                            <a href="/lk/profile" class="tab-item <?php if ($_GET['type'] === null) { ?> active <?php } ?>">Профиль</a>
                            <a href="?type=Security" class="tab-item <?php if ($_GET['type'] === 'Security') { ?> active <?php } ?>">Безопасность</a>
                            <a href="?type=Personalization" class="tab-item <?php if ($_GET['type'] === 'Personalization') { ?> active <?php } ?>">Внешний вид</a>
                        </nav>
                        <div class="tab-content">
                            <?=\App\Controllers\ProfileController::loadContent();?> 
                            <script src="/js/jquery.form.min.js"></script>
                        </div>
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