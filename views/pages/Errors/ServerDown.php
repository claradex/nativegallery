<?php

use App\Services\{Router, Auth, DB, Date};
?>
<html lang="ru">


<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<body>
    <style>
        body,h1 {
            font-family: Tahoma, Geneva, Verdana, sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
        }
    </style>
   <center><h1>Сервер <?=NGALLERY['root']['title']?> находится на технических работах</h1></center>
   <center><img src="/static/img/503.jpg"></center>


</body>

</html>