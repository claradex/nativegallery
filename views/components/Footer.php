<?php
use App\Services\RuntimeInfo;

?>



<td class="footer">
            <?php
            $footerSlogan = trim((string) (NGALLERY['root']['footerslogan'] ?? ''));
            $footerMeta = 'PHP ' . phpversion() . ' | MySQL ' . RuntimeInfo::mysqlVersion() . ' | Версия ' . RuntimeInfo::gitShortHash();
            ?>
            <p><?= $footerSlogan !== '' ? htmlspecialchars($footerSlogan) . ' | ' : '' ?><?= $footerMeta ?></p>
            <b><a href="/">Главная</a> &nbsp; &nbsp; <a href="/lk/">Личный кабинет</a> &nbsp; &nbsp; <a href="/rules">Правила</a> &nbsp; &nbsp; <a href="/about">О сервере</a></b><br>
        </td>