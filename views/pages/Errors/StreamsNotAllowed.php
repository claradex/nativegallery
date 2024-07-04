<?php
header("HTTP/1.1 403 Forbidden");
?>
<html>
    <head>
        <style>body {
            font-family: sans-serif;
            position: relative;
            height: 100vh;
            overflow: hidden;
            }
            #dbErrorBody {
            position: absolute;
            top: 50%;
            left: 50%;
            margin-right: -50%;
            transform: translate(-50%, -50%);
            width: 400px;
            text-align: center;
            }
            #dbErrorBody h1 {
            margin-top: 5px;
            margin-bottom: 2px;
            }
            #dbErrorBody span {
            color: grey;
            }
            #dbErrorBody img {
            max-width: 256px;
            }
        </style>
        <title>Resource Busy</title>
    </head>
    <body>
        <div id="dbErrorBody">
            <img src="/static/img/busy.png" alt="Error">
            <h1>Вы не участвуете в программе тестирования Birux Streams</h1>
            <span>К сожалению, мы уже набрали достаточное количество участников. Следующая волна заявок будет скоро — следите в Telegram-канале
                <a href="https://t.me/biruxch">Birux</a>
            </span>
        </div>
    </body>
</html>


    
