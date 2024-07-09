<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

$user = new User(Auth::userid());
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
                    <h1>Настройки профиля</h1>
                    <script src="/js/jquery.form.min.js"></script>
                    <script>
                        var bigPhoto = '';
                        var uploadPhoto, removePhoto;

                        $(document).ready(function() {
                            $('#form').ajaxForm({
                                url: '/api/profile/update',
                                dataType: 'text',
                                beforeSubmit: function() {
                                    $('#applied').hide();

                                    $('#errors').hide();
                                    $('#submitBtn').val('Отправка данных...').prop('disabled', true);

                                    uploadPhoto = ($('#userphoto_file').val() != '');
                                    removePhoto = $('#remove_userphoto').is(':checked');
                                },
                                success: function(data) {
                                    $('#submitBtn').val('Отредактировать профиль').prop('disabled', false);

                                    if (data == '' || data == 'refresh') {
                                        $('#applied').show();

                                        if (removePhoto) {
                                            bigPhoto = '';
                                            $('#userphoto_div').hide();
                                        } else
                                        if (uploadPhoto || bigPhoto != '') {
                                            bigPhoto = '/_update_temp/userphotos/' + 140 + '.jpg';
                                            $('#userphoto_img').attr('src', '/_update_temp/userphotos/' + 140 + '_s.jpg');
                                            $('#userphoto_div').show();
                                            $('#remove_userphoto').prop('checked', false);
                                            $('#userphoto_file').val('');
                                        }

                                        if (data == 'refresh') window.location.reload();
                                    } else $('#errors').html(data).show();
                                }
                            });


                            $('#userphotoLink').click(function(e) {
                                $('#userphoto_big_img').attr('src', bigPhoto);
                                $('#userphoto_big_div').css('top', (getBodyScrollTop() + 10) + 'px').show();
                                e.stopPropagation();
                                return false;
                            });


                            $(document).click(function(e) {
                                if ($(e.target).closest('#userphoto_big_div').length == 0)
                                    $('#userphoto_big_div').hide();
                            });
                        });


                        var errorElements = [];



                        function getBodyScrollTop() {
                            return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
                        }


                        function hideUserPhoto() {
                            $('#userphoto_big_div').hide();
                        }
                    </script>

                    <div id="userphoto_big_div" style="position:absolute; display:none; padding:10px; background-color:white; margin:auto; text-align:center; left:10px" class="p5 shadow"><a href="#" onclick="hideUserPhoto(); return false"><img alt="" src="" id="userphoto_big_img" border="0"></a><br><br><a href="#" onclick="hideUserPhoto(); return false">закрыть</a></div>

                    <p>Ссылка на публичный профиль: <b><a href="/author/<?= Auth::userid() ?>/" class="nw"><?= $user->i('username') ?></a></b></p>
                    <form method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block">
                        <input type="hidden" name="MAX_FILE_SIZE" value="215040">














                        <?php
                        function getSelectedCountryId()
                        {
                            $user = new User(Auth::userid());
                            $result = json_decode($user->i('content'), true)['aboutrid']['value'];
                            return $result;
                        }


                        $selectedCountryId = getSelectedCountryId();
                        $optionsHtml = '
                        <option value="0">(Без страны)</option>
                        <option value="24">Абхазия</option>
                        <option value="49">Австралия</option>
                        <option value="27">Австрия</option>
                        <option value="81">Австро-Венгрия</option>
                        <option value="31">Азербайджан</option>
                        <option value="70">Албания</option>
                        <option value="80">Алжир</option>
                        <option value="34">Аргентина</option>
                        <option value="25">Армения</option>
                        <option value="2">Беларусь</option>
                        <option value="53">Бельгия</option>
                        <option value="39">Болгария</option>
                        <option value="58">Босния и Герцеговина</option>
                        <option value="64">Бразилия</option>
                        <option value="47">Великобритания</option>
                        <option value="75">Венгерская народная республика</option>
                        <option value="43">Венгрия</option>
                        <option value="84">Вьетнам</option>
                        <option value="72">ГДР</option>
                        <option value="93">Гвинейская Республика</option>
                        <option value="15">Германия</option>
                        <option value="76">Германская империя</option>
                        <option value="71">Греция</option>
                        <option value="32">Грузия</option>
                        <option value="65">Дания</option>
                        <option value="97">Донецкая Народная Республика</option>
                        <option value="105">Европа (временно)</option>
                        <option value="91">Египет</option>
                        <option value="33">Израиль</option>
                        <option value="69">Индия</option>
                        <option value="90">Иордания</option>
                        <option value="82">Ирак</option>
                        <option value="68">Иран</option>
                        <option value="95">Ирландия</option>
                        <option value="54">Испания</option>
                        <option value="37">Италия</option>
                        <option value="85">КНДР</option>
                        <option value="3">Казахстан</option>
                        <option value="60">Канада</option>
                        <option value="61">Китай</option>
                        <option value="87">Косово</option>
                        <option value="66">Крым</option>
                        <option value="41">Куба</option>
                        <option value="12">Кыргызстан</option>
                        <option value="17">Латвия</option>
                        <option value="30">Ливия</option>
                        <option value="21">Литва</option>
                        <option value="98">Луганская Народная Республика</option>
                        <option value="51">Люксембург</option>
                        <option value="20">Молдова</option>
                        <option value="29">Монголия</option>
                        <option value="101">Намибия</option>
                        <option value="22">Нидерланды</option>
                        <option value="88">Новая Зеландия</option>
                        <option value="16">Норвегия</option>
                        <option value="89">Объединённые Арабские Эмираты</option>
                        <option value="104">Пакистан</option>
                        <option value="96">Панама</option>
                        <option value="100">Перу</option>
                        <option value="19">Польша</option>
                        <option value="55">Португалия</option>
                        <option value="67">Приднестровье</option>
                        <option value="79">Протекторат Богемии и Моравии</option>
                        <option value="102">РСФСР</option>
                        <option value="1">Россия</option>
                        <option value="ex_1">Российская Империя</option>
                        <option value="40">Румыния</option>
                        <option value="77">Румынская Народная Республика</option>
                        <option value="10">СССР</option>
                        <option value="38">США</option>
                        <option value="59">Северная Македония</option>
                        <option value="44">Сербия</option>
                        <option value="62">Сирия</option>
                        <option value="42">Словакия</option>
                        <option value="56">Словения</option>
                        <option value="78">Советская зона оккупации Герма</option>
                        <option value="36">Таджикистан</option>
                        <option value="63">Таиланд</option>
                        <option value="99">Тайвань</option>
                        <option value="86">Тунис</option>
                        <option value="35">Туркменистан</option>
                        <option value="52">Турция</option>
                        <option value="103">УССР</option>
                        <option value="28">Узбекистан</option>
                        <option value="4">Украина</option>
                        <option value="74">Уругвай</option>
                        <option value="14">Финляндия</option>
                        <option value="23">Франция</option>
                        <option value="57">Хорватия</option>
                        <option value="45">Черногория</option>
                        <option value="18">Чехия</option>
                        <option value="11">Чехословакия</option>
                        <option value="46">Швейцария</option>
                        <option value="50">Швеция</option>
                        <option value="83">Шри-Ланка</option>
                        <option value="13">Эстония</option>
                        <option value="94">Югославия</option>
                        <option value="92">Южная Корея</option>
                        <option value="48">Япония</option>
                        <option value="26">Прочее</option>
                        ';
                        function addSelectedAttribute($optionsHtml, $selectedValue)
                        {
                            return preg_replace_callback(
                                '/<option value="(\d+)"(.*?)>(.*?)<\/option>/',
                                function ($matches) use ($selectedValue) {
                                    $selected = ($matches[1] == $selectedValue) ? ' selected' : '';
                                    return '<option value="' . $matches[1] . '"' . $selected . $matches[2] . '>' . $matches[3] . '</option>';
                                },
                                $optionsHtml
                            );
                        }
                        ?>
                        <div class="p20" style="text-align:left; margin-bottom:15px">

                            <h4>Информация</h4>



                            <div style="margin-bottom:3px; margin-top:5px">Страна:</div>
                            <select name="aboutrid" style="width:100%">
                                <?= addSelectedAttribute($optionsHtml, $selectedCountryId) ?>
                            </select>
                            <div style="margin-bottom:3px; margin-top:5px">Откуда:</div>
                            <input type="text" name="aboutlive" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutlive']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Дата рождения</div>
                            <input type="text" name="aboutbirthday" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutbirthday']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Владение языками</div>
                            <input type="text" name="aboutlangs" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutlangs']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Пол</div>
                            <select name="sex" style="width:100%">
                                <option value="0">(не указан)</option>
                                <option value="1" selected="">мужской</option>
                                <option value="2">женский</option>
                            </select>
                        </div>




                        <div class="p20" style="text-align:left; margin-bottom:15px">

                            <h4>О себе</h4>

                            <div style="margin-bottom:15px">
                                <textarea name="aboutmemo" style="width:100%; height:200px"><?= json_decode($user->i('content'), true)['aboutmemo']['value'] ?></textarea>

                            </div>
                            <div style="margin-bottom:3px; margin-top:5px">Telegram</div>
                            <input type="text" name="abouttelegram" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['abouttelegram']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">ВКонтакте</div>
                            <input type="text" name="aboutvk" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutvk']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Twitter/X</div>
                            <input type="text" name="abouttwitter" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['abouttwitter']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">YouTube</div>
                            <input type="text" name="aboutyoutube" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutyoutube']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Почта</div>
                            <input type="text" name="aboutemail" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutemail']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Instagram</div>
                            <input type="text" name="aboutinstagram" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutinstagram']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">TransPhoto</div>
                            <input type="text" name="abouttransphoto" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['abouttransphoto']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Личный сайт</div>
                            <input type="text" name="aboutwebsite" id="live" style="width:100%; margin-bottom: 35px;" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutwebsite']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Любимые модели поездов</div>
                            <input type="text" name="aboutfavs_trains" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutfavs_trains']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Любимые страны</div>
                            <input type="text" name="aboutfavs_countries" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutfavs_countries']['value'] ?>">
                            <div style="margin-bottom:3px; margin-top:5px">Любимые города</div>
                            <input type="text" name="aboutfavs_cities" id="live" style="width:100%" maxlength="50" value="<?= json_decode($user->i('content'), true)['aboutfavs_cities']['value'] ?>">

                            <div style="margin-bottom:7px"><b>Фотография</b></div>
                            <div style="margin-bottom:15px">
                                <div id="userphoto_div" style="display:none">
                                    <a href="#" id="userphotoLink"><img src="" alt="" id="userphoto_img" class="f" style="width:auto; max-width:250px"></a>
                                    <div style="margin-top:5px; margin-bottom:7px" class="sm"><input type="checkbox" name="remove_userphoto" id="remove_userphoto"> <label for="remove_userphoto">удалить</label></div>
                                </div>
                                <div id="userphoto_file_span"><input type="file" name="userphoto" id="userphoto_file" accept="image/*"></div>
                                <div class="sm" style="margin-top:3px; color:#888">Для загрузки принимаются файлы JPEG объемом до 200 КБ и шириной не более 800 пикселей</div>
                            </div>

                            <div style="text-align:center; margin-top:25px">
                                <input type="submit" id="submitBtn" style="width:250px; height:30px; margin-bottom:5px" value="Отредактировать профиль">
                                <div><span style="color:red; font-weight:bold; display:none" id="errors"></span><span style="display:none; font-weight:bold; color:green" id="applied">✔&ensp;Изменения внесены</span></div>
                            </div>

                        </div>
                    </form>
                </center>
            </td>
        </tr>
        <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>


</body>

</html>