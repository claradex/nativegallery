<?php

use App\Services\{Router, Auth};

if (Auth::userid() > 0) {
    Router::redirect('/');
}
?>
<html lang="ru">


<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>
<link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>

<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <?php
                if (NGALLERY['root']['registration']['access']['public'] === true) {  ?>
                    <center>
                        <h1><b>Регистрация</b></h1>
                        <table cellspacing="10" cellpadding="0" border="0" align="center" style="margin: 9px;">
                            <tbody>
                                <tr>
                                    <td>
                                        <img src="/static/img/logocube.png" style="width: 32px;" align="middle">
                                    </td>
                                    <td>
                                        <b><?= NGALLERY['root']['title'] ?> — это универсальное средство для размещения своих фотографий и видеороликов, созданное на базе движка СТТС.</b><br>
                                        Публикуйте свои самые лучшие фотографии и великолепные видео на наш портал, чтобы их увидели все желающие.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="mf-center-block">
                            <form method="post" id="form" class="p20i mf-label mf-center-block-wide">
                                <input type="hidden" name="accept" value="yes">
                                <div class="styled-input">
                                    <input type="text" name="username" id="username" required="">
                                    <label for="username">Ваш никнейм</label>
                                </div>
                                <div style="color:#e00" id="err_username"></div>
                                <div class="styled-input">
                                    <input type="text" name="email" id="email" required="">
                                    <label for="email">Ваш e-mail</label>
                                </div>
                                <div style="color:#e00" id="err_email"></div>
                                <div class="styled-input">
                                    <input name="password" id="password" type="password" required="">
                                    <label for="password">Ваш пароль</label>
                                </div>
                                <div style="color:#e00" id="err_password"></div>


                                <input type="button" id="regbtn" class="mf-button-wide" style="margin-top:15px" value="Зарегистрироваться">
                                <p>Регистрируясь на сервере <?= NGALLERY['root']['title'] ?>, вы <a href="/rules">принимаете его правила.</a></p>
                                <p><b><a href="/tour">Вы можете пройти экскурсию по сайту.</a></b></p>
                            </form><br><br>

                            <br>
                        </div>

                        <script>
                            $(document).ready(function() {
                                $('#email').on('input', function() {
                                    $('#err_email').html('');
                                });

                                $('#regbtn').on('click', function() {
                                    var username = $('#username').val().trim();
                                    var err_username = $('#err_username').html('');
                                    var email = $('#email').val().trim();
                                    var err_email = $('#err_email').html('');
                                    var password = $('#password').val().trim();
                                    var err_password = $('#err_password').html('');

                                    if (username == '') err_username.html('<i style="color:#e00" class="bx bx-error"></i> Поле не заполнено');
                                    if (password == '') err_password.html('<i style="color:#e00" class="bx bx-error"></i> Поле не заполнено');
                                    if (email == '') err_email.html('<i style="color:#e00" class="bx bx-error"></i> Поле не заполнено');
                                    else
                                    if (!email.match(/^[0-9a-z_\-.]+@[0-9a-z_\-^.]+\.[a-z]{2,4}$/i)) err_email.html('<i style="color:#e00" class="bx bx-error"></i> Некорректный адрес');


                                    if (err_email.html() == '') {
                                        $(this).prop('disabled', true).val('Отправка данных...');

                                        $.post('/api/register', {
                                                username: username,
                                                email: email,
                                                password: password
                                            }, function(r) {
                                                r = JSON.parse(r);
                                                if (r.errorcode > 0) {
                                                    $('#err_email').html('<i class="bx bx-error"></i>' + r.errortitle);
                                                    $('#regbtn').prop('disabled', false).val('Зарегистрироваться');
                                                } else {
                                                    window.location.href = "/"
                                                }
                                            })
                                            .fail(function(jx) {
                                                if (jx.responseText != '') alert(jx.responseText);
                                            });
                                    }
                                });
                            });
                        </script>
                    </center>
                <?php } else { ?>
                    <center>
                        <h1>К сожалению, регистрация на сервере <?= NGALLERY['root']['title'] ?> закрыта.</h1>
                        </center?
                            <?php } ?>
                            </td>
        </tr>
        <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>

        </tbody>
    </table>




</body>

</html>