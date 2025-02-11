<?php

use \App\Services\{Auth, DB};
use \App\Models\User;

$user = new User(Auth::userid());
?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>

    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
            <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface"></script>
            <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
            <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
            <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
            <script src="https://cesium.com/downloads/cesiumjs/releases/1.83/Build/Cesium/Cesium.js"></script>
            <link href="https://cesium.com/downloads/cesiumjs/releases/1.83/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet-indoor/0.4.2/leaflet.indoor.min.js"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet-indoor/0.4.2/leaflet.indoor.min.css" />
            <!-- Подключение плагина Leaflet.markercluster -->
            <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.css">
            <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster/dist/MarkerCluster.Default.css">
            <script src="https://unpkg.com/leaflet.markercluster/dist/leaflet.markercluster.js"></script>
            <!-- Подключение плагина Leaflet-Geoman -->
            <link rel="stylesheet" href="https://unpkg.com/leaflet-geoman-free/dist/leaflet-geoman.css">
            <script src="https://unpkg.com/leaflet-geoman-free/dist/leaflet-geoman.min.js"></script>

            <!-- Подключение плагина Leaflet-3d-model -->
            <script src="https://unpkg.com/leaflet-3d-model/dist/leaflet-3d-model.min.js"></script>
            <script>
                var pub_pid = 0;
            </script>
            <td class="main">
            <?php if (NGALLERY['root']['registration']['emailverify'] != false || $user->i('status') === 3) {
                die('Чтобы публиковать Фотографии и Видео, нужно подтвердить почту.');
            } ?>
                <h1>Предложить медиа на публикацию</h1>
                <p>Ваш текущий индекс загрузки: <b><?= $user->i('uploadindex') ?></b></p>

                <div id="formtable">
                    <?php
                    if (NGALLERY['root']['photo']['upload']['premoderation'] === true) {
                        if ($user->content('premoderation') === "true") {
                            echo ' <div style="float:left; border:solid 1px #3b7dc1; padding:6px 10px 7px; margin-bottom:13px; background-color:#0199ff44"><b>Поздравляем, ' . $user->i('username') . '!</b><br>Администрацией ' . NGALLERY['root']['title'] . ' была одобрена возможность прямой загрузки фотографий для Вас.<br>Вы можете моментально загрузить любую фотографию, минуя премодерацию. Enjoy!</div>';
                        }
                    }
                    ?>



                    <div class="new_vehicle_template new_vehicle">
                        <input type="hidden" name="nv_cid[]" value="0">
                        <input type="hidden" name="nv_type[]" value="0">
                        <table>
                            <tbody class="tbody_nv_num" style="display:none">
                                <tr>
                                    <td class="lcol">Бортовой №:</td>
                                    <td><input type="text" name="nv_num[]" style="width:80px" maxlength="21" value=""></td>
                                </tr>
                            </tbody>
                            <tbody class="tbody_nv_gos" style="display:none">
                                <tr>
                                    <td class="lcol">Госномер:</td>
                                    <td><input type="text" name="nv_gos[]" style="width:120px" maxlength="21" value=""></td>
                                </tr>
                            </tbody>
                            <tbody class="tbody_nv_did" style="display:none">
                                <tr>
                                    <td class="lcol">Депо/Парк:</td>
                                    <td><select name="nv_did[]" class="did"></select></td>
                                </tr>
                            </tbody>
                            <tbody>
                                <tr>
                                    <td class="lcol">Модель:</td>
                                    <td>
                                        <input type="hidden" name="nv_mid[]" value="0">
                                        <input type="text" class="mname" style="width:250px; padding-left:3px" value="(модель неизвестна)">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Шасси:</td>
                                    <td>
                                        <input type="hidden" name="nv_chid[]" value="0">
                                        <input type="text" class="chname" style="width:250px; padding-left:3px" value="(нет)">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Назначение:</td>
                                    <td>
                                        <select name="nv_service[]" onchange="changeColor(this)">
                                            <option value="0" class="s0" selected>Пассажирский</option>
                                            <option value="1" class="s3">Служебный</option>
                                            <option value="2" class="s7">Музейный</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Текущее состояние:</td>
                                    <td class="sm">
                                        <select name="nv_state[]" onchange="changeColor(this)">
                                            <option value="1" class="s0" selected>Эксплуатируется</option>
                                            <option value="2" class="s2">Не был в эксплуатации в этом городе</option>
                                            <option value="3" class="s3">Не эксплуатируется</option>
                                            <option value="4" class="s4">Выведен из эксплуатации / ожидание исключения</option>
                                            <option value="5" class="s5">Списан</option>
                                            <option value="6" class="s6">Местонахождение и судьба неизвестны</option>
                                            <option value="7" class="s7">КВР/модернизация (смена модели)</option>
                                            <option value="8" class="s8">Перенумерован/передан в пределах города</option>
                                            <option value="9" class="s9">Передан в другой город</option>
                                            <option value="21" class="s21">Смена госномера (в пределах предприятия)</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">Состояние ТС <u>на сегодняшний день</u></span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Заводской №:</td>
                                    <td><input type="text" name="nv_zn[]" size="10" maxlength="12" value=""></td>
                                </tr>
                                <tr>
                                    <td class="lcol">VIN:</td>
                                    <td><input type="text" name="nv_vin[]" size="20" maxlength="17" value=""></td>
                                </tr>
                                <tr>
                                    <td class="lcol">№ шасси:</td>
                                    <td><input type="text" name="nv_cn[]" size="20" maxlength="17" value=""></td>
                                </tr>
                                <tr>
                                    <td class="lcol">Построен:</td>
                                    <td class="sm" style="padding-left:31px">
                                        <input type="text" name="nv_built_m[]" id="nv_built_m_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_built_y[]" id="nv_built_y_" style="font-weight:bold; width:50px; text-align:center; margin-right:-1px" maxlength="4" value="">&emsp;<select name="nv_built_approx_aprx[]" id="nv_built_approx_aprx_" class="approx-aprx" style="margin-right:-1px">
                                            <option value="0" class="s0" selected>точная дата</option>
                                            <option value="1" class="s3">приблизительно (&asymp;)</option>
                                            <option value="2" class="s7">не позднее (&le;)</option>
                                            <option value="3" class="s7">не ранее (&ge;)</option>
                                            <option value="4" class="s9">начало ... гг.</option>
                                            <option value="5" class="s9">середина ... гг.</option>
                                            <option value="6" class="s9">конец ... гг.</option>
                                            <option value="7" class="s9">... гг.</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">ММ.ГГГГ — дата постройки ТС по табличке/документам</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Актуально c...</td>
                                    <td class="sm">
                                        <input type="text" name="nv_start_d[]" id="nv_start_d_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_start_m[]" id="nv_start_m_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_start_y[]" id="nv_start_y_" style="font-weight:bold; width:50px; text-align:center; margin-right:-1px" maxlength="4" value="">&emsp;<select name="nv_start_approx_aprx[]" id="nv_start_approx_aprx_" class="approx-aprx" style="margin-right:-1px">
                                            <option value="0" class="s0" selected>точная дата</option>
                                            <option value="1" class="s3">приблизительно (&asymp;)</option>
                                            <option value="2" class="s7">не позднее (&le;)</option>
                                            <option value="3" class="s7">не ранее (&ge;)</option>
                                            <option value="4" class="s9">начало ... гг.</option>
                                            <option value="5" class="s9">середина ... гг.</option>
                                            <option value="6" class="s9">конец ... гг.</option>
                                            <option value="7" class="s9">... гг.</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">ДД.ММ.ГГГГ — дата поступления или присвоения номера</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Начало работы</td>
                                    <td class="sm">
                                        <input type="text" name="nv_launc_d[]" id="nv_launc_d_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_launc_m[]" id="nv_launc_m_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_launc_y[]" id="nv_launc_y_" style="font-weight:bold; width:50px; text-align:center; margin-right:-1px" maxlength="4" value="">&emsp;<select name="nv_launc_approx_aprx[]" id="nv_launc_approx_aprx_" class="approx-aprx" style="margin-right:-1px">
                                            <option value="0" class="s0" selected>точная дата</option>
                                            <option value="1" class="s3">приблизительно (&asymp;)</option>
                                            <option value="2" class="s7">не позднее (&le;)</option>
                                            <option value="3" class="s7">не ранее (&ge;)</option>
                                            <option value="4" class="s9">начало ... гг.</option>
                                            <option value="5" class="s9">середина ... гг.</option>
                                            <option value="6" class="s9">конец ... гг.</option>
                                            <option value="7" class="s9">... гг.</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">ДД.ММ.ГГГГ — первый выход c пассажирами, если известен</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Отставлен:</td>
                                    <td class="sm">
                                        <input type="text" name="nv_haltd_d[]" id="nv_haltd_d_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_haltd_m[]" id="nv_haltd_m_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_haltd_y[]" id="nv_haltd_y_" style="font-weight:bold; width:50px; text-align:center; margin-right:-1px" maxlength="4" value="">&emsp;<select name="nv_haltd_approx_aprx[]" id="nv_haltd_approx_aprx_" class="approx-aprx" style="margin-right:-1px">
                                            <option value="0" class="s0" selected>точная дата</option>
                                            <option value="1" class="s3">приблизительно (&asymp;)</option>
                                            <option value="2" class="s7">не позднее (&le;)</option>
                                            <option value="3" class="s7">не ранее (&ge;)</option>
                                            <option value="4" class="s9">начало ... гг.</option>
                                            <option value="5" class="s9">середина ... гг.</option>
                                            <option value="6" class="s9">конец ... гг.</option>
                                            <option value="7" class="s9">... гг.</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">ДД.ММ.ГГГГ — последний выход c пассажирами, если известен</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Ушёл (или списан):</td>
                                    <td class="sm">
                                        <input type="text" name="nv_leave_d[]" id="nv_leave_d_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_leave_m[]" id="nv_leave_m_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_leave_y[]" id="nv_leave_y_" style="font-weight:bold; width:50px; text-align:center; margin-right:-1px" maxlength="4" value="">&emsp;<select name="nv_leave_approx_aprx[]" id="nv_leave_approx_aprx_" class="approx-aprx" style="margin-right:-1px">
                                            <option value="0" class="s0" selected>точная дата</option>
                                            <option value="1" class="s3">приблизительно (&asymp;)</option>
                                            <option value="2" class="s7">не позднее (&le;)</option>
                                            <option value="3" class="s7">не ранее (&ge;)</option>
                                            <option value="4" class="s9">начало ... гг.</option>
                                            <option value="5" class="s9">середина ... гг.</option>
                                            <option value="6" class="s9">конец ... гг.</option>
                                            <option value="7" class="s9">... гг.</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">ДД.ММ.ГГГГ — дата продажи/списания/убытия</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Утилизирован:</td>
                                    <td class="sm" style="padding-left:31px">
                                        <input type="text" name="nv_scrap_m[]" id="nv_scrap_m_" style="font-weight:bold; width:30px; text-align:center; margin-right:-1px" maxlength="2" value=""><input type="text" name="nv_scrap_y[]" id="nv_scrap_y_" style="font-weight:bold; width:50px; text-align:center; margin-right:-1px" maxlength="4" value="">&emsp;<select name="nv_scrap_approx_aprx[]" id="nv_scrap_approx_aprx_" class="approx-aprx" style="margin-right:-1px">
                                            <option value="0" class="s0" selected>точная дата</option>
                                            <option value="1" class="s3">приблизительно (&asymp;)</option>
                                            <option value="2" class="s7">не позднее (&le;)</option>
                                            <option value="3" class="s7">не ранее (&ge;)</option>
                                            <option value="4" class="s9">начало ... гг.</option>
                                            <option value="5" class="s9">середина ... гг.</option>
                                            <option value="6" class="s9">конец ... гг.</option>
                                            <option value="7" class="s9">... гг.</option>
                                        </select> &nbsp; <span class="nw" style="color:#888">ММ.ГГГГ — фактическая дата полной порезки/разборки ТС</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">Примечание:</td>
                                    <td><input type="text" name="nv_note[]" maxlength="150" style="width:450px" value=""></td>
                                </tr>
                                <tr>
                                    <td class="lcol">Информация:</td>
                                    <td><textarea name="nv_history[]" rows="4" style="width:450px"></textarea></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <form id="mform" method="post" enctype="multipart/form-data" action="?action=write">
                        <input type="hidden" name="creative" id="creative" value="">
                        <input type="hidden" name="lat" id="markerLat" value="20971520">

                        <input type="hidden" name="lng" id="markerLng" id="creative" value="">


                        <table width="100%">
                            <col width="190">
                            <tbody class="p20">
                                <tr>
                                    <td colspan="2" id="step1" class="narrow" style="font-size:20px; padding:10px 15px 7px">
                                        Шаг 1. <b>Выберите фотографию или видео для загрузки и укажите дату съёмки:</b> </td>
                                </tr>
                                <tr>


                                    <td></td>
                                    <td style="padding:2px 15px 5px 2px">

                                        <label class="button">
                                            Выбрать файл... <input type="file" name="image" id="image" accept="image/*, video/*">
                                        </label>
                                        &nbsp; <span id="filename"></span>
                                        <div style="padding:5px 0 10px" class="sm">Принимаемые форматы:<br>
                                            JPG, JPEG, PNG, GIF, WEBP, MP4, AVI, 3GP, MKV<br>
                                            Для наибольшей совместимости, ваше видео будет обработано в формат MP4 в кодеке H264
                                        </div>

                                    </td>
                                </tr>


                                <tr id="tableFaces" style="display: none;">


                                    <td></td>
                                    <td style="padding:2px 15px 5px 2px">
                                        <div id="faceNotify">

                                        </div>


                                    </td>
                                </tr>


                                <tr id="tableFaces2" style="display: none;">


                                    <td></td>
                                    <td style="padding:2px 15px 5px 2px">
                                        <br>
                                        <div id="facesCanvas"></div>
                                        <br><br>
                                        <div id="inputFields"></div>



                                    </td>
                                </tr>

                               









                                <script>
                                    const imageUpload = document.getElementById('image');

                                    const inputFieldsContainer = document.getElementById('inputFields');

                                    let model;

                                    async function loadModel() {
                                        model = await blazeface.load();
                                        console.log("BlazeFace model loaded");
                                    }

                                    async function detectFaces(image) {
                                        const predictions = await model.estimateFaces(image, false);
                                        return predictions;
                                    }


                                    loadModel();

                                    imageUpload.addEventListener('change', async () => {

                                        const file = imageUpload.files[0];
                                        const img = new Image();
                                        img.src = URL.createObjectURL(file);
                                        img.onload = async () => {


                                            inputFieldsContainer.innerHTML = '';
                                            const predictions = await detectFaces(img);

                                            if (predictions.length > 0) {
                                                const facesTable = document.getElementById('tableFaces');
                                                const facesTable2 = document.getElementById('tableFaces2');
                                                if (facesTable) {
                                                    facesTable.removeAttribute('style');
                                                }
                                                if (facesTable2) {
                                                    facesTable2.removeAttribute('style');
                                                }

                                                $('#faceNotify').html(' <div style="float:left; border:solid 1px #8C4800; padding:6px 10px 7px; margin-bottom:13px; background-color:#FADD90"><b>Обнаружены лица на фотографии</b><br>Будьте внимательны, фотография будет отклонена, если: <br>· Она нацелена на травлю, буллинг<br>· Ведёт в заблуждение пользователей<br>· Содержит в себе оскорбления<br><br><b>В случае намеренной публикации фотографий, нарушающих правила портала,<br> администрация оставляет за собой право в выдачи ограничений<br> вплоть до полной блокировки аккаунта. Спасибо за понимание</b></div>');
                                                $('#facesCanvas').html('<canvas style="width: 500px;" id="canvas"></canvas>');
                                                const canvas = document.getElementById('canvas');
                                                const ctx = canvas.getContext('2d');
                                                canvas.width = img.width;
                                                canvas.height = img.height;
                                                ctx.drawImage(img, 0, 0);
                                                predictions.forEach((prediction, index) => {
                                                    const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight).flat();

                                                    ctx.beginPath();
                                                    ctx.rect(x, y, width - x, height - y);
                                                    ctx.lineWidth = 3;
                                                    ctx.strokeStyle = 'white';
                                                    ctx.stroke();

                                                    ctx.fillStyle = 'white';
                                                    ctx.font = '16px Arial';
                                                    ctx.fillText(`Лицо ${index + 1}`, x, y > 10 ? y - 10 : 10);
                                                    const inputField = document.createElement('input');
                                                    inputField.type = 'text';
                                                    inputField.name = `facename_${index + 1}`; // Добавляем динамический name
                                                    inputField.placeholder = `Имя участника №${index + 1}`;
                                                    inputFieldsContainer.appendChild(inputField);
                                                    inputFieldsContainer.appendChild(document.createElement('br'));
                                                });
                                            } else {
                                                $('#faceNotify').html('');
                                                $('#facesCanvas').html('');
                                            }
                                        };
                                    });
                                </script>
                                <tr>
                                    <td class="lcol">Дата съёмки:</td>
                                    <td style="padding-bottom:12px">
                                        <span style="display:inline-block; margin-bottom:3px"><select name="day" id="day" style="width:48px">
                                                <option value="0" selected>??</option>
                                                <option value="1">01</option>
                                                <option value="2">02</option>
                                                <option value="3">03</option>
                                                <option value="4">04</option>
                                                <option value="5">05</option>
                                                <option value="6">06</option>
                                                <option value="7">07</option>
                                                <option value="8">08</option>
                                                <option value="9">09</option>
                                                <option value="10">10</option>
                                                <option value="11">11</option>
                                                <option value="12">12</option>
                                                <option value="13">13</option>
                                                <option value="14">14</option>
                                                <option value="15">15</option>
                                                <option value="16">16</option>
                                                <option value="17">17</option>
                                                <option value="18">18</option>
                                                <option value="19">19</option>
                                                <option value="20">20</option>
                                                <option value="21">21</option>
                                                <option value="22">22</option>
                                                <option value="23">23</option>
                                                <option value="24">24</option>
                                                <option value="25">25</option>
                                                <option value="26">26</option>
                                                <option value="27">27</option>
                                                <option value="28">28</option>
                                                <option value="29">29</option>
                                                <option value="30">30</option>
                                                <option value="31">31</option>
                                            </select><select name="month" id="month" style="width:160px; margin:0 -1px">
                                                <option value="0" selected>?? &mdash; Неизвестно</option>
                                                <option value="1">01 &mdash; Январь</option>
                                                <option value="2">02 &mdash; Февраль</option>
                                                <option value="3">03 &mdash; Март</option>
                                                <option value="4">04 &mdash; Апрель</option>
                                                <option value="5">05 &mdash; Май</option>
                                                <option value="6">06 &mdash; Июнь</option>
                                                <option value="7">07 &mdash; Июль</option>
                                                <option value="8">08 &mdash; Август</option>
                                                <option value="9">09 &mdash; Сентябрь</option>
                                                <option value="10">10 &mdash; Октябрь</option>
                                                <option value="11">11 &mdash; Ноябрь</option>
                                                <option value="12">12 &mdash; Декабрь</option>
                                            </select><select name="year" id="year" style="width:65px">
                                                <option value="0" selected>????</option>
                                                <option value="2024">2024</option>
                                                <option value="2023">2023</option>
                                                <option value="2022">2022</option>
                                                <option value="2021">2021</option>
                                                <option value="2020">2020</option>
                                                <option value="2019">2019</option>
                                                <option value="2018">2018</option>
                                                <option value="2017">2017</option>
                                                <option value="2016">2016</option>
                                                <option value="2015">2015</option>
                                                <option value="2014">2014</option>
                                                <option value="2013">2013</option>
                                                <option value="2012">2012</option>
                                                <option value="2011">2011</option>
                                                <option value="2010">2010</option>
                                                <option value="2009">2009</option>
                                                <option value="2008">2008</option>
                                                <option value="2007">2007</option>
                                                <option value="2006">2006</option>
                                                <option value="2005">2005</option>
                                                <option value="2004">2004</option>
                                                <option value="2003">2003</option>
                                                <option value="2002">2002</option>
                                                <option value="2001">2001</option>
                                                <option value="2000">2000</option>
                                                <option value="1999">1999</option>
                                                <option value="1998">1998</option>
                                                <option value="1997">1997</option>
                                                <option value="1996">1996</option>
                                                <option value="1995">1995</option>
                                                <option value="1994">1994</option>
                                                <option value="1993">1993</option>
                                                <option value="1992">1992</option>
                                                <option value="1991">1991</option>
                                                <option value="1990">1990</option>
                                                <option value="1989">1989</option>
                                                <option value="1988">1988</option>
                                                <option value="1987">1987</option>
                                                <option value="1986">1986</option>
                                                <option value="1985">1985</option>
                                                <option value="1984">1984</option>
                                                <option value="1983">1983</option>
                                                <option value="1982">1982</option>
                                                <option value="1981">1981</option>
                                                <option value="1980">1980</option>
                                                <option value="1979">1979</option>
                                                <option value="1978">1978</option>
                                                <option value="1977">1977</option>
                                                <option value="1976">1976</option>
                                                <option value="1975">1975</option>
                                                <option value="1974">1974</option>
                                                <option value="1973">1973</option>
                                                <option value="1972">1972</option>
                                                <option value="1971">1971</option>
                                                <option value="1970">1970</option>
                                                <option value="1969">1969</option>
                                                <option value="1968">1968</option>
                                                <option value="1967">1967</option>
                                                <option value="1966">1966</option>
                                                <option value="1965">1965</option>
                                                <option value="1964">1964</option>
                                                <option value="1963">1963</option>
                                                <option value="1962">1962</option>
                                                <option value="1961">1961</option>
                                                <option value="1960">1960</option>
                                                <option value="1959">1959</option>
                                                <option value="1958">1958</option>
                                                <option value="1957">1957</option>
                                                <option value="1956">1956</option>
                                                <option value="1955">1955</option>
                                                <option value="1954">1954</option>
                                                <option value="1953">1953</option>
                                                <option value="1952">1952</option>
                                                <option value="1951">1951</option>
                                                <option value="1950">1950</option>
                                                <option value="1949">1949</option>
                                                <option value="1948">1948</option>
                                                <option value="1947">1947</option>
                                                <option value="1946">1946</option>
                                                <option value="1945">1945</option>
                                                <option value="1944">1944</option>
                                                <option value="1943">1943</option>
                                                <option value="1942">1942</option>
                                                <option value="1941">1941</option>
                                                <option value="1940">1940</option>
                                                <option value="1939">1939</option>
                                                <option value="1938">1938</option>
                                                <option value="1937">1937</option>
                                                <option value="1936">1936</option>
                                                <option value="1935">1935</option>
                                                <option value="1934">1934</option>
                                                <option value="1933">1933</option>
                                                <option value="1932">1932</option>
                                                <option value="1931">1931</option>
                                                <option value="1930">1930</option>
                                                <option value="1929">1929</option>
                                                <option value="1928">1928</option>
                                                <option value="1927">1927</option>
                                                <option value="1926">1926</option>
                                                <option value="1925">1925</option>
                                                <option value="1924">1924</option>
                                                <option value="1923">1923</option>
                                                <option value="1922">1922</option>
                                                <option value="1921">1921</option>
                                                <option value="1920">1920</option>
                                                <option value="1919">1919</option>
                                                <option value="1918">1918</option>
                                                <option value="1917">1917</option>
                                                <option value="1916">1916</option>
                                                <option value="1915">1915</option>
                                                <option value="1914">1914</option>
                                                <option value="1913">1913</option>
                                                <option value="1912">1912</option>
                                                <option value="1911">1911</option>
                                                <option value="1910">1910</option>
                                                <option value="1909">1909</option>
                                                <option value="1908">1908</option>
                                                <option value="1907">1907</option>
                                                <option value="1906">1906</option>
                                                <option value="1905">1905</option>
                                                <option value="1904">1904</option>
                                                <option value="1903">1903</option>
                                                <option value="1902">1902</option>
                                                <option value="1901">1901</option>
                                                <option value="1900">1900</option>
                                                <option value="1899">1899</option>
                                                <option value="1898">1898</option>
                                                <option value="1897">1897</option>
                                                <option value="1896">1896</option>
                                                <option value="1895">1895</option>
                                                <option value="1894">1894</option>
                                                <option value="1893">1893</option>
                                                <option value="1892">1892</option>
                                                <option value="1891">1891</option>
                                                <option value="1890">1890</option>
                                                <option value="1889">1889</option>
                                                <option value="1888">1888</option>
                                                <option value="1887">1887</option>
                                                <option value="1886">1886</option>
                                                <option value="1885">1885</option>
                                                <option value="1884">1884</option>
                                                <option value="1883">1883</option>
                                                <option value="1882">1882</option>
                                                <option value="1881">1881</option>
                                                <option value="1880">1880</option>
                                                <option value="1879">1879</option>
                                                <option value="1878">1878</option>
                                                <option value="1877">1877</option>
                                                <option value="1876">1876</option>
                                                <option value="1875">1875</option>
                                                <option value="1874">1874</option>
                                                <option value="1873">1873</option>
                                                <option value="1872">1872</option>
                                                <option value="1871">1871</option>
                                                <option value="1870">1870</option>
                                                <option value="1869">1869</option>
                                                <option value="1868">1868</option>
                                                <option value="1867">1867</option>
                                                <option value="1866">1866</option>
                                                <option value="1865">1865</option>
                                                <option value="1864">1864</option>
                                                <option value="1863">1863</option>
                                                <option value="1862">1862</option>
                                                <option value="1861">1861</option>
                                                <option value="1860">1860</option>
                                                <option value="1859">1859</option>
                                                <option value="1858">1858</option>
                                                <option value="1857">1857</option>
                                                <option value="1856">1856</option>
                                                <option value="1855">1855</option>
                                                <option value="1854">1854</option>
                                                <option value="1853">1853</option>
                                                <option value="1852">1852</option>
                                                <option value="1851">1851</option>
                                                <option value="1850">1850</option>
                                            </select>&nbsp; </span>&nbsp; <span id="dateLoaded" style="position:relative; top:2px; padding:2px 6px; display:none" class="nw label-green">Установлена дата из EXIF</span><span id="dateAbsent" style="position:relative; top:2px; padding:2px 6px; display:none" class="nw label-orange">Укажите дату съёмки (нет в EXIF)</span>&nbsp; <span class="sm nw"><a href="#" class="dot" onclick="setDate(<?= (new DateTime())->format('d,m,Y'); ?>); return false">Сегодня</a> &middot; <a href="#" class="dot" onclick="setDate(<?= (new DateTime('yesterday'))->format('d,m,Y'); ?>); return false">Вчера</a> &middot; <a href="#" class="dot" onclick="setDate(0,0,0); return false">Неизвестно</a></span>
                                    </td>
                                </tr>
                                <tr class="lnk-gallery">
                                    <td class="lcol">Галерея:</td>
                                    <td style="padding-right:15px">
                                        <select name="gallery" id="search_gid">
                                            <option value="0">Общая</option>
                                            <?php
                                            $galleries = DB::query('SELECT * FROM galleries');
                                            foreach ($galleries as $g) {
                                                echo '<option value="' . $g['id'] . '">' . $g['title'] . '</option>';
                                            }
                                            ?>
                                        </select>
                                    </td>
                                </tr>
                                <tr class="lnk-gallery" style="display:none">
                                    <td></td>
                                    <td style="padding-right:15px"><input type="button" id="addGalleryBtn" value="Добавить"></td>
                                </tr><br>
                            </tbody>

                            <tbody>
                                <tr>
                                    <td colspan="2" style="height:10px"></td>
                                </tr>
                            </tbody>


                            <tbody class="p20">
                                <tr>
                                    <td colspan="2" id="step2" class="narrow" style="font-size:20px; padding:10px 15px 5px">Шаг 2. <b>Укажите объект, присутствующие на медиа</b></td>
                                </tr>

                                <tr class="lnk-vehicle">
                                    <td class="lcol">Вид сущности:</td>
                                    <td style="padding-right:15px"><select name="search_type" id="search_type" class="s5">
                                            <?php
                                            $entities = DB::query('SELECT * FROM entities');
                                            foreach ($entities as $e) {
                                                echo ' <option value="' . $e['id'] . '" style="background-color: ' . $e['color'] . '">' . $e['title'] . '</option>';
                                            }
                                            ?>
                                        </select></td>
                                </tr>
                                <tr class="lnk-vehicle">
                                    <td class="lcol">ID/Название модели:</td>
                                    <td style="padding-right:15px">
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td style="padding:0; vertical-align:middle">
                                                        <input type="text" name="search_num" id="search_num" maxlength="15" style="width:150px; height:22px" onfocus="showHint('num')" onblur="hideHint('num')"><input type="button" id="searchVehiclesByNumBtn" class="searchVehiclesBtn" style="height:22px; padding-top:0; position:relative; left:-1px" onclick="searchVehicles(0)" value="Найти в БД">
                                                    </td>
                                                    <td style="padding:0; position:relative; vertical-align:top">
                                                        <div style="border: 1px dashed rgb(255, 151, 151); color: red; background-color: rgb(255, 255, 153); padding: 2px 4px 3px; margin: 0px 5px; white-space: nowrap; position: absolute; display: none;" id="num_hint"><small>Введите название модели, или её уникальный ID на сервере <?= NGALLERY['root']['title'] ?>.</small></div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div style="position:relative; z-index:2000; padding-top:4px"><div id="vlist" class="shadow"></div></div>
                                    </td>
                                </tr>
                                <tr>
		<td style="padding-top:15px; width:200px" class="lcol">Привязка:</td>
		<td style="width:90%; padding:13px 15px 8px 2px">
			<div id="views-selector" style="position:absolute; z-index:2000; padding:7px; display:none" class="p20 shadow">
				<table id="views">
	<tbody><tr>
		<td colspan="3" style="text-align:center"><input type="checkbox" name="view_top" value="20" id="v20"> <label for="v20">Вид сверху</label></td>
		<td></td>
	</tr>
	<tr>
		<td><input type="radio" name="view_s" value="4" title="Сзади-слева (окна)" class="views-radio-single" style="position:relative; top:7px; left:7px"></td>
		<td style="text-align:center">
			<input type="radio" name="view_s" value="8" title="Левый борт" class="views-radio-single">
		</td>
		<td><input type="radio" name="view_s" value="2" title="Спереди-слева (окна)" style="position:relative; top:7px; left:-7px"></td>
		<td style="padding:0 35px; line-height:23px" rowspan="3">
            <div><input type="radio" name="view_s" value="12" id="v12"> <label for="v12">Заводская табличка</label></div>
            <div><input type="radio" name="view_s" value="13" id="v13"> <label for="v13">Отдельные элементы ТС</label></div>
            <div class="twoside-old"><input type="radio" name="view_s" value="14" id="v14"> <label for="v14">Не определяется (двухстороннее ТС)</label></div>
			<div><input type="radio" name="view_s" value="0" id="v0"> <label for="v0"><span class="s5">&nbsp;Не указан&nbsp;</span></label></div>
			            <div class="sm" style="margin-top:15px"><a href="#" class="views-toggle-link dot">Переключить на: <span class="twoside-single">Одностороннее ТС</span><span class="twoside-twoside">Двухстороннее ТС</span></a></div>
		</td>
	</tr>
	<tr>
		<td style="padding:0 2px"><input type="radio" name="view_s" value="7" title="Вид строго сзади" class="views-radio-single"></td>
		<td class="views-image">
			<table style="width:138px; height:82px">
				<tbody><tr>
					<td style="text-align:left; padding-left:25px">
						<input type="radio" name="view_s" value="9" title="Салон, вид вперёд">
					</td>
					<td style="text-align:right; padding:0">
						<input type="radio" name="view_s" value="10" title="Салон, вид назад" class="views-radio-single">
						<input type="radio" name="view_s" value="11" title="Кабина" style="position:relative; top:-7px">
					</td>
				</tr>
			</tbody></table>
		</td>
		<td style="padding:0 2px"><input type="radio" name="view_s" value="5" title="Вид строго спереди"></td>
	</tr>
	<tr>
		<td><input type="radio" name="view_s" value="3" title="Сзади-справа (двери)" class="views-radio-single" style="position:relative; top:-7px; left:7px"></td>
		<td style="text-align:center">
			<input type="radio" name="view_s" value="6" title="Правый борт">
		</td>
		<td><input type="radio" name="view_s" value="1" title="Спереди-справа (двери)" style="position:relative; top:-7px; left:-7px"></td>
	</tr>
	<tr>
		<td colspan="3" style="text-align:center"><input type="checkbox" name="view_bottom" value="40" id="v40"> <label for="v40">Вид снизу</label></td>
		<td></td>
	</tr>
</tbody></table>
<script>

function openViewSelector(val, el, twoside)
{
    var selector = $('#views-selector');

    var view = val % 20;
    var modifier = val - view;

    $('input[value="' + view + '"]', selector).prop('checked', true);
    $('#v20').prop('checked', modifier == 20);
    $('#v40').prop('checked', modifier == 40);

    if (view != 14)
    {
        selector.attr('data-twoside', twoside);
        $('.twoside-old').hide();
    }
    else
    {
        selector.attr('data-twoside', 1);
        $('.twoside-old').show();
    }


    var p = el.offset();
    selector.css('left', p.left + 'px').css('top', (p.top + el.height() + 3) + 'px').show();
}


function setViewSelectorCallback(func)
{
    var selector = $('#views-selector');

    $('input[type="radio"]', selector).on('click', function(e)
    {
        var view = parseInt($('input[type="radio"]:checked', selector).val());
        var modifier = parseInt($('input[type="checkbox"]:checked', selector).val());
        if (isNaN(modifier)) modifier = 0;

        var label = view || !modifier ? views[view] : '';
        if (label != '' && modifier) label += ' + ';
        if (modifier) label += views[modifier];

        func(e, view, modifier, label);

        selector.hide();
    });

    $('input[type="checkbox"]', selector).on('click', function()
   	{
   		if ($(this).is('#v20:checked')) $('#v40').prop('checked', false); else
   		if ($(this).is('#v40:checked')) $('#v20').prop('checked', false);
   	});
}


$(document).ready(function()
{
	$('.views-toggle-link').on('click', function()
	{
	    var selector = $('#views-selector');
	    var twoside = selector.attr('data-twoside');

	    selector.attr('data-twoside', twoside == 1 ? 0 : 1);
		return false;
	});
});

</script>
			</div>
			<div class="no-links" style="padding-top:2px; margin-bottom:7px"><i>Фотография ни к чему не привязана.</i></div>
			<div id="links">
				<table id="conn_veh" style="margin-bottom:7px; display:none">
									</table>
				<table id="conn_gid" style="margin-bottom:7px; display:none">
									</table>
			</div>
		</td>
	</tr>




                                <tr>
                                    <td></td>
                                    <td class="sm" style="padding:14px 15px 21px 2px; color:#888">Совет: модель сущности не обязательно привязывать, если она не учавствует в главном лице Фотографии или Видео.</td>
                                </tr>
                            </tbody>
                            <tbody>
                                <tr>
                                    <td colspan="2" style="height:10px"></td>
                                </tr>
                            </tbody>

                            <tbody class="p20">
                                <tr>
                                    <td colspan="2" id="step3" class="narrow" style="font-size:20px; padding:10px 15px 7px">Шаг 3. <b>Введите подпись для медиафайла:</b></td>
                                </tr>
                                <tr>
                                    <td class="lcol">Место съёмки:</td>
                                    <td style="padding-right:15px">
                                        <table width="100%">
                                            <tr>
                                                <td style="padding:0; vertical-align:middle">
                                                    <input type="text" name="place" id="place" maxlength="255" style="width:506px" onfocus="showHint('place')" onblur="hideHint('place')" value="">
                                                </td>
                                                <td style="padding:0; position:relative; vertical-align:top" width="100%">
                                                    <div style="border:1px dashed #FF9797; color:red; background-color:#ffff99; padding:2px 4px 3px; margin:0 5px; display:none; position:absolute" id="place_hint"><small><strong>Без сокращений</strong> (кроме <strong>«к/ст»</strong>, <strong>«л/ст»</strong>).<br />Если указана улица, <strong>остановку</strong> пишем в примечании (не обязательно).<br /><strong>В кавычках:</strong> названия к/ст, колец, остановок, станций метро.<br /><strong>Без кавычек:</strong> ж/д платформы и станции.<br />Если на фото <strong>салон</strong>, место можно не указывать.</small></div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="lcol">
                                        Описание:
                                        <div class="sm" style="color:#999; margin:3px 5px 0 0; white-space:normal">(если требуются)</div>
                                    </td>
                                    <td style="padding-right:15px">
                                        <table>
                                            <tr>
                                                <td style="padding:0; vertical-align:middle"><textarea name="descr" onfocus="showHint('descr')" onblur="hideHint('descr')" style="width:506px; height:100px; margin-bottom:7px"></textarea></td>
                                                <td style="padding:0; position:relative; vertical-align:top" width="100%">
                                                    <div style="border:1px dashed #FF9797; color:red; background-color:#ffff99; padding:2px 4px 3px; margin:0 5px; display:none; position:absolute" id="descr_hint"><small>Текстовое описание изображения в произвольной форме:<br>пояснения, дополнения и т. п., если необходимы..</small></div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td colspan="2" style="height:7px"></td>
                                <tr>
                            </tbody>

                            <tbody>
                                <tr>
                                    <td colspan="2" style="height:10px"></td>
                                </tr>
                            </tbody>



                            <tbody>
                                <tr>
                                    <td colspan="2" style="height:10px"></td>
                                </tr>
                            </tbody>

                            <tbody class="p20">
                                <tr>
                                    <td colspan="2" id="step4" class="narrow" style="font-size:20px; padding:10px 15px 0">Шаг 4. <b>Отметьте точку, с которой было сделано медиа на карте:</b></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td style="padding:7px 2px">
                                        <input type="checkbox" name="nomap" id="nomap" value="1" onclick="switchMap()"> <label for="nomap">Не указывать координаты</label>
                                    </td>
                                </tr>
                                <tr class="upl-map">
                                    <td class="lcol">Точка съёмки:</td>
                                    <td>
                                        <div id="map_frame" class="s11 p20" style="display:inline-block; padding:3px">
                                            <div id="map_canvas" style="width:600px; height:300px; overflow:hidden"></div>
                                            <div>
                                                <label for="mapSelector">Выберите карту:</label>
                                                <select id="mapSelector">
                                                    <option value="osm">OpenStreetMap</option>
                                                    <option value="hot">Humanitarian OpenStreetMap Team</option>
                                                    <option value="opnv">OPNVKarte</option>
                                                    <option value="2gis">2ГИС (только Россия)</option>
                                                    <option value="google">Google Maps</option>
                                                </select>
                                                <div>
                                                    <label for="railwayCheckbox">Железная дорога от OpenRailwayMap:</label>
                                                    <input type="checkbox" id="railwayCheckbox">
                                                </div>

                                            </div>
                                        </div>
                                    </td>
                                </tr>


                            </tbody>


        </tr>
        <tr>
            <td colspan="2" style="height:7px"></td>
        </tr>
        <tr>

        </tr>
        </tbody>
        <script>
            var map = L.map('map_canvas').setView([55.7558, 37.6176], 13);
            var marker;
            var geocoder;

            // Инициализация базовых слоев Leaflet.js
            var baseLayers = {
                "osm": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }),
                "hot": L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                    maxZoom: 19
                }),
                "opnv": L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: 'Map data &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>'
                }),
                "2gis": L.tileLayer('https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1', {
                    maxZoom: 19,
                    attribution: '&copy; 2GIS'
                }),
                "yandex": L.tileLayer('https://vec0{s}.maps.yandex.net/tiles?l=map&v=4.53.2&z={z}&x={x}&y={y}&scale=1&lang=ru_RU', {
                    subdomains: ['01', '02', '03', '04'],
                    maxZoom: 19
                }),
                "yandex-satellite": L.tileLayer('https://sat0{s}.maps.yandex.net/tiles?l=sat&v=3.827.0&z={z}&x={x}&y={y}&scale=1&lang=ru_RU', {
                    subdomains: ['01', '02', '03', '04'],
                    maxZoom: 19
                }),
                "google": L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                    maxZoom: 19,
                    attribution: '&copy; Google Maps'
                }),
                "openrailway": L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; OpenRailwayMap'
                })
            };

            document.getElementById('railwayCheckbox').addEventListener('change', function() {
                if (this.checked) {
                    baseLayers["openrailway"].addTo(map);
                } else {
                    map.removeLayer(baseLayers["openrailway"]);
                }
            });
            // Инициализация карты Leaflet.js с выбранным базовым слоем по умолчанию
            baseLayers["osm"].addTo(map);

            // Добавляем элемент управления выбора карты
            document.getElementById('mapSelector').addEventListener('change', function() {
                var selectedLayer = this.value;

                // Удаляем текущий слой карты Leaflet.js
                map.eachLayer(function(layer) {
                    map.removeLayer(layer);
                });

                // Добавляем выбранный слой карты Leaflet.js
                baseLayers[selectedLayer].addTo(map);

                // Добавляем разметку внутри зданий для выбранных карт
                if (selectedLayer === "osm" || selectedLayer === "hot" || selectedLayer === "opnv") {
                    addIndoorLayer(selectedLayer);
                } else {
                    // Очищаем слой indoor, если выбран другой тип карты
                    clearIndoorLayer();
                }
            });

            // Функция добавления слоя разметки внутри зданий (Indoor)
            function addIndoorLayer(selectedLayer) {
                // Очищаем предыдущий indoor слой, если он был добавлен
                clearIndoorLayer();

                // Пример добавления indoor слоя с использованием Leaflet Indoor.js
                // Ваш код для загрузки и отображения indoor карты
                // Ниже приведён пример заглушки

                // Создаём новый indoor слой
                map.indoorLayer = new L.Indoor();

                // Добавляем его на карту
                map.indoorLayer.addTo(map);

                // Загрузка и отображение indoor карты с помощью Indoor.js
                // Пример заглушки: добавление одного здания с этажами и метками
                var building = {
                    name: "Пример здания",
                    floors: [{
                        level: 0,
                        plan: {
                            imageUrl: "path/to/indoor/plan.png", // URL изображения плана здания
                            width: 800, // Ширина изображения в пикселях
                            height: 600 // Высота изображения в пикселях
                        },
                        markers: [{
                            latLng: [51.505, -0.09], // Координаты метки на плане
                            label: "Метка на плане"
                        }]
                    }]
                };

                // Добавляем здание на indoor слой
                map.indoorLayer.addLevel(building);

                // Пример настройки интерактивности для меток
                building.floors.forEach(function(floor) {
                    floor.markers.forEach(function(marker) {
                        var markerIcon = L.divIcon({
                            className: 'indoor-marker',
                            html: marker.label
                        });
                        L.marker(marker.latLng, {
                            icon: markerIcon
                        }).addTo(map.indoorLayer.getLevel(floor.level));
                    });
                });
            }

            // Функция очистки indoor слоя
            function clearIndoorLayer() {
                if (map.indoorLayer) {
                    map.removeLayer(map.indoorLayer);
                    delete map.indoorLayer;
                }
            }

            // Добавляем обработчик клика на карту Leaflet.js
            map.on('click', function(e) {
                if (marker) {
                    map.removeLayer(marker);
                }

                marker = L.marker(e.latlng).addTo(map);
                document.getElementById('markerLat').value = e.latlng.lat;
                document.getElementById('markerLng').value = e.latlng.lng;
            });

            // Инициализация поискового элемента управления Leaflet.js
            geocoder = L.Control.geocoder({
                defaultMarkGeocode: false
            }).on('markgeocode', function(e) {
                var latlng = e.geocode.center;

                if (marker) {
                    map.removeLayer(marker);
                }

                marker = L.marker(latlng).addTo(map);
                map.setView(latlng, 13);

                document.getElementById('markerLat').value = latlng.lat;
                document.getElementById('markerLng').value = latlng.lng;

                var bbox = e.geocode.bbox;
                if (bbox.isValid()) {
                    var poly = L.polygon([
                        bbox.getSouthEast(),
                        bbox.getNorthEast(),
                        bbox.getNorthWest(),
                        bbox.getSouthWest()
                    ]).addTo(map);
                    map.fitBounds(poly.getBounds());
                }
            }).addTo(map);
        </script>
        <tbody class="p20">
            <tr>
                <td colspan="2" class="narrow" style="font-size:20px; padding:10px 15px 5px">Шаг 5. <b>Выберите опции загрузки:</b></td>
            </tr>
            <tr>




            </tr>

            <tr>



                <td class="lcol">Лицензия:</td>
                <td style="padding-bottom:7px">
                    <select name="license">
                        <option value="0">Не указана</option>
                        <option value="1" selected>Copyright &copy;</option>
                        <option value="2">Атрибуция (BY)</option>
                        <option value="3">Атрибуция — С сохранением условий (BY-SA)</option>
                        <option value="4">Атрибуция — Некоммерческое использование (BY-NC)</option>
                        <option value="5">Атрибуция — Некоммерческое использование — С сохранением условий (BY-NC-SA)</option>
                        <option value="6">Атрибуция — Без производных работ (BY-ND)</option>
                        <option value="7">Атрибуция — Некоммерческое использование — Без производных работ (BY-NC-ND)</option>
                        <option value="8">Передача в общественное достояние (Zero)</option>
                        <option value="9">Нет авторских прав (Mark)</option>
                    </select> &nbsp; &nbsp;<a href="https://creativecommons.org/licenses/?lang=ru" target="_blank" class="und sm">Информация о лицензиях</a>
                </td><br>

            </tr>
            <tr>
                <td class="lcol"></td>
                <td style="padding:7px 2px">
                    <input type="checkbox" name="disablecomments" id="disablecomments" value="1"> <label for="disablecomments">Отключить комментарии</label>
                </td>

            </tr>
            <tr>
                <td class="lcol"></td>
                <td class="sm" style="color:#888">Комментирование Вашего медиа будет ограничено, однако Вы сможете добавлять к нему свои аннотации вне зависимости от настройки.</td>

            </tr>

            <tr>
                <td class="lcol"></td>
                <td style="padding:7px 2px">
                    <input type="checkbox" name="disablerating" id="disablerating" value="1"> <label for="disablerating">Отключить оценку фотографии</label>

                </td>
            </tr>
            <tr>
                <td class="lcol"></td>
                <td class="sm" style="color:#888">Никто не сможет оценивать Ваше медиа, однако оно не сможет продвинуться в конкурс.</td>

            </tr>
            <tr>
                <td class="lcol"></td>
                <td style="padding:7px 2px">
                    <input type="checkbox" name="disableshowtop" id="disableshowtop" value="1"> <label for="disableshowtop">Не продвигать в общем топе</label>

                </td>
            </tr>
            <tr>
                <td class="lcol"></td>
                <td class="sm" style="color:#888">Медиа не будет отображаться в следующих топах: <br>Самые популярные за 24 часа<br>30 самых просматриваемых фото за 24 часа<br>Случайные фотографии<br>Лента фотография</td>

            </tr>
            <tr>
                <td class="lcol"></td>
                <td style="padding:7px 2px">
                    <input type="checkbox" name="disableexif" id="disableexif" value="1"> <label for="disableexif">Скрыть EXIF</label>
                </td>
            </tr>
            <tr>
                <td class="lcol"></td>
                <td class="sm" style="color:#888">EXIF (параметры съёмки) фотографии будет скрыт на странице.</td>

            </tr>
            <tr>
                <td class="lcol"></td>
                <td style="padding:7px 2px">
                    <input type="checkbox" name="disablesubsnotify" id="disablesubsnotify" value="1"> <label for="disablesubsnotify">Не уведомлять подписчиков о новом медиа</label>
                </td>
            </tr>

            <tr>
                <td class="lcol"></td>
                <td class="sm" style="color:#888">Ваши подписчики не получат уведомление о публикации Медиа, но они всегда смогут его увидеть из общих топов (если таковая настройка не была отключена</td>

            </tr> <br>

            <tr>
                <td class="lcol"></td>
                <td class="sm" style="color:#888"><b>Вы можете всегда в любое время изменить эти настройки.</b></td>

            </tr>
            <style>
                .w3-green,
                .w3-hover-green:hover {
                    color: #fff !important;
                    background-color: #000 !important;
                }

                .w3-center {
                    text-align: center !important;
                }

                .w3-container,
                .w3-panel {
                    padding: 0.01em 16px;
                }

                .w3-light-grey,
                .w3-hover-light-grey:hover,
                .w3-light-gray,
                .w3-hover-light-gray:hover {
                    color: #000 !important;
                    background-color: #f1f1f1 !important;
                }

                .w3-container:after,
                .w3-container:before,
                .w3-panel:after,
                .w3-panel:before,
                .w3-row:after,
                .w3-row:before,
                .w3-row-padding:after,
                .w3-row-padding:before,
                .w3-cell-row:before,
                .w3-cell-row:after,
                .w3-clear:after,
                .w3-clear:before,
                .w3-bar:before,
                .w3-bar:after {
                    content: "";
                    display: table;
                    clear: both;
                }
            </style>

            <tr>
                <td></td>
                <td style="padding:20px 2px 12px">
                    <button id="submitbtn" href="#" class="progress-button" data-loading="Идёт загрузка..." data-finished="Обработка..." type="submit">Опубликовать</button> &nbsp; &nbsp;&nbsp;
                    <span id="statusbox" class="narrow" style="font-size:20px; font-weight:bold; position:relative; top:-12px"></span>
                    <div id="errorsbox" style="display:none; color:red; margin-top:15px; font-weight:bold;"></div>
                    <div style="margin-top: 20px; max-width: 50% !important;" id="prgb" class="w3-light-grey">
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    </form>
    </div><br>
    <div id="loadtable" class="p20" style="display:none; padding-bottom:20px; margin-bottom:15px">
        <h4>Загруженные фотографии</h4>
        <div id="loadbox" style="display:flex; flex-wrap:wrap; gap:10px"></div>
    </div>
    </td>
    </tr>
    <tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
    </tr>
    </table>
    <script>
        $('#mform').submit(function(e) {


            e.preventDefault();
            var formData = new FormData(this);
            var bar = $('.bar');
            var percent = $('.percent');
            var status = $('#status');
            var continuepost = 0;
            $('#submitbtn').prop("disabled", true);



            $.ajax({
                type: "POST",
                url: '/api/upload',
                data: formData,

                xhr: function() {
                    $('#prgb').html('<div id="myBar" class="w3-container w3-green w3-center" style="width:0%">0%</div>');
                    // Добавляем спиннер и блокируем кнопку во время загрузки
                    //$("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3" disabled><div class="plus-button-reflection"></div>Опубликовать</button>');

                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = parseInt(((evt.loaded / evt.total) * 100));
                            console.log(evt.total);



                            var elem = document.getElementById("myBar");
                            elem.style.width = percentComplete + '%';
                            elem.innerHTML = percentComplete + '%';

                            scrollProgressBarWidth(percentComplete);
                        }
                    }, false);
                    return xhr;
                },



                success: function(response) {
                    $('#prgb').html('');
                    try {
                        var jsonData = JSON.parse(response);
                    } catch (err) {
                        //$("#r").html('<button id="uploadbtn" style="margin-right: 15px; background: none; border: none; color: aliceblue; " type="submit" name="createpost" class="mb-3 mt-3"><i style="position:relative; font-size: 25px; margin-right: 10px; color: aliceblue; top: 4px;" class="ti ti-message-share uploadbtn"></i>Опубликовать</button>');
                        $("#prgtd").html('');
                        $("#prgrsg").html('');
                        //$("#prgrsg").html('<div id="prgrs" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="100" aria-valuemax="100" style="width: 100%">100%</div>');
                        Notify.noty('danger', escapeHtml(err.message));
                        $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3">Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                        scrollProgressBarWidth(0);
                        $('#submitbtn').prop("disabled", false);
                    }

                    if (jsonData.errorcode == "1") {
                        $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3">Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                        //$("#r").html('<button id="uploadbtn" style="margin-right: 15px; background: none; border: none; color: aliceblue; " type="submit" name="createpost" class="mb-3 mt-3"><i style="position:relative; font-size: 25px; margin-right: 10px; color: aliceblue; top: 4px;" class="ti ti-message-share uploadbtn"></i>Опубликовать</button>');
                        $("#prgtd").html('');
                        $("#prgrsg").html('');
                        //$("#prgrsg").html('<div id="prgrs" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="100" aria-valuemax="100" style="width: 100%">100%</div>');
                        Notify.noty('danger', 'В посте нет контента!');
                        scrollProgressBarWidth(0);
                        $('#submitbtn').prop("disabled", false);

                    } else if (jsonData.errorcode == "101") {
                        $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3">Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                        //$("#r").html('<button id="uploadbtn" style="margin-right: 15px; background: none; border: none; color: aliceblue; " type="submit" name="createpost" class="mb-3 mt-3"><i style="position:relative; font-size: 25px; margin-right: 10px; color: aliceblue; top: 4px;" class="ti ti-message-share uploadbtn"></i>Опубликовать</button>');
                        $("#prgtd").html('');
                        $("#prgrsg").html('');
                        //$("#prgrsg").html('<div id="prgrs" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="100" aria-valuemax="100" style="width: 100%">100%</div>');
                        Notify.noty('danger', 'В посте больше 10 медиафайлов');
                        $('#submitbtn').prop("disabled", false);
                        scrollProgressBarWidth(0);
                    } else if (jsonData.errorcode == "0") {
                        Notify.noty('success', 'Успешная публикация!');
                        $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3" disabled>Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                        //$("#r").html('<button id="uploadbtn" style="margin-right: 15px; background: none; border: none; color: aliceblue; " type="submit" name="createpost" class="mb-3 mt-3"><i style="position:relative; font-size: 25px; margin-right: 10px; color: aliceblue; top: 4px;" class="ti ti-message-share uploadbtn"></i>Опубликовать</button>');
                        $("#prgtd").html('');
                        $("#prgrsg").html('');
                        /*let positionData = {
                            id: jsonData.id,
                            user_id: jsonData.user_id,
                            text: jsonData.text,
                            user_flname: jsonData.user_flname,
                            username: jsonData.username,
                            user_photo: jsonData.user_photo
                        };

                        ws.send(JSON.stringify(positionData));*/
                        setTimeout(function() {
                            window.location.replace("/photo/" + jsonData.id);
                            scrollProgressBarWidth(0);
                        }, 1000);
                    } else if (jsonData.errorcode == "LIMITEXCEEDED") {
                        $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3">Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                        $("#prgtd").html('');
                        $("#prgrsg").html('');
                        //$("#prgrsg").html('<div id="prgrs" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="100" aria-valuemax="100" style="width: 100%">100%</div>');
                        //alert('За последнюю минуту вы отправили слишком много запросов. Повторите попытку позже.');
                        createModal('NONE', 'NONE', 'NONE', 'LIMITEXCEEDED', 'limit');
                        scrollProgressBarWidth(0);
                    } else {
                        $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3">Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                        $("#prgtd").html('');
                        $("#prgrsg").html('');
                        //$("#prgrsg").html('<div id="prgrs" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="100" aria-valuemax="100" style="width: 100%">100%</div>');
                        Notify.noty('danger', 'Неизвестная ошибка');
                        scrollProgressBarWidth(0);
                        $('#submitbtn').prop("disabled", false);
                    }
                },
                error: function(xhr, status, error) {
                    $('#prgb').html('');
                    $("#r").html('<button type="submit" id="register" name="loginaccount" class="btn btn-block btn-primary py-2 ripple-handler mt-1 mb-3">Опубликовать<span class="ripple-mask"><span class="ripple" style=""></span></span></button>');
                    $("#prgtd").html('');
                    $("#prgrsg").html('');
                    //$("#prgrsg").html('<div id="prgrs" class="progress-bar progress-bar-striped progress-bar-animated bg-danger" role="progressbar" aria-valuenow="0" aria-valuemin="100" aria-valuemax="100" style="width: 100%">100%</div>');
                    Notify.noty('danger', 'Не удалось опубликовать пост');
                    scrollProgressBarWidth(0);
                    $('#submitbtn').prop("disabled", false);
                },
                cache: false,
                contentType: false,
                processData: false
            });

        });
    </script>
</body>

</html>