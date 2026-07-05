<?php

use App\Services\{Auth, DB, Date};
use App\Models\VoteContest;

$userId = Auth::userid();

$activePhotos = DB::query(
    'SELECT p.*, c.status AS contest_status, t.title AS theme_title
     FROM photos p
     LEFT JOIN contests c ON c.id = p.contest_id
     LEFT JOIN contests_themes t ON t.id = c.themeid
     WHERE p.user_id = :uid AND p.on_contest > 0
     ORDER BY p.contest_id DESC, p.id DESC',
    [':uid' => $userId]
);

$winners = DB::query(
    'SELECT cw.place, cw.date, cw.contest_id, p.id AS photo_id, p.place AS photo_place, p.photourl, t.title AS theme_title
     FROM contests_winners cw
     INNER JOIN photos p ON p.id = cw.photo_id
     LEFT JOIN contests c ON c.id = cw.contest_id
     LEFT JOIN contests_themes t ON t.id = c.themeid
     WHERE p.user_id = :uid
     ORDER BY cw.date DESC, cw.place ASC',
    [':uid' => $userId]
);

$lkActive = 'konkurs';

$statusForPhoto = static function (array $photo): array {
    $onContest = (int) ($photo['on_contest'] ?? 0);
    if ($onContest === 1) {
        return ['label' => 'Претендент (отбор)', 'class' => 's1'];
    }
    if ($onContest === 2) {
        return ['label' => 'Участвует в голосовании', 'class' => 's12'];
    }

    return ['label' => '—', 'class' => 's0'];
};

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
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/LkShellOpen.php'; ?>
                <h1>Фотоконкурс</h1>
                <p class="sm">
                    <a href="/voting">Голосование</a> &nbsp;·&nbsp;
                    <a href="/voting/results">Победители</a> &nbsp;·&nbsp;
                    <a href="/voting/waiting">Претенденты</a> &nbsp;·&nbsp;
                    <a href="/voting/sendpretend"><b>Подать фото на конкурс</b></a>
                </p>

                <div class="sm" style="margin: 12px 0 16px">
                    <span class="p20 s1" style="display:inline-block; padding:1px 5px 2px; margin-right:10px">Претендент</span>
                    <span class="p20 s12" style="display:inline-block; padding:1px 5px 2px; margin-right:10px">В голосовании</span>
                    <span class="p20 s2" style="display:inline-block; padding:1px 5px 2px; margin-right:10px">Призовое место</span>
                </div>

                <?php if ($activePhotos === [] && $winners === []) { ?>
                    <div class="p20" style="padding:10px 12px">
                        У вас пока нет фотографий на фотоконкурсе.
                        <a href="/voting/sendpretend" class="und">Подать фото</a>
                    </div>
                <?php } else { ?>
                    <div class="p20w" style="display:block">
                        <table>
                            <tbody>
                                <tr>
                                    <th width="100">Фото</th>
                                    <th>Информация</th>
                                    <th class="c nw">Статус</th>
                                </tr>

                                <?php foreach ($activePhotos as $photo) {
                                    $status = $statusForPhoto($photo);
                                    $contestId = (int) ($photo['contest_id'] ?? 0);
                                    $pretendScore = $contestId > 0
                                        ? VoteContest::count((int) $photo['id'], $contestId)
                                        : 0;
                                    ?>
                                    <tr class="<?= $status['class'] ?>">
                                        <td class="pb-photo pb_photo">
                                            <a href="/photo/<?= (int) $photo['id'] ?>/" target="_blank" class="prw">
                                                <img src="<?= htmlspecialchars(ng_photo_thumb($photo['photourl'])) ?>" class="f" alt="">
                                            </a>
                                        </td>
                                        <td class="d">
                                            <p><b><?= htmlspecialchars((string) $photo['place']) ?></b></p>
                                            <p class="sm">
                                                <b><?= Date::zmdate((int) $photo['posted_at']) ?></b><br>
                                                Конкурс: <?= htmlspecialchars((string) ($photo['theme_title'] ?? '—')) ?>
                                                <?php if ($contestId > 0) { ?>
                                                    <br>ID конкурса: <?= $contestId ?>
                                                <?php } ?>
                                                <?php if ((int) ($photo['on_contest'] ?? 0) === 1) { ?>
                                                    <br>Рейтинг претендента: <b><?= $pretendScore ?></b>
                                                <?php } ?>
                                            </p>
                                        </td>
                                        <td class="ds c"><b><?= $status['label'] ?></b></td>
                                    </tr>
                                <?php } ?>

                                <?php foreach ($winners as $row) {
                                    $place = (int) ($row['place'] ?? 0);
                                    ?>
                                    <tr class="s2">
                                        <td class="pb-photo pb_photo">
                                            <a href="/photo/<?= (int) $row['photo_id'] ?>/" target="_blank" class="prw">
                                                <img src="<?= htmlspecialchars(ng_photo_thumb((string) $row['photourl'])) ?>" class="f" alt="">
                                            </a>
                                        </td>
                                        <td class="d">
                                            <p><b><?= htmlspecialchars((string) $row['photo_place']) ?></b></p>
                                            <p class="sm">
                                                <b><?= Date::zmdate((int) $row['date']) ?></b><br>
                                                Конкурс: <?= htmlspecialchars((string) ($row['theme_title'] ?? '—')) ?>
                                            </p>
                                        </td>
                                        <td class="ds c"><b><?= $place ?>-е место</b></td>
                                    </tr>
                                <?php } ?>
                            </tbody>
                        </table>
                    </div>
                <?php } ?>
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/LkShellClose.php'; ?>
            </td>
        </tr>
        <tr>
            <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'; ?>
        </tr>
    </table>
</body>

</html>