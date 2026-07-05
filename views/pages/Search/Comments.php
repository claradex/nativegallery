<?php

use App\Services\Search\CommentSearch;
use App\Services\Date;

$params = [
    'q' => trim($_GET['q'] ?? ''),
    'id' => $_GET['id'] ?? '',
    'photo_id' => $_GET['photo_id'] ?? '',
    'date_from' => $_GET['date_from'] ?? '',
    'date_to' => $_GET['date_to'] ?? '',
    'st' => $_GET['st'] ?? 0,
];

$hasCriteria = !empty($params['q']) || !empty($params['id']) || !empty($params['photo_id'])
    || !empty($params['date_from']) || !empty($params['date_to']);
$items = $hasCriteria ? CommentSearch::fetch($params) : [];
$total = $hasCriteria ? CommentSearch::count($params) : 0;
$offset = max(0, (int) $params['st']);
$perPage = CommentSearch::PER_PAGE;

$searchNavActive = 'comments';
$queryBase = $_GET;
unset($queryBase['st']);
$buildUrl = function (int $st = 0) use ($queryBase) {
    $q = $queryBase;
    if ($st > 0) {
        $q['st'] = $st;
    } else {
        unset($q['st']);
    }
    $qs = http_build_query($q);
    return '/csearch' . ($qs ? '?' . $qs : '');
};
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
                <h1>Поиск комментариев</h1>
                <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/SearchNav.php'); ?>

                <form method="get" class="p20" style="margin-bottom:20px">
                    <table>
                        <tr>
                            <td class="sm" style="padding-right:10px">Текст:</td>
                            <td><input type="text" name="q" value="<?= htmlspecialchars($params['q']) ?>" class="form-control" style="max-width:400px"></td>
                        </tr>
                        <tr>
                            <td class="sm" style="padding-right:10px">Автор (ID):</td>
                            <td><input type="number" name="id" value="<?= htmlspecialchars($params['id']) ?>" class="form-control" style="max-width:150px"></td>
                        </tr>
                        <tr>
                            <td class="sm" style="padding-right:10px">ID фото:</td>
                            <td><input type="number" name="photo_id" value="<?= htmlspecialchars($params['photo_id']) ?>" class="form-control" style="max-width:150px"></td>
                        </tr>
                        <tr>
                            <td class="sm" style="padding-right:10px">Дата:</td>
                            <td>
                                <input type="date" name="date_from" value="<?= htmlspecialchars($params['date_from']) ?>" class="form-control" style="max-width:180px; display:inline-block">
                                —
                                <input type="date" name="date_to" value="<?= htmlspecialchars($params['date_to']) ?>" class="form-control" style="max-width:180px; display:inline-block">
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input type="submit" class="btn btn-primary" value="Найти"></td>
                        </tr>
                    </table>
                </form>

                <?php if ($hasCriteria) { ?>
                    <div class="sm" style="margin-bottom:15px">Найдено: <b><?= $total ?></b></div>
                    <?php if (empty($items)) { ?>
                        <p class="sm"><i>Ничего не найдено.</i></p>
                    <?php } else {
                        foreach ($items as $c) {
                            if ((int) ($c['photo_moderated'] ?? 0) !== 1) {
                                continue;
                            }
                            echo '<div class="p-comment p20p">
                                <div class="pc-photo"><a href="/photo/' . $c['photo_id'] . '/?top=1" target="_blank" class="prw">
                                    <img src="' . ng_photo_thumb($c['photourl']) . '" class="f"></a></div>
                                <div class="pc-content">
                                    <a class="pc-topost" href="/photo/' . $c['photo_id'] . '/?top=1#' . $c['id'] . '" target="_blank">Ссылка</a>
                                    <div class="pc-text">
                                        <b><a href="/author/' . $c['user_id'] . '/">' . htmlspecialchars($c['username']) . '</a></b>
                                        · <span class="sm">' . Date::zmdate($c['posted_at']) . '</span>
                                        <div class="message-text feed">' . $c['body'] . '</div>
                                    </div>
                                </div>
                            </div>';
                        }
                    }
                    if ($total > $perPage) {
                        echo '<p class="sm" style="margin-top:15px">';
                        if ($offset > 0) {
                            echo '<a href="' . htmlspecialchars($buildUrl($offset - $perPage)) . '">« назад</a> ';
                        }
                        if ($offset + $perPage < $total) {
                            echo '<a href="' . htmlspecialchars($buildUrl($offset + $perPage)) . '">вперёд »</a>';
                        }
                        echo '</p>';
                    }
                } else { ?>
                    <p class="sm"><i>Укажите текст, автора, ID фото или диапазон дат.</i></p>
                <?php } ?>
            </td>
        </tr>
        <tr>
            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>
</body>

</html>