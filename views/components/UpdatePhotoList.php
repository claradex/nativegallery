<?php

use App\Services\{DB, Date};

/** @var array $photos */
foreach ($photos as $p) {
    $content = json_decode($p['content'] ?? '{}', true) ?: [];
    $route = trim((string) ($content['entityroute'] ?? ''));
    $descr = trim((string) ($content['comment'] ?? ''));
    if ($descr === '') {
        $descr = (string) ($p['postbody'] ?? '');
    }

    $commentsCount = DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', [':id' => $p['id']])[0]['COUNT(*)'];
    $viewsCount = DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', [':id' => $p['id']])[0]['COUNT(*)'];

    $shotDate = (int) $p['posted_at'];
    if ($shotDate <= 0 || $shotDate === 943909200) {
        $shotLabel = 'не указана';
    } else {
        $shotLabel = Date::chronologyDate($shotDate);
    }

    echo '<div class="p5h" style="padding:0 5px">
        <table>
            <tr>
                <td class="pb-pre">' . htmlspecialchars(Date::formatDate((int) $p['timeupload'])) . '</td>
                <td class="pb_photo">
                    <a href="/photo/' . (int) $p['id'] . '/" target="_blank" class="prw">
                        <img class="f" src="' . ng_photo_thumb($p['photourl']) . '" alt="">
                        <div class="hpshade">';
    if ($commentsCount >= 1) {
        echo '<div class="com-icon">' . (int) $commentsCount . '</div>';
    }
    echo '<div class="eye-icon">' . (int) $viewsCount . '</div>
                        </div>
                    </a>
                </td>
                <td class="pb_descr">
                    <p class="pw-descr">';

    if (!empty($p['entity_data_id']) && !empty($p['entity_title'])) {
        if (!empty($p['entity_type_title'])) {
            echo htmlspecialchars($p['entity_type_title']) . ' ';
        }
        echo '#<a href="/vehicle/' . (int) $p['entity_data_id'] . '/"><b>' . htmlspecialchars($p['entity_title']) . '</b></a>';
        if ($route !== '') {
            echo ' — маршрут <b>' . htmlspecialchars($route) . '</b>';
        }
        echo '<br>';
    } elseif (!empty($p['gallery_ref_id']) && !empty($p['gallery_title'])) {
        echo '<a href="/article/' . (int) $p['gallery_ref_id'] . '/">' . htmlspecialchars($p['gallery_title']) . '</a><br>';
    }

    if (!empty($p['place'])) {
        echo '<b class="pw-place">' . htmlspecialchars($p['place']) . '</b><br>';
    }

    if ($descr !== '' && $descr !== $p['postbody']) {
        echo htmlspecialchars($descr) . '<br>';
    }

    echo '</p>
                    <p class="sm"><b>' . $shotLabel . '</b><br>
                    Автор: <a href="/author/' . (int) $p['user_id'] . '/">' . htmlspecialchars($p['username'] ?? '') . '</a></p>
                </td>
            </tr>
        </table>
    </div><br>';
}