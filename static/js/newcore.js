/*function errimg() {
    // Создаем HTML-контент
    const content = `<center>
                        <div class="p20 s5" style="border:none; margin:0 -20px; display:none;">
                            <b>Фото потеряно при крахе винчестера</b>
                            <div class="sm" style="margin-top:5px">
                                Если у вас есть это фото, пожалуйста, пришлите его на 
                                <a href="mailto:admin@transphoto.org?subject=Для восстановления фото 651731">admin@transphoto.org</a>
                            </div>
                        </div>
                    </center>`;
    
    // Добавляем HTML-контент
    $('#err').html(content);

    // Анимация для появления блока
    $('#err .p20').slideDown(2000, function() {
        // После отображения блока, анимируем изменение текста
        $('#err b').fadeOut(1000, function() {
            $(this).text("Фото было утеряно в результате сбоя жесткого диска").fadeIn(1000, function() {
                // После изменения текста делаем его красным и мигающим
                $(this).css('color', 'red').fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500, function() {
                    // После мигания анимируем масштабирование и поворот текста
                    $(this).animate({ fontSize: '36px', rotate: '360deg' }, 2000, function() {
                        // Завершаем анимацию с эффектом взрыва
                        $(this).hide('explode', { pieces: 50 }, 2000, function() {
                            // По окончанию взрыва плавно скрываем контейнер
                            $('#err').fadeOut(2000, function() {
                                // Дополнительная анимация для появления блока
                                $('#err').slideDown(1000, function() {
                                    // Тряска всей страницы наискосок
                                    var angle = Math.random() * 2000 - 110; // случайный угол от -10 до 10 градусов
                                    var rotateDirection = Math.random() < 0.5 ? '-=' : '+=';
                                    
                                    // Анимация для поворота страницы
                                    $('body').animate({ rotate: rotateDirection + angle + 'deg' }, {
                                        duration: 10000,
                                        step: function(now, fx) {
                                            $(this).css('transform', 'rotate(' + now + 'deg)');
                                        },
                                        complete: function() {
                                            // Анимация для тряски элементов
                                            $('div').each(function() {
                                                // Генерируем случайные значения для тряски
                                                var leftPos = Math.random() * 2010 - 5; // случайное смещение влево от -5 до 5 пикселей
                                                var topPos = Math.random() * 1000 - 5; // случайное смещение вверх от -5 до 5 пикселей
                                                
                                                // Применяем анимацию с тряской и поворотом
                                                $(this).animate({
                                                    left: '+=' + leftPos + 'px',
                                                    top: '+=' + topPos + 'px'
                                                }, {
                                                    duration: 100000,
                                                    easing: 'easeInOutQuad',
                                                    queue: false, // отключаем очередь анимаций
                                                    complete: function() {
                                                        // Дополнительная тряска с эффектом
                                                        $(this).effect('shake', { distance: 500, times: 2000 }, 50000);
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        // Дополнительная анимация для ссылки
        $('#err a').delay(1500).fadeIn(1000);

        // Анимация для подчеркивания ссылки
        $('#err a').hover(function() {
            $(this).animate({ fontSize: '18px', paddingLeft: '20px', paddingRight: '20px', borderBottomWidth: '4px' }, 500);
        }, function() {
            $(this).animate({ fontSize: '16px', paddingLeft: '15px', paddingRight: '15px', borderBottomWidth: '0px' }, 500);
        });

        // Анимация для блока .sm
        $('#err .sm').delay(1000).slideDown(1500).delay(1500).slideUp(1500).slideDown(1500);

        // Анимация для всего блока .p20
        $('#err .p20').delay(500).fadeIn(1000).fadeOut(1000).fadeIn(1000).fadeOut(1000).fadeIn(1000);
        
        // Дополнительная анимация для изменения цвета фона
        $('body').animate({ backgroundColor: '#f0f0f0' }, 2000).delay(1000).animate({ backgroundColor: 'white' }, 2000);
        
        // Анимация для мигания текста
        $('#err b').delay(2000).fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
        
        // Анимация для изменения размера ссылки
        $('#err a').delay(2500).animate({ fontSize: '20px' }, 1000).delay(1000).animate({ fontSize: '16px' }, 1000);
    });
}*/



function errimg() {
    const content = `<center>
                        <div class="p20 s5" style="border:none; margin:0 -20px; display:none;">
                            <b>Фото потеряно при крахе винчестера</b>
                            <div class="sm" style="margin-top:5px">
                                Если у вас есть это фото, пожалуйста, пришлите его на 
                                <a href="mailto:admin@transphoto.org?subject=Для восстановления фото 651731">admin@transphoto.org</a>
                            </div>
                        </div>
                    </center>`;
    $('#err').html(content);
    $('#err .p20').slideDown(500);
}
