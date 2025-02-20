<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{Vehicle, User};

function convertUnixToRussianDateTime($unixTime)
{
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

                <form id="sendForm" method="post" id="mform">

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
                                $entities = DB::query('SELECT * FROM contests WHERE closepretendsdate>=:id', array(':id' => time()));
                                foreach ($entities as $e) {
                                    $theme = DB::query('SELECT * FROM contests_themes WHERE id=:id', array(':id' => $e['themeid']))[0];
                                    echo '<tr>
                                    <td class="ds"><input type="radio" name="cid" id="n' . $e['id'] . '" value="' . $e['id'] . '" onclick="fillFields(' . $e['id'] . ')"></td>
                                    <td class="n">' . $theme['title'] . '</td>
                                    <td class="ds">' . convertUnixToRussianDateTime($e['openpretendsdate']) . '</td>
                                    <td class="ds">' . convertUnixToRussianDateTime($e['closepretendsdate']) . '</td>
                                    <td class="ds">' . convertUnixToRussianDateTime($e['opendate']) . '</td>
                                    <td class="ds">' . convertUnixToRussianDateTime($e['closedate']) . '</td>
                                </tr>';
                                }
                                ?>


                            </tbody>
                        </table>
                    </div>
                    <br clear="all"><br>

                    <div class="p20" style="padding-left:5px; margin-bottom:15px">
                        <table class="nospaces" width="100%">
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
                                    <td style="padding-bottom:15px"><input type="text" name="modelinput_' . $count . '" id="num" style="width:80px" maxlength="21" value=""></td>
                                </tr>';
                                    $count++;
                                }
                                ?>
                                <tr>
                                    <td style="width: 10%"></td>


                                </tr>
                                <tr>
                                <tr>
                                    <td class="lcol">Фотография, которую вы хотите отправить на Фотоконкурс</td>
                                    <td style="padding-bottom:15px">
                                        <select id="photoId" name="photo_id">
                                            <option value="'.$p['id'].'" disabled selected>Выберите фотографию</option>
                                            <?php
                                            $photos = DB::query('SELECT * FROM photos WHERE user_id=:uid AND on_contest=0', array(':uid' => Auth::userid()));
                                            foreach ($photos as $p) {
                                                $content = json_decode($p['content'], true);
                                                if (($content['video'] === null || $content['type'] === 'image') && $p['moderated'] === 1) {
                                                    echo '<option photourl="/api/photo/compress?url=' . $p['photourl'] . '" value="' . $p['id'] . '">[ID: ' . $p['id'] . '] ' . $p['place'] . '</option>';
                                                }
                                            }
                                            ?>
                                        </select>
                                    </td>
                                </tr>


                                <td>
                                    <div id="result"></div>
                                </td>
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
    <script>

    $('#sendForm').submit(function(e) {
            e.preventDefault();
            $.ajax({
                type: "POST",
                url: '/api/photo/contests/sendpretend',
                data: $(this).serialize(),
                success: function(response) {
                    var jsonData = JSON.parse(response);
                    if (jsonData.errorcode === 0) {
                        alert('Фотография успешно отправлена на претенденты на Фотоконкурс');
                    } else {
                        alert('Пожалуйста, выберите Фотоконкурс на который вы хотите отправить фотографию!');
                    }
                    
                }
            });
        });

        document.getElementById('photoId').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const photoUrl = selectedOption.getAttribute('photourl');

            if (photoUrl) {
                const imgElement = document.createElement('img');
                imgElement.src = photoUrl;
                imgElement.alt = 'Изображение';
                imgElement.style.maxWidth = '500px';

                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = '';
                resultDiv.appendChild(imgElement);
            }
        });
    </script>
    <tr>

        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


    </tr>
    </table>

</body>

</html>