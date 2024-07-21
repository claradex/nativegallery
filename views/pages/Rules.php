<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

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
            <td class="main">
                <h1><?= $_GLOBAL['title'] ?></h1>
            
                <div class="p20" style="padding:20px">
                    <?php
                    $myfile = fopen($_SERVER['DOCUMENT_ROOT'].$_GLOBAL['rules'], "r") or die("Unable to open file!");
                    echo fread($myfile,filesize($_SERVER['DOCUMENT_ROOT'].$_GLOBAL['rules']));
                    fclose($myfile);
                    ?>
                </div>
            </td>
        </tr>
       
        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>