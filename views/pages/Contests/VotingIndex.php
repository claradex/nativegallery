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
        <tr>
            <td class="main">
           
                <center>
                    <h1>Фотоконкурс</h1>
                   
                    <p class="narrow" style="font-size:19px"><b>Голосование</b> &nbsp;&middot;&nbsp; <a href="?show=results">Победители</a> &nbsp;&middot;&nbsp; <a href="?show=rating">Рейтинг</a> &nbsp;&middot;&nbsp; <a href="?show=waiting">Претенденты</a></p>
                    <div style="margin-top:20px">Чтобы проголосовать, отметьте одну, две или три фотографии, которые Вам понравились</div><br><br>
                    <div class="p20">
                        <h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4>
                    </div>
                    <h2>Следующий Фотоконкурс будет через:</h2>
                    <h1 id="countdown"></h1>
                    <br>
                  
                </center>
            </td>
        </tr>

        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>
    <script>
    // Установите дату и время, до которого нужно отсчитывать
    const countdownDate = new Date("Mar 1, 2025 00:00:00").getTime();

    // Обновляем отсчет каждую секунду
    const x = setInterval(function() {

        // Получаем текущее время
        const now = new Date().getTime();

        // Вычисляем разницу между целевой датой и текущим временем
        const distance = countdownDate - now;

        // Вычисляем дни, часы, минуты и секунды
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Отображаем результат в элементе с id "countdown"
        document.getElementById("countdown").innerHTML = 
            days + ":" + hours + ":" + minutes + ":" + seconds;

        // Если отсчет завершен, выводим сообщение
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("countdown").innerHTML = "Время истекло!";
        }
    }, 1000);
</script>
</body>

</html>