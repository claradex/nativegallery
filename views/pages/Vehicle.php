<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\Vehicle;

$id = explode('/', $_SERVER['REQUEST_URI'])[2];
$data = DB::query('SELECT * FROM entities_data WHERE id=:id', array(':id' => $id))[0];
$vehicle = new Vehicle($data['entityid']);

$vehicledatavariables = json_decode($data['content'], true);


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
                <h1><?= $data['title'] ?></h1>

                <table class="horlines">
                    <col width="150">
                    <col>
                    <?php
                    $vehiclevariables = json_decode($vehicle->getvehicle('sampledata'), true);
                    $num = 1;
                    foreach ($vehiclevariables as $vb) {
                        echo '<tr class="h21"><td class="ds nw">' . $vb['name'] . ':</td><td class="d"><b>' . $vehicledatavariables[$num]['value'] . '</b></td></tr>';
                        $num++;
                    }
                    ?>


                </table><br>



        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>