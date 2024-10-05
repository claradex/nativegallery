<?php

use \App\Services\{Auth, DB};
use \App\Models\User;

$user = new \App\Models\User(Auth::userid());

if (NGALLERY['root']['logo'] != null) {
    $logo = NGALLERY['root']['logo'];
    $width = '70px';
} else {
    $logo = '/static/img/logosmall.png';
    $width = '70px';
}

if (NGALLERY['root']['title'] != null && NGALLERY['root']['showtitle'] === true) {
    $title = NGALLERY['root']['title'];
} else if (NGALLERY['root']['showtitle'] === false) {
    $title = '';
} else {
    $title = 'NativeGallery';
}

$noncheckedimgs = DB::query('SELECT COUNT(*) FROM followers_notifications WHERE checked=0 AND follower_id=:id', array(':id'=>Auth::userid()))[0]['COUNT(*)'];
if ($noncheckedimgs > 0) {
    $nonrw = '<span class="mm-notify notify-count">'.$noncheckedimgs.'</span>';
}
    
?>
<tr>
    <td class="mm-bar">
        <?php
        if (explode('/', $_SERVER['REQUEST_URI'])[1] === 'photo') { ?>
    <a id="title-small" href="/"><img src="<?=$logo?>"><?=$title?></a>
    <?php } ?>
        <ul class="mm mm-level-1">
            <li><a href="#" onclick="return false" class="mm-item"><span class="mm-label">Дополнительно</span></a>
                <div>
                    <ul class="mm-level-2">
                        <li><a href="/news.php" class="mm-item"><span class="mm-label">Новости и хронология</span></a></li>
                        <li><a href="/misc/" class="mm-item"><span class="mm-label">Разные фотогалереи</span></a></li>
                        <li><a href="/voting.php" class="mm-item"><span class="mm-label">Фотоконкурс</span></a></li>
                        <li><a href="/news2.php" class="mm-item"><span class="mm-label">Новости сайта</span></a></li>
                        <li><a href="/links.php" class="mm-item"><span class="mm-label">Ссылки</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/comments.php" class="mm-item"><span class="mm-label">Комментарии</span></a></li>
            <li><a href="#" onclick="return false" class="mm-item"><span class="mm-label">Обновления</span><?=$nonrw?></a>
                <div>
                    <ul class="mm-level-2">
                        <li><a href="/update.php?time=24" class="mm-item"><span class="mm-label">Новые фотографии</span></a></li>
                        <li><a href="/feed" class="mm-item"><span class="mm-label">Лента обновлений</span></a></li>
                        <li><a href="/fav_authors" class="mm-item"><span class="mm-label">Фотографии избранных авторов</span><?=$nonrw?></a></li>
                        <li><a href="/update.php" class="mm-item"><span class="mm-label">Архив обновлений по датам</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/help/" class="mm-item"><span class="mm-label">Помощь</span></a>
                <div>
                    <ul class="mm-level-2">
                        <li><a href="/rules/" class="mm-item"><span class="mm-label">Правила сайта</span></a></li>
                        <li><a href="/rules/pub/" class="mm-item"><span class="mm-label">Критерии отбора фотографий</span></a></li>
                        <li><a href="/rules/photo/" class="mm-item"><span class="mm-label">Правила подписи фотографий</span></a></li>
                        <li><a href="/rules/video/" class="mm-item"><span class="mm-label">Правила видеокаталога</span></a></li>
                    </ul>
                </div>
            </li>
            <li><a href="/search.php" class="mm-item"><span class="mm-label">Поиск</span></a>
                <div>
                    <ul class="mm-level-2">
                        <li><a href="/search.php" class="mm-item"><span class="mm-label">Поиск фотографий</span></a></li>
                        <li><a href="/vsearch.php" class="mm-item"><span class="mm-label">Поиск ТС</span></a></li>
                        <li><a href="/csearch.php" class="mm-item"><span class="mm-label">Поиск комментариев</span></a></li>
                        <li><a href="/authors.php" class="mm-item"><span class="mm-label">Поиск авторов</span></a></li>
                    </ul>
                </div>
            </li>
            <?php
            if (Auth::userid() <= 0) { ?>
            
                <li class="mm-pad-right"><a href="/login" class="mm-item"><span class="mm-icon"><i class="fas fa-xs fa-address-card"></i></span><span class="mm-label">Войти</span></a></li>
                <li><a href="/register" class="mm-item"><span class="mm-icon"><i class="fas fa-xs fa-user"></i></span><span class="mm-label">Регистрация</span></a></li>
            <?php } else { ?>
                <?php
                            if ($user->i('admin') > 0) { 
                                $nonreviewedimgs = DB::query('SELECT COUNT(*) FROM photos WHERE moderated=0')[0]['COUNT(*)'];
                                if ($nonreviewedimgs > 0) {
                                    $nonr = '<span class="mm-notify notify-count">'.$nonreviewedimgs.'</span>';
                                }
                            }
                                ?>
                <li class="mm-pad-right mm-wide"><a href="/author/<?=Auth::userid()?>/" class="mm-item"><span class="mm-icon"><i class="fas fa-xs fa-user"></i></span><span class="mm-label"><?=$user->i('username')?></span><?=$nonr?></a>
                    <div>
                        <ul class="mm-level-2">
                            <li><a href="/lk/" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-info-circle"></i></span><span class="mm-label">Общая информация</span></a></li>
                            <?php
                            if ($user->i('admin') > 0) { 
                              
                                ?>
                        
                                <li><a href="/admin" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-info-circle"></i></span><span class="mm-label">Admin</span><?=$nonr?></a></li>
                            <?php } ?>
                            <li><a href="/lk/upload" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-plus-square"></i></span><span class="mm-label"><b>Предложить медиа</b></span></a></li>
                            <li><a href="/lk/history" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-images"></i></span><span class="mm-label">Журнал</span></a></li>
                            <li><a href="/lk/konkurs.php" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-compass"></i></span><span class="mm-label">Конкурс</span></a></li>
                            <li><a href="/lk/vehicles.php" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-folder-plus"></i></span><span class="mm-label"><b>Правка БД</b></span></a></li>
                            <li><a href="/lk/ticket.php" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-question-circle"></i></span><span class="mm-label">Мои заявки</span></a></li>
                            <li><a href="/lk/profile" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-cog"></i></span><span class="mm-label">Настройки профиля</span></a></li>
                            <li><a href="/search?id=<?=Auth::userid()?>" class="mm-item"><span class="mm-icon"><i class="far fa-sm fa-fw fa-images"></i></span><span class="mm-label">Мои фотографии</span></a></li>
                            <li><a href="/fav.php" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-star"></i></span><span class="mm-label">Избранные снимки</span></a></li>
                            <li><a href="/logout" class="mm-item"><span class="mm-icon"><i class="fas fa-sm fa-fw fa-sign-out-alt"></i></span><span class="mm-label">Выход</span></a></li>
                        </ul>
                    </div>
                </li>
            <?php } ?>

        </ul>
    </td>
</tr>
<?php
        if (explode('/', $_SERVER['REQUEST_URI'])[1] != 'photo') { ?>
<tr>
    <td><a href="/" id="title"><img style="width: <?=$width?>;" src="<?=$logo?>" alt="<?=$title?>"><span><?=$title?></span></a></td>
</tr>
<?php } ?>