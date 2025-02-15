<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{Vehicle, User};

function convertUnixToRussianDateTime($unixTime) {
    // Создаем объект DateTime из Unix-времени
    $dateTime = new DateTime("@$unixTime");
    
    // Устанавливаем временную зону (можно изменить на нужную)
    $dateTime->setTimezone(new DateTimeZone('Europe/Moscow'));
    
    // Форматируем дату и время с использованием IntlDateFormatter
    $formatter = new IntlDateFormatter(
        'ru_RU', 
        IntlDateFormatter::LONG, 
        IntlDateFormatter::NONE,
        'Europe/Moscow',
        IntlDateFormatter::GREGORIAN,
        'd MMMM yyyy года в H:mm'
    );
    
    return $formatter->format($dateTime);
}
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
                <h1>Принять участие в Фотоконкурсе</h1>
                <script src="/js/jquery-ui.js?1633005526"></script>
                <script src="/js/selector.js?1730197663"></script>
                <script>
                    addTexts({
                        'VF_MAXLENGTH': 'Буфер обмена содержит %s знаков, но значение в этом поле не может быть длиннее %s знаков!\nВероятно, вы пытаетесь вставить некорректные данные'
                    });

                    $(document).ready(function() {
                        $('#mname').autocompleteSelector('mid', '/api.php?action=get-models&type=2', {
                            minLength: 1,
                            defaultLabel: '(модель неизвестна)',
                            defaultValue: 632
                        });
                        $('#chname').autocompleteSelector('chid', '/api.php?action=get-chassis&type=2', {
                            minLength: 1,
                            defaultLabel: '(нет)'
                        });

                        $('#state, #service').change(function() {
                            $(this).attr('class', $('option:selected', this).attr('class'));
                        }).change();

                        $('#mform').on('submit', function() {
                            var built_y_len = $('#built_y').val().length;
                            var scrap_y_len = $('#scrap_y').val().length;

                            if (built_y_len > 1 && built_y_len < 4 ||
                                scrap_y_len > 1 && scrap_y_len < 4) {
                                alert('Неверное значение в поле «год» (0, 1 либо 4 символа).');
                                return false;
                            }

                            var source = $('#source');

                            if (source.val().trim().length < 4) {
                                alert('Не указан источник сведений. Пожалуйста, заполните соответствующее поле..');
                                source[0].focus();
                                return false;
                            }

                            $('input[type="submit"]', this).prop('disabled', true);

                            return true;
                        });

                        // Фильтрация вставляемых из буфера данных
                        $('#num, #gos, #zn, #vin, #cn, #start_y, #leave_y, #built_y, #scrap_y').on('paste', function(e) {
                            var field = $(this);
                            var text = e.originalEvent.clipboardData.getData('Text').trim();

                            var maxlength = parseInt(field.attr('maxlength'));
                            if (maxlength && text.length > maxlength)
                                alert(_text['VF_MAXLENGTH'].replace('%s', text.length).replace('%s', maxlength) + '.');
                            else field.insertAtCaret(text);

                            return false;
                        });

                        // Опции даты
                        $('.approx-aprx').css('font-weight', 'normal').on('change', function() {
                            $(this).attr('class', 'approx-aprx ' + $('option:selected', this).attr('class'))
                        }).change();
                    });


                    $.fn.insertAtCaret = function(myValue) {
                        return this.each(function() {
                            if (document.selection) {
                                // For browsers like Internet Explorer
                                this.focus();
                                var sel = document.selection.createRange();
                                sel.text = myValue;
                                this.focus();
                            } else
                            if (this.selectionStart || this.selectionStart == '0') {
                                // For browsers like Firefox and Webkit based
                                var startPos = this.selectionStart;
                                var endPos = this.selectionEnd;
                                var scrollTop = this.scrollTop;
                                this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                                this.focus();
                                this.selectionStart = startPos + myValue.length;
                                this.selectionEnd = startPos + myValue.length;
                                this.scrollTop = scrollTop;
                            } else {
                                this.value += myValue;
                                this.focus();
                            }
                        })
                    };
                </script>

                <form method="post" id="mform" action="?action=write">
                    <input type="hidden" name="cid" value="14">
                    <input type="hidden" name="type" value="2">
                    <input type="hidden" name="link_gos" value="0">

                    <input type="hidden" name="num" id="num" value="">

                    <h4>В каком Фотоконкурсе вы хотите принять участие?</h4>
                    <div class="p20w">
                        <table>
                            <tbody>
                                <tr>
                                    <th></th>
                                    <th>Тематика</th>
                                    <th>Старт набора претендентов</th>
                                    <th>Закрытие набора претендентов</th>
                                    <th>Начало проведения</th>
                                    <th>Итоги и победители</th>
                                </tr>
                               
                                <?php
                                $entities = DB::query('SELECT * FROM contests WHERE closepretendsdate>=:id', array(':id'=>time()));
                                foreach ($entities as $e) {
                                    $theme = DB::query('SELECT * FROM contests_themes WHERE id=:id', array(':id'=>$e['themeid']))[0];
                                    echo '<tr>
                                    <td class="ds"><input type="radio" name="base_nid" id="n'.$e['id'].'" value="'.$e['id'].'" onclick="fillFields('.$e['id'].')"></td>
                                    <td class="n">'.$theme['title'].'</td>
                                    <td class="ds">'.convertUnixToRussianDateTime($e['openpretendsdate']).'</td>
                                    <td class="ds">'.convertUnixToRussianDateTime($e['closepretendsdate']).'</td>
                                    <td class="ds">'.convertUnixToRussianDateTime($e['opendate']).'</td>
                                    <td class="ds">'.convertUnixToRussianDateTime($e['closedate']).'</td>
                                   
                                </tr>';
                                }
                                ?>
                                 
                               
                            </tbody>
                        </table>
                    </div>
                    <br clear="all"><br>

                    <div class="p20" style="padding-left:5px; margin-bottom:15px">
                        <table class="nospaces" width="100%">
                            <input type="hidden" name="did" value="27">
                            <tbody>
                                <?php
                                $vehicle = DB::query('SELECT * FROM entities WHERE id=:id', array(':id' => $_GET['type']))[0];
                                $data = json_decode($vehicle['sampledata'], true);
                                $count = 1;
                                foreach ($data as $d) {
                                    
                                    if ($d['important'] === "1") {
                                        $imp = 'required';
                                    }
                                    echo '
                                <tr>
                                    <td class="lcol">' . $d['name'] . '</td>
                                    <td style="padding-bottom:15px"><input type="text" name="modelinput_'.$count.'" id="num" style="width:80px" maxlength="21" value=""></td>
                                </tr>';
                                $count++;
                                }
                                ?>
                                <tr>
                                    <td style="width: 10%"></td>
                                    
                                    <script>
                                        var vdata = {};

                                        vdata[0] = [0, '', '', '', 632, '(модель неизвестна)', 0, '(нет)', 0, 1, '', '', '', 0, '', 0, 0, '', 0, '', 0, '', 0, '', 0, '', 0, '', ''];
                                        vdata[594939] = [27, '48', '', '', 135, 'ПТЗ-5283', 0, '(нет)', 0, 5, '14', '', '', 11, '2002', 10, 0, '', 10, '2018-11-30', 10, '0000-00-00', 0, '0000-00-00', 0, '2022-00-00', 0, '', ''];

                                        function setDateByYM(field, y, m, approx) {
                                            $('#' + field + '_m').val(m == 0 ? '' : m);
                                            $('#' + field + '_y').val(y == '0000' ? '' : y);
                                            $('#' + field + '_approx_aprx').val(approx).change();
                                        }


                                        function setDateByDate(field, date, approx) {
                                            var d = date.substring(8, 10);
                                            var m = date.substring(5, 7);
                                            var y = date.substring(0, 4);

                                            $('#' + field + '_d').val(d == 0 ? '' : d);
                                            $('#' + field + '_m').val(m == 0 ? '' : m);
                                            $('#' + field + '_y').val(y == 0 ? '' : y);
                                            $('#' + field + '_approx_aprx').val(approx).change();
                                        }


                                        function fillFields(nid) {
                                            var i = 0;

                                            $('#did').val(vdata[nid][i++]);
                                            $('#num').val(vdata[nid][i++]);
                                            $('#gos').val(vdata[nid][i++]);
                                            $('#nu2').val(vdata[nid][i++]);
                                            $('#mid').val(vdata[nid][i++]);
                                            $('#mname').val(vdata[nid][i++]);
                                            $('#chid').val(vdata[nid][i++]);
                                            $('#chname').val(vdata[nid][i++]);
                                            $('#service').val(vdata[nid][i++]).change();
                                            $('#state').val(vdata[nid][i++]).change();
                                            $('#zn').val(vdata[nid][i++]);
                                            $('#cn').val(vdata[nid][i++]);
                                            $('#vin').val(vdata[nid][i++]);

                                            setDateByYM('built', vdata[nid][i + 1], vdata[nid][i], vdata[nid][i + 2]);
                                            i += 3;
                                            setDateByYM('scrap', vdata[nid][i + 1], vdata[nid][i], vdata[nid][i + 2]);
                                            i += 3;

                                            setDateByDate('start', vdata[nid][i], vdata[nid][i + 1]);
                                            i += 2;
                                            setDateByDate('launc', vdata[nid][i], vdata[nid][i + 1]);
                                            i += 2;
                                            setDateByDate('haltd', vdata[nid][i], vdata[nid][i + 1]);
                                            i += 2;
                                            setDateByDate('leave', vdata[nid][i], vdata[nid][i + 1]);
                                            i += 2;

                                            $('#note').val(vdata[nid][i++]);
                                            $('#history').val(vdata[nid][i++]);
                                        }
                                    </script>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <br>
                                        <input type="submit" value="&nbsp; &nbsp; &nbsp; Отправить &nbsp; &nbsp; &nbsp;">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
                
            </td>
        </tr>
        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>