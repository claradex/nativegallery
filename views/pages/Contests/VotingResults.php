<?php

use App\Services\DB;
use App\Models\Photo;

$perPage = 10;
$offset = max(0, (int) ($_GET['st'] ?? 0));

$rows = DB::query(
    'SELECT cw.*, c.themeid
     FROM contests_winners cw
     LEFT JOIN contests c ON c.id = cw.contest_id
     WHERE cw.place BETWEEN 1 AND 3
     ORDER BY cw.date DESC, cw.contest_id DESC, cw.place ASC'
);

$grouped = [];
foreach ($rows as $row) {
    $grouped[(int) $row['contest_id']][] = $row;
}

$contestBlocks = array_values($grouped);
$total = count($contestBlocks);
$slice = array_slice($contestBlocks, $offset, $perPage);

$placeIcon = static function (int $place): string {
    return match ($place) {
        1 => 'vs3',
        2 => 'vs2',
        3 => 'vs1',
        default => 'vs1',
    };
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
                <center>
                    <h1>Победители фотоконкурса</h1>
                    <?php $contestNavActive = 'results'; include $_SERVER['DOCUMENT_ROOT'] . '/views/components/ContestNav.php'; ?>

                    <?php if ($total === 0) { ?>
                        <div class="p20" style="margin: 20px 0">
                            <p>Пока нет завершённых конкурсов с победителями.</p>
                            <p class="sm">Когда конкурс завершится, здесь появятся фотографии-призёры. Сейчас можно перейти к <a href="/voting">голосованию</a> или <a href="/voting/waiting">претендентам</a>.</p>
                        </div>
                    <?php } else { ?>
                        <p class="sm" style="margin-bottom: 16px">Чтобы посмотреть подробный отчёт о конкурсе, нажмите на дату.</p>

                        <?php
                        if ($offset > 0) {
                            echo '<p class="sm"><a href="?st=' . max(0, $offset - $perPage) . '">&laquo; Назад</a></p>';
                        }

                        foreach ($slice as $winners) {
                            $contestId = (int) $winners[0]['contest_id'];
                            $themeId = (int) ($winners[0]['themeid'] ?? 0);
                            $themeRows = $themeId > 0
                                ? DB::query('SELECT title FROM contests_themes WHERE id = :id', [':id' => $themeId])
                                : [];
                            $theme = $themeRows[0]['title'] ?? '';
                            $contestDate = date('d.m.Y', (int) $winners[0]['date']);

                            echo '<p><span class="narrow" style="font-size:21px"><b>' . $contestDate . '</b></span>';
                            if ($theme !== '') {
                                echo '<br><span class="sm">' . htmlspecialchars($theme) . '</span>';
                            }
                            echo '</p><table><tr>';

                            foreach ($winners as $winner) {
                                $photo = new Photo((int) $winner['photo_id']);
                                $icon = $placeIcon((int) $winner['place']);
                                $thumb = 'ng_photo_thumb((string) $photo->i('photourl'));
                                echo '<td class="p20" style="text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px">'
                                    . '<a href="/photo/' . (int) $winner['photo_id'] . '/">'
                                    . '<img src="' . htmlspecialchars($thumb) . '" class="f" style="margin-bottom:7px" alt="">'
                                    . '<br><img src="/static/img/' . $icon . '.png" style="position:relative; top:-2px" alt="">'
                                    . '</a></td>';
                            }

                            echo '</tr></table><br>';
                        }

                        if ($offset + $perPage < $total) {
                            echo '<p class="sm"><a href="?st=' . ($offset + $perPage) . '">Далее &raquo;</a></p>';
                        }
                        ?>
                    <?php } ?>

                    <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/ContestNav.php'; ?>
                </center>
            </td>
        </tr>
        <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'; ?>
    </table>
</body>

</html>