<?php
$rand = mt_rand(1, 12);

if ($rand === 1) {
    $text = 'Что-то грядёт.';
} else if ($rand === 2) {
    $text = 'Может, пора запустить СТТС Собаки?';
} else if ($rand === 3) {
    $text = 'Не снижая обороты.';
} else if ($rand === 4) {
    $text = 'Мы соскучились по твоим фотографиям.';
} else if ($rand === 5) {
    $text = 'Хм-м...';
} else if ($rand === 6) {
    $text = 'Весьма очень даже.';
} else if ($rand === 7) {
    $text = 'Не забудь взять царских припасов с собой.';
} else if ($rand === 8) {
    $text = 'Бобровы будут гордиться.ю';
} else if ($rand === 9) {
    $text = 'Нельзя было стучаться, что-ли?';
} else if ($rand === 10) {
    $text = 'Ха-ха.';
} else if ($rand === 11) {
    $text = 'Недурно.';
} else if ($rand === 12) {
    $text = '...';
}
?>


<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Таймер обратного отсчета</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap');

body {
    font-family: Inter Tight !important; 
}
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin-top: 100px;
        }
        #countdown {
            font-size: 100px;
            color: #333;
        }
    </style>
</head>
<body>
    <center><img src="/static/img/sttslogo.png" width="500"></center>
    <h1><?=$text?></h1>
    <div id="countdown">00:00:00</div>

    <script>
        function updateCountdown() {
            const now = new Date();
            const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Преобразуем текущее время в UTC

            // Определяем текущее время в UTC+3 (МСК)
            const nowMoscow = new Date(nowUtc.setHours(nowUtc.getUTCHours() + 3));

            // Устанавливаем время окончания на 17:00 текущего дня по МСК
            let targetTime = new Date(nowMoscow.getFullYear(), nowMoscow.getMonth(), nowMoscow.getDate(), 17, 0, 0);

            // Если текущее время уже прошло 17:00, устанавливаем на следующий день
            if (nowMoscow >= targetTime) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const timeDifference = targetTime - nowMoscow;

            if (timeDifference <= 0) {
                location.reload(); // Перезагрузить страницу по истечению времени
            } else {
                const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
                const seconds = Math.floor((timeDifference / 1000) % 60);

                document.getElementById('countdown').textContent = 
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }

        setInterval(updateCountdown, 1000); // Обновляем каждую секунду
        updateCountdown(); // Начальная установка
    </script>

</body>
</html>
