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
