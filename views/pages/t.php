<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Таймер до 12 июля</title>
    <style>
        @font-face {
            font-family: 'Pepperscreen';
            src: url('/static/PEPPERSCREEN.ttf') format('truetype');
        }

        body {
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f0f0f0;
            font-family: 'Pepperscreen', sans-serif;
        }

        #timer {
            font-size: 100px;
            color: #000000;
        }
    </style>
</head>
<body>
    <center><h1 style="color: #f40300; font-size: 65px;">сайт будет захвачен через</h1></center><br>
    <center><div id="timer">Загрузка...</div></center><br>
    <center><img width="750" src="/static/img/sttslogo.png"></center>
    <script>
        function updateTimer() {
            const now = new Date();
            const targetDate = new Date(now.getFullYear(), 6, 12, 12, 0, 0); // 12 июля 12:00 по локальному времени
            if (now > targetDate) {
                targetDate.setFullYear(now.getFullYear() + 1); // если уже прошло, тогда следующее 12 июля
            }
            const remainingTime = targetDate - now;

            const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

            document.getElementById('timer').textContent = `${days}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        setInterval(updateTimer, 1000);
        updateTimer(); // Начальное обновление
    </script>
</body>
</html>
