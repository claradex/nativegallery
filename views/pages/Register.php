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
                        <h1>Регистрация</h1>
                        <div class="mf-center-block">
                            <form method="post" id="form" class="p20i mf-label mf-center-block-wide">
                                <input type="hidden" name="accept" value="yes">

                                <input type="text" name="username" id="username" class="mf-input-wide" style="margin-top:10px" maxlength="50" placeholder="Ваш никнейм" value="">
                                <div style="color:#e00" id="err_username"></div>
                                <input type="email" name="email" id="email" class="mf-input-wide" style="margin-top:10px" maxlength="50" placeholder="Ваш e-mail" value="">
                                <div style="color:#e00" id="err_email"></div>
                                <input type="password" name="password" id="password" class="mf-input-wide" style="margin-top:10px" maxlength="50" placeholder="Ваш пароль" value="">
                                <div style="color:#e00" id="err_password"></div>

                                <input type="button" id="regbtn" class="mf-button-wide" style="margin-top:15px" value="Зарегистрироваться">
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

                                    if (username == '') err_username.html('Поле не заполнено');
                                    if (password == '') err_password.html('Поле не заполнено');
                                    if (email == '') err_email.html('Поле не заполнено');
                                    else
                                    if (!email.match(/^[0-9a-z_\-.]+@[0-9a-z_\-^.]+\.[a-z]{2,4}$/i)) err_email.html('Некорректный адрес');


                                    if (err_email.html() == '') {
                                        $(this).prop('disabled', true).val('Отправка данных...');

                                        $.post('/api/register', {
                                                username: username,
                                                email: email,
                                                password: password
                                            }, function(r) {
                                                r = JSON.parse(r);
                                                if (r.errorcode > 0) {
                                                    $('#err_email').html(r.errortitle);
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
                </td>
            </tr>
            <tr>
          
        </tbody>
    </table>




</body>

</html>