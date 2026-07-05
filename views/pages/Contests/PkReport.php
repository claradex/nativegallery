<?php

use App\Models\{Photo, User};
use App\Services\DB;

$photoId = (int) ($_GET['pid'] ?? 0);

$notFound = static function (): void {
    http_response_code(404);
    require $_SERVER['DOCUMENT_ROOT'] . '/views/pages/Errors/404.php';
    exit;
};

if ($photoId <= 0) {
    $notFound();
}

$photo = new Photo($photoId);
if ($photo->i('id') === null) {
    $notFound();
}

$contentContests = (array) ($photo->content('contests') ?? []);

$contestId = 0;
$photoContestMeta = null;

$winnerRows = DB::query(
    'SELECT contest_id FROM contests_winners WHERE photo_id = :pid ORDER BY date DESC LIMIT 1',
    [':pid' => $photoId]
);
if (!empty($winnerRows)) {
    $contestId = (int) $winnerRows[0]['contest_id'];
}

if ($contestId <= 0) {
    foreach ($contentContests as $entry) {
        $entryContestId = (int) ($entry['id'] ?? $entry['contest_id'] ?? 0);
        if ($entryContestId > 0) {
            $contestId = $entryContestId;
            $photoContestMeta = $entry;
            break;
        }
    }
}

if ($contestId <= 0) {
    $rateContestRows = DB::query(
        'SELECT contest_id FROM contests_rates WHERE photo_id = :pid ORDER BY contest_id DESC LIMIT 1',
        [':pid' => $photoId]
    );
    if (!empty($rateContestRows)) {
        $contestId = (int) $rateContestRows[0]['contest_id'];
    }
}

if ($contestId <= 0) {
    $notFound();
}

$contestRows = DB::query('SELECT * FROM contests WHERE id = :id', [':id' => $contestId]);
$contest = $contestRows[0] ?? null;

if ($photoContestMeta === null) {
    foreach ($contentContests as $entry) {
        if ((int) ($entry['id'] ?? $entry['contest_id'] ?? 0) === $contestId) {
            $photoContestMeta = $entry;
            break;
        }
    }
}

$themeTitle = '';
if ($contest !== null) {
    $themeRows = DB::query('SELECT title FROM contests_themes WHERE id = :id', [':id' => (int) $contest['themeid']]);
    $themeTitle = ($themeRows[0] ?? [])['title'] ?? '';
}
if ($themeTitle === '' && is_array($photoContestMeta)) {
    $themeTitle = (string) ($photoContestMeta['contesttheme'] ?? $photoContestMeta['theme'] ?? '');
}

$entries = DB::query(
    'SELECT cw.place, cw.photo_id, cw.date,
            p.place AS photo_place, p.photourl, p.postbody, p.posted_at, p.user_id, p.content,
            (SELECT COUNT(*) FROM contests_rates cr
             WHERE cr.photo_id = cw.photo_id AND cr.contest_id = cw.contest_id) AS vote_count
     FROM contests_winners cw
     INNER JOIN photos p ON p.id = cw.photo_id
     WHERE cw.contest_id = :cid
     ORDER BY cw.place ASC, vote_count DESC, cw.photo_id ASC',
    [':cid' => $contestId]
);

if ($entries === []) {
    $rateRows = DB::query(
        'SELECT p.id AS photo_id, p.place AS photo_place, p.photourl, p.postbody, p.posted_at, p.user_id, p.content,
                COUNT(cr.id) AS vote_count,
                COALESCE(MAX(cw.place), 0) AS place,
                COALESCE(MAX(cw.date), 0) AS date
         FROM contests_rates cr
         INNER JOIN photos p ON p.id = cr.photo_id
         LEFT JOIN contests_winners cw ON cw.photo_id = p.id AND cw.contest_id = cr.contest_id
         WHERE cr.contest_id = :cid
         GROUP BY p.id
         ORDER BY vote_count DESC, p.id ASC
         LIMIT 10',
        [':cid' => $contestId]
    );

    $nextPlace = 1;
    $lastVotes = null;
    $assignedPlace = 0;
    foreach ($rateRows as $row) {
        $votes = (int) $row['vote_count'];
        $place = (int) $row['place'];
        if ($place <= 0) {
            if ($lastVotes !== $votes) {
                $assignedPlace = $nextPlace;
                $lastVotes = $votes;
            }
            $place = $assignedPlace;
            $nextPlace++;
        }
        $entries[] = [
            'place' => $place,
            'photo_id' => (int) $row['photo_id'],
            'date' => (int) $row['date'],
            'photo_place' => $row['photo_place'],
            'photourl' => $row['photourl'],
            'postbody' => $row['postbody'],
            'posted_at' => $row['posted_at'],
            'user_id' => $row['user_id'],
            'content' => $row['content'],
            'vote_count' => $votes,
        ];
    }
}

if ($entries === [] && is_array($photoContestMeta)) {
    $entries[] = [
        'place' => (int) ($photoContestMeta['place'] ?? 0),
        'photo_id' => $photoId,
        'date' => (int) ($photoContestMeta['date'] ?? $photo->i('posted_at') ?? time()),
        'photo_place' => $photo->i('place'),
        'photourl' => $photo->i('photourl'),
        'postbody' => $photo->i('postbody'),
        'posted_at' => $photo->i('posted_at'),
        'user_id' => $photo->i('user_id'),
        'content' => $photo->i('content'),
        'vote_count' => (int) ($photoContestMeta['votenum'] ?? $photoContestMeta['votes'] ?? 0),
    ];
}

if ($entries === []) {
    $notFound();
}

$contestDate = 0;
foreach ($entries as $entry) {
    $entryDate = (int) ($entry['date'] ?? 0);
    if ($entryDate > $contestDate) {
        $contestDate = $entryDate;
    }
}
if ($contestDate <= 0 && $contest !== null) {
    $contestDate = (int) ($contest['closedate'] ?? $contest['opendate'] ?? 0);
}
if ($contestDate <= 0) {
    $contestDate = (int) ($photo->i('posted_at') ?? time());
}

$stats = DB::query(
    'SELECT COUNT(*) AS votes, COUNT(DISTINCT user_id) AS voters
     FROM contests_rates WHERE contest_id = :cid',
    [':cid' => $contestId]
)[0] ?? ['votes' => 0, 'voters' => 0];

$placeIcon = static function (int $place): ?string {
    return match ($place) {
        1 => 'vs3',
        2 => 'vs2',
        3 => 'vs1',
        default => null,
    };
};

$voteCountForEntry = static function (array $entry) use ($contestId): int {
    $votes = (int) ($entry['vote_count'] ?? 0);
    if ($votes > 0) {
        return $votes;
    }

    $content = json_decode((string) ($entry['content'] ?? ''), true);
    if (!is_array($content) || empty($content['contests'])) {
        return 0;
    }

    foreach ($content['contests'] as $contestEntry) {
        $entryContestId = (int) ($contestEntry['id'] ?? $contestEntry['contest_id'] ?? 0);
        if ($entryContestId === $contestId) {
            return (int) ($contestEntry['votenum'] ?? $contestEntry['votes'] ?? 0);
        }
    }

    return 0;
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
                    <h1>Победители фотоконкурса <?= htmlspecialchars(date('d.m.Y', $contestDate)) ?></h1>
                    <?php if ($themeTitle !== '') { ?>
                        <h3><?= htmlspecialchars($themeTitle) ?></h3>
                    <?php } ?>

                    <?php $contestNavActive = 'results'; include $_SERVER['DOCUMENT_ROOT'] . '/views/components/ContestNav.php'; ?>

                    <div style="margin-top: 20px">
                        <?php foreach ($entries as $entry) {
                            $entryPhotoId = (int) $entry['photo_id'];
                            $place = (int) $entry['place'];
                            $votes = $voteCountForEntry($entry);
                            $author = new User((int) $entry['user_id']);
                            $icon = $placeIcon($place);
                            $thumb = ng_photo_thumb((string) $entry['photourl']);
                            $isCurrent = $entryPhotoId === $photoId;
                            ?>
                            <div class="p20p" style="<?= $isCurrent ? 'background:#f5f5f5; border-radius:8px;' : '' ?>">
                                <table width="100%">
                                    <tr>
                                        <td style="width:70px; vertical-align:top; font-size:21px; padding-right:12px">
                                            <?php if ($place > 0) { ?>
                                                <b><?= $place ?></b><br>
                                            <?php } ?>
                                            <span class="sm"><?= $votes ?></span>
                                            <?php if ($icon !== null) { ?>
                                                <br><img src="/static/img/<?= $icon ?>.png" alt="">
                                            <?php } ?>
                                        </td>
                                        <td style="width:170px; vertical-align:top">
                                            <a href="/photo/<?= $entryPhotoId ?>/" class="prw">
                                                <img class="f" src="<?= htmlspecialchars($thumb) ?>" alt="" style="max-width:160px">
                                            </a>
                                        </td>
                                        <td class="pb_descr" style="vertical-align:top">
                                            <?php if ((string) $entry['postbody'] !== '') { ?>
                                                <p><?= htmlspecialchars((string) $entry['postbody']) ?></p>
                                            <?php } ?>
                                            <p><b class="pw-place"><?= htmlspecialchars((string) $entry['photo_place']) ?></b></p>
                                            <p class="sm">
                                                <b><?= \App\Services\Date::zmdate((int) $entry['posted_at']) ?></b><br>
                                                Автор: <a href="/author/<?= (int) $entry['user_id'] ?>/"><?= htmlspecialchars((string) $author->i('username')) ?></a>
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        <?php } ?>
                    </div>

                    <p class="sm" style="margin-top: 16px">
                        Число проголосовавших: <b><?= (int) ($stats['voters'] ?? 0) ?></b><br>
                        Число голосов: <b><?= (int) ($stats['votes'] ?? 0) ?></b>
                    </p>

                    <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/ContestNav.php'; ?>
                </center>
            </td>
        </tr>
        <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'; ?>
    </table>
</body>

</html>