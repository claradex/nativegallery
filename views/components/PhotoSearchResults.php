<?php

use App\Services\{DB, Date};
use App\Models\User;

/** @var array $photos */
foreach ($photos as $p) {
    $username = $p['username'] ?? (new User($p['user_id']))->i('username');
    echo '<div class="p20p">
        <table>
            <tbody>
                <tr>
                    <td class="pb_photo">
                        <a href="/photo/' . $p['id'] . '" target="_blank" class="prw">
                            <img class="f" src="ng_photo_thumb($p['photourl']) . '">
                            <div class="hpshade">';
    $commentsCount = DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', [':id' => $p['id']])[0]['COUNT(*)'];
    if ($commentsCount >= 1) {
        echo '<div class="com-icon">' . $commentsCount . '</div>';
    }
    $viewsCount = DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', [':id' => $p['id']])[0]['COUNT(*)'];
    echo '<div class="eye-icon">' . $viewsCount . '</div></div>
                        </a>
                    </td>
                    <td class="pb_descr">
                        <p><b class="pw-place">' . htmlspecialchars($p['place']) . '</b></p>
                        <span class="pw-descr">' . htmlspecialchars($p['postbody']) . '</span>
                        <p class="sm">
                            <b>' . Date::zmdate($p['timeupload']) . '</b>
                            · Съёмка: ' . Date::chronologyDate((int) $p['posted_at']) . '<br>
                            Автор: <a href="/author/' . $p['user_id'] . '/">' . htmlspecialchars($username) . '</a>
                        </p>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>';
}