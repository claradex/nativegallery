<!DOCTYPE html>
<html lang="ru">

<head>
<?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>

   
</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
    <div id="backgr"></div>
   
        <tr>
            <td class="main">
                <center>
                    <h1>Вход на сайт</h1>
                    <div class="mf-center-block mf-label">

                        <form id="form" method="post" class="p20i mf-center-block-wide mf-label">
                            <input type="hidden" name="ref" value="/">

                            <input type="text" name="username" id="username" class="mf-input-wide" placeholder="Имя или e-mail" value="">
                            <div style="color:#e00" id="err_username"></div>

                            <input type="password" name="password" id="password" class="mf-input-wide" placeholder="Пароль">
                            <div style="color:#e00" id="err_password"></div>

                         
                            <input type="button" id="loginbtn" class="mf-button-wide" value="Войти">

                        </form>

                        <div style="margin-top:15px"><a href="/register" class="mf-button">Регистрация</a></div>
                    </div><br />

                    <script>
                        $(document).ready(function() {
                            $('#username').on('input', function() {
                                $('#err_password, #err_username').html('');
                            });
                            $('#password').on('input', function() {
                                $('#err_password').html('');
                            });

                            $('#loginbtn').on('click', function() {
                                var username = $('#username').val().trim();
                                var password = $('#password').val().trim();

                                var err_username = $('#err_username').html('');
                                var err_password = $('#err_password').html('');

                                if (username == '') err_username.html('Поле не заполнено');
                                if (password == '') err_password.html('Поле не заполнено');

                                if (err_username.html() + err_password.html() == '') {
                                    $('#loginbtn').prop('disabled', true).val('Отправка данных...');

                                    $.post('/api/login', {
                                            username: username,
                                            password: password,
                                            remember: $('#remember').is('checked')
                                        }, function(r) {
                                            r = JSON.parse(r);
                                            if (r.errorcode == 1) {
                                                err_password.html('Неверно указаны логин и/или пароль');
                                                $('#loginbtn').prop('disabled', false).val('Войти');
                                            } else window.location.href = '/';
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
    
    </table>


</body>

</html>