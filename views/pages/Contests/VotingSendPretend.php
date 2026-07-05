<?php

use App\Services\{Auth, DB, Date};

function convertUnixToRussianDateTime(int $unixTime): string
{
    return Date::formatLocalizedDateTime($unixTime);
}

$contests = DB::query(
    'SELECT * FROM contests WHERE closepretendsdate >= :now ORDER BY openpretendsdate ASC',
    [':now' => time()]
);

$photos = DB::query(
    'SELECT * FROM photos WHERE user_id = :uid AND on_contest = 0 ORDER BY id DESC',
    [':uid' => Auth::userid()]
);

$eligiblePhotos = [];
foreach ($photos as $photo) {
    if ((int) ($photo['moderated'] ?? 0) !== 1) {
        continue;
    }

    $content = json_decode((string) ($photo['content'] ?? ''), true);
    if (!is_array($content)) {
        $content = [];
    }

    $isVideo = ($content['type'] ?? '') === 'video' || !empty($content['video']);
    if (!$isVideo) {
        $eligiblePhotos[] = $photo;
    }
}

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'; ?>
</head>

<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'; ?>
        <tr>
            <td class="main">
                <h1>Принять участие в Фотоконкурсе</h1>

                <form id="sendForm" method="post">
                    <h4>В каком Фотоконкурсе вы хотите принять участие?</h4>
                    <div class="p20w">
                        <?php if ($contests === []) { ?>
                            <div class="p20">Сейчас нет открытых конкурсов для подачи фотографий.</div>
                        <?php } else { ?>
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
                                    <?php foreach ($contests as $contest) {
                                        $themeRows = DB::query(
                                            'SELECT title FROM contests_themes WHERE id = :id',
                                            [':id' => (int) $contest['themeid']]
                                        );
                                        $themeTitle = ($themeRows[0] ?? [])['title'] ?? '—';
                                        ?>
                                        <tr>
                                            <td class="ds">
                                                <input type="radio" name="cid" id="n<?= (int) $contest['id'] ?>"
                                                       value="<?= (int) $contest['id'] ?>">
                                            </td>
                                            <td class="n"><?= htmlspecialchars($themeTitle) ?></td>
                                            <td class="ds"><?= convertUnixToRussianDateTime((int) $contest['openpretendsdate']) ?></td>
                                            <td class="ds"><?= convertUnixToRussianDateTime((int) $contest['closepretendsdate']) ?></td>
                                            <td class="ds"><?= convertUnixToRussianDateTime((int) $contest['opendate']) ?></td>
                                            <td class="ds"><?= convertUnixToRussianDateTime((int) $contest['closedate']) ?></td>
                                        </tr>
                                    <?php } ?>
                                </tbody>
                            </table>
                        <?php } ?>
                    </div>
                    <br clear="all"><br>

                    <div class="p20" style="padding-left:5px; margin-bottom:15px">
                        <table class="nospaces" width="100%">
                            <tbody>
                                <tr>
                                    <td class="lcol">Фотография, которую вы хотите отправить на Фотоконкурс</td>
                                    <td style="padding-bottom:15px">
                                        <select id="photoId" name="photo_id" required>
                                            <option value="" disabled selected>Выберите фотографию</option>
                                            <?php foreach ($eligiblePhotos as $photo) { ?>
                                                <option
                                                    photourl="<?= htmlspecialchars(ng_photo_thumb($photo['photourl']), ENT_QUOTES) ?>"
                                                    value="<?= (int) $photo['id'] ?>">
                                                    [ID: <?= (int) $photo['id'] ?>] <?= htmlspecialchars((string) $photo['place']) ?>
                                                </option>
                                            <?php } ?>
                                        </select>
                                        <?php if ($eligiblePhotos === []) { ?>
                                            <div class="form-text">Нет опубликованных фото, которые ещё не участвуют в конкурсе.</div>
                                        <?php } ?>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <div id="result"></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td>
                                        <br>
                                        <input type="submit" value="&nbsp; &nbsp; &nbsp; Отправить &nbsp; &nbsp; &nbsp;"
                                               <?= ($contests === [] || $eligiblePhotos === []) ? 'disabled' : '' ?>>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </form>
            </td>
        </tr>
        <tr>
            <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'; ?>
        </tr>
    </table>

    <script>
        $('#sendForm').submit(function(e) {
            e.preventDefault();
            $.ajax({
                type: 'POST',
                url: '/api/photo/contests/sendpretend',
                data: $(this).serialize(),
                success: function(response) {
                    const jsonData = typeof response === 'string' ? JSON.parse(response) : response;
                    if (jsonData.errorcode === 0) {
                        alert('Фотография успешно отправлена на претенденты на Фотоконкурс');
                        window.location.href = '/lk/konkurs.php';
                        return;
                    }
                    alert('Пожалуйста, выберите Фотоконкурс и фотографию');
                },
                error: function() {
                    alert('Ошибка сети');
                }
            });
        });

        document.getElementById('photoId').addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const photoUrl = selectedOption.getAttribute('photourl');
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = '';

            if (!photoUrl) {
                return;
            }

            const imgElement = document.createElement('img');
            imgElement.src = photoUrl;
            imgElement.alt = 'Изображение';
            imgElement.style.maxWidth = '500px';
            resultDiv.appendChild(imgElement);
        });
    </script>
</body>

</html>