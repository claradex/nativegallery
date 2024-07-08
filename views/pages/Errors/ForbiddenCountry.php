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
   <center><h1>Сервер <?=NGALLERY['root']['title']?> недоступен в вашей стране</h1></center>
   <center><img src="/static/img/403.jpg"></center>
   <center><p>Вы можете связаться с администратором сервера, если считаете, что это ошибка.</p></center>


</body>

</html>