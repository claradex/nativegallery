<?php

use \App\Services\{Auth, DB, Date, Captcha};
use \App\Models\{Vehicle, User};

$vehicle = DB::query('SELECT * FROM entities WHERE id=:id', array(':id' => $_GET['type']))[0];
$lastRequestUnix = DB::query('SELECT created_at FROM entities_requests WHERE user_id=:id ORDER BY id DESC LIMIT 1', array(':id' => Auth::userid()))[0]['created_at'];
$secondsDifference = time() - $lastRequestUnix;
$hoursDifference = floor($secondsDifference / 3600);
if (isset($_POST['create'])) {
    if ($hoursDifference >= 23) {
        try {
            if (NGALLERY['root']['security']['captcha'] === true) {
                $turnstile = new Captcha(NGALLERY['root']['security']['cloudflareturnstile-keys']['server']);
                $turnstile->setToken($_POST['cf-turnstile-response']);
                $turnstile->setRemoteIp($_SERVER['REMOTE_ADDR']);

                $result = $turnstile->verify();
            }
            $inputs = $_POST;

            $filteredInputs = [];
            foreach ($inputs as $key => $value) {
                if (strpos($key, 'modelinput_') === 0) {
                    $filteredInputs[$key] = $value;
                }
            }
            ksort($filteredInputs);
            $result = [];

            $counter = 1;

            foreach ($filteredInputs as $key => $value) {
                $result[$counter] = [
                    'value' => $value
                ];
                $counter++;
            }
            $jsonResult = json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

            DB::query('INSERT INTO entities_requests VALUES (\'0\', :user_id, :createdate, :entityid, :content, 0)', array(':user_id' => Auth::userid(), ':createdate' => time(), ':entityid' => $_GET['type'], ':content' => $jsonResult));
            $success = 1;
        } catch (Exception $e) {
            die("Error: " . $e->getMessage());
        }
    }
}
?>

<!DOCTYPE html>
<html lang="ru">
<script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
    defer></script>

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <h1>Внесение изменений в БД</h1>
                <?php if ($success) { ?> <div style="border:solid 1px rgb(0, 140, 86); padding:6px 10px 7px; margin-bottom:13px; background-color:rgb(137, 216, 150);">Заявка на рассмотрение успешно отправлена</div> <?php } ?>
                <?php if ($hoursDifference >= 23) { ?>
                <form method="post" id="mform" action="<?= $_SERVER['REQUEST_URI'] ?>">


                    <h4>Какую запись вы хотите уточнить?</h4>
                    <div class="p20w">
                        <table>
                            <tbody>
                                <tr>
                                    <th></th>
                                    <th>№</th>
                                    <th>Название</th>
                                </tr>
                                <tr class="s1">
                                    <td class="ds"><input type="radio" name="base_nid" value="0" checked="checked" onclick="fillFields(0)"></td>
                                    <td class="d" colspan="7">Никакую, я хочу добавить новое ТС</td>
                                </tr>
                                <?php
                                $entities = DB::query('SELECT * FROM entities_data WHERE entityid=:id AND (LOWER(title) LIKE :title)', array(':title' => $_GET['num'], ':id' => $_GET['type']));
                                foreach ($entities as $e) {
                                    echo '<tr>
                                    <td class="ds"><input type="radio" name="base_nid" id="n' . $e['id'] . '" value="' . $e['id'] . '" onclick="fillFields(' . $e['id'] . ')"></td>
                                    <td class="n"><a href="/vehicle/' . $e['id'] . '" target="_blank">' . $e['id'] . '</a></td>
                                    <td class="ds">' . $e['title'] . '</td>
                                   
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
                                    <td style="padding-bottom:15px"><input type="text" name="modelinput_' . $count . '" id="num" style="width:80px" maxlength="21" required></td>
                                </tr>';
                                    $count++;
                                }
                                ?>
                                <tr>
                                    <td style="width: 10%"></td>


                                </tr>
                                <?php
                                if (NGALLERY['root']['security']['captcha'] === true) { ?>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <br>
                                            <div class="cf-turnstile" data-sitekey="<?= NGALLERY['root']['security']['cloudflareturnstile-keys']['client'] ?>"></div>
                                        </td>
                                    </tr>
                                <?php } ?>
                                <tr>
                                    <td></td>
                                    <td>
                                        <br>
                                        <input name="create" type="submit" value="&nbsp; &nbsp; &nbsp; Отправить &nbsp; &nbsp; &nbsp;">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
                <?php } else if (!$success) {
                    echo ' <div style="border:solid 1px rgb(140, 0, 0); padding:6px 10px 7px; margin-bottom:13px; background-color:rgb(216, 137, 137);">Заявки можно отправлять раз в 24 часа</div>';
                }
                ?>

                <div class="p20">
                    <h4>Правила заполнения формы</h4>
                    <ul class="straight">
                        <li>Обязательные для заполнения поля выделены жирным шрифтом.</li>
                        <li>Если какие-либо данные отсутствуют, оставьте соответствующее поле пустым. Пожалуйста, не вписывайте дефис и тому подобные знаки.</li>
                        <li>Если требуемой модели нет в списке — укажите её в поле «Примечание». После публикации фотографии модель будет добавлена в список.</li>
                        <li>Если Вы обладаете информацией о приписке данного ТС, а поле «Депо/Парк» отсутствует, укажите эти данные в поле «Примечание».</li>
                    </ul>
                </div>
            </td>
        </tr>
        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>