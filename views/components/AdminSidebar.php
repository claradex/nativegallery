<?php

use \App\Core\Page;
use \App\Services\DB;
$nonreviewedimgs = DB::query('SELECT COUNT(*) FROM photos WHERE moderated=0')[0]['COUNT(*)'];
                                if ($nonreviewedimgs > 0) {
                                    $nonr = '<span class="mm-notify notify-count">'.$nonreviewedimgs.'</span>';
                                }
?>

<ul class="list-unstyled fw-normal pb-1 small">

    <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if (!Page::exists('Admin/' . $_GET['type']) || !isset($_GET['type'])) { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="/admin" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>



            <svg style="margin-right: 10px; margin-left: -12px; margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if (!Page::exists('Admin/' . $_GET['type']) || !isset($_GET['type'])) { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <g>
                    <path d="M0,0h24v24H0V0z" fill="none" />
                </g>
                <g>
                    <path d="M10.25,13c0,0.69-0.56,1.25-1.25,1.25S7.75,13.69,7.75,13S8.31,11.75,9,11.75S10.25,12.31,10.25,13z M15,11.75 c-0.69,0-1.25,0.56-1.25,1.25s0.56,1.25,1.25,1.25s1.25-0.56,1.25-1.25S15.69,11.75,15,11.75z M22,12c0,5.52-4.48,10-10,10 S2,17.52,2,12S6.48,2,12,2S22,6.48,22,12z M20,12c0-0.78-0.12-1.53-0.33-2.24C18.97,9.91,18.25,10,17.5,10 c-3.13,0-5.92-1.44-7.76-3.69C8.69,8.87,6.6,10.88,4,11.86C4.01,11.9,4,11.95,4,12c0,4.41,3.59,8,8,8S20,16.41,20,12z" />
                </g>
            </svg>

            Пользователи
        </a></li>
        <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Photo') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Photo" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>

           
<svg style="margin-right: 10px; margin-left: -12px; margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Photo') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="12" cy="12" r="3"/><path d="M20 4h-3.17l-1.24-1.35c-.37-.41-.91-.65-1.47-.65H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
            Фотографии
        </a><?=$nonr?></li>



</ul>