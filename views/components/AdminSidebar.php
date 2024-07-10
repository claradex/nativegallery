<?php

use \App\Core\Page;
?>

<ul class="list-unstyled fw-normal pb-1 small">

    <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if (!Page::exists('Settings/' . $_GET['type']) || !isset($_GET['type'])) { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="/settings" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>



            <svg style="margin-right: 10px; margin-left: -12px; margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if (!Page::exists('Settings/' . $_GET['type']) || !isset($_GET['type'])) { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <g>
                    <path d="M0,0h24v24H0V0z" fill="none" />
                </g>
                <g>
                    <path d="M10.25,13c0,0.69-0.56,1.25-1.25,1.25S7.75,13.69,7.75,13S8.31,11.75,9,11.75S10.25,12.31,10.25,13z M15,11.75 c-0.69,0-1.25,0.56-1.25,1.25s0.56,1.25,1.25,1.25s1.25-0.56,1.25-1.25S15.69,11.75,15,11.75z M22,12c0,5.52-4.48,10-10,10 S2,17.52,2,12S6.48,2,12,2S22,6.48,22,12z M20,12c0-0.78-0.12-1.53-0.33-2.24C18.97,9.91,18.25,10,17.5,10 c-3.13,0-5.92-1.44-7.76-3.69C8.69,8.87,6.6,10.88,4,11.86C4.01,11.9,4,11.95,4,12c0,4.41,3.59,8,8,8S20,16.41,20,12z" />
                </g>
            </svg>

            Общая информация
        </a></li>
        <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Photo') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Photo" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>

           
<svg style="margin-right: 10px; margin-left: -12px; margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Photo') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="12" cy="12" r="3"/><path d="M20 4h-3.17l-1.24-1.35c-.37-.41-.91-.65-1.47-.65H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
            Фотография
        </a></li>
    <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Account') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Account" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>

            <svg style="margin-right: 10px; margin-left: -12px;  margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Account') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <g>
                    <path d="M0,0h24v24H0V0z" fill="none" />
                </g>
                <g>
                    <g>
                        <path d="M10.67,13.02C10.45,13.01,10.23,13,10,13c-2.42,0-4.68,0.67-6.61,1.82C2.51,15.34,2,16.32,2,17.35V19c0,0.55,0.45,1,1,1 h8.26C10.47,18.87,10,17.49,10,16C10,14.93,10.25,13.93,10.67,13.02z" />
                        <circle cx="10" cy="8" r="4" />
                        <path d="M20.75,16c0-0.22-0.03-0.42-0.06-0.63l0.84-0.73c0.18-0.16,0.22-0.42,0.1-0.63l-0.59-1.02c-0.12-0.21-0.37-0.3-0.59-0.22 l-1.06,0.36c-0.32-0.27-0.68-0.48-1.08-0.63l-0.22-1.09c-0.05-0.23-0.25-0.4-0.49-0.4h-1.18c-0.24,0-0.44,0.17-0.49,0.4 l-0.22,1.09c-0.4,0.15-0.76,0.36-1.08,0.63l-1.06-0.36c-0.23-0.08-0.47,0.02-0.59,0.22l-0.59,1.02c-0.12,0.21-0.08,0.47,0.1,0.63 l0.84,0.73c-0.03,0.21-0.06,0.41-0.06,0.63s0.03,0.42,0.06,0.63l-0.84,0.73c-0.18,0.16-0.22,0.42-0.1,0.63l0.59,1.02 c0.12,0.21,0.37,0.3,0.59,0.22l1.06-0.36c0.32,0.27,0.68,0.48,1.08,0.63l0.22,1.09c0.05,0.23,0.25,0.4,0.49,0.4h1.18 c0.24,0,0.44-0.17,0.49-0.4l0.22-1.09c0.4-0.15,0.76-0.36,1.08-0.63l1.06,0.36c0.23,0.08,0.47-0.02,0.59-0.22l0.59-1.02 c0.12-0.21,0.08-0.47-0.1-0.63l-0.84-0.73C20.72,16.42,20.75,16.22,20.75,16z M17,18c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S18.1,18,17,18z" />
                    </g>
                </g>
            </svg>
            Аккаунт
        </a></li>
    <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Privacy') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Privacy" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>

            <svg style="margin-right: 10px; margin-left: -12px;  margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Privacy') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12.65 10C11.7 7.31 8.9 5.5 5.77 6.12c-2.29.46-4.15 2.29-4.63 4.58C.32 14.57 3.26 18 7 18c2.61 0 4.83-1.67 5.65-4H17v2c0 1.1.9 2 2 2s2-.9 2-2v-2c1.1 0 2-.9 2-2s-.9-2-2-2h-8.35zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
            </svg>


            Приватность
        </a></li>
        <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Notifications') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Notifications" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>

            <svg style="margin-right: 10px; margin-left: -12px; " xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Notifications') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M18 16v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.68-1.5-1.51-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-1.3 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16zm-6.01 6c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zM6.77 4.73c.42-.38.43-1.03.03-1.43-.38-.38-1-.39-1.39-.02C3.7 4.84 2.52 6.96 2.14 9.34c-.09.61.38 1.16 1 1.16.48 0 .9-.35.98-.83.3-1.94 1.26-3.67 2.65-4.94zM18.6 3.28c-.4-.37-1.02-.36-1.4.02-.4.4-.38 1.04.03 1.42 1.38 1.27 2.35 3 2.65 4.94.07.48.49.83.98.83.61 0 1.09-.55.99-1.16-.38-2.37-1.55-4.48-3.25-6.05z" />
            </svg>


            Уведомления
        </a></li>
        <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Sessions') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Sessions" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>

            
<svg style="margin-right: 10px; margin-left: -12px; margin-bottom: -5px; " xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Sessions') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 7c0-.55.45-1 1-1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-1.1 0-2 .9-2 2v11h-.5c-.83 0-1.5.67-1.5 1.5S.67 20 1.5 20H14v-3H4V7zm19 1h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z"/></svg>


           Сессии
        </a></li>
    <!--li><a style="font-size: 17.2px; margin-bottom: 15px; color: #636364 !important;" href="/my/?page=support" class="d-inline-flex align-items-center rounded active text-black" aria-current="page"><div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div><img src="/static/img/support.svg" style="font-size: 25px; margin-right: 10px; margin-left: -12px; filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(137deg) brightness(103%) contrast(102%);">Support</a></li-->
    <li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'BlackList') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=BlackList" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>
            <svg style="margin-right: 10px; margin-left: -12px; margin-bottom: -5px;" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'BlackList') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11H8c-.55 0-1-.45-1-1s.45-1 1-1h8c.55 0 1 .45 1 1s-.45 1-1 1z" />
            </svg>
            Чёрный список
        </a></li>
        <!--li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Emoji') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Emoji" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>
            <svg style="margin-right: 10px; margin-left: -12px;" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Emoji') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>"><g><rect fill="none" height="24" width="24"/><rect fill="none" height="24" width="24"/></g><g><g/><path d="M11.99,2C6.47,2,2,6.48,2,12c0,5.52,4.47,10,9.99,10C17.52,22,22,17.52,22,12C22,6.48,17.52,2,11.99,2z M8.5,8 C9.33,8,10,8.67,10,9.5S9.33,11,8.5,11S7,10.33,7,9.5S7.67,8,8.5,8z M16.71,14.72C15.8,16.67,14.04,18,12,18s-3.8-1.33-4.71-3.28 C7.13,14.39,7.37,14,7.74,14h8.52C16.63,14,16.87,14.39,16.71,14.72z M15.5,11c-0.83,0-1.5-0.67-1.5-1.5S14.67,8,15.5,8 S17,8.67,17,9.5S16.33,11,15.5,11z"/></g></svg>
            Эмодзи
        </a></li-->


        <!--li><a style="font-size: 17.2px; margin-bottom: 15px; color: <?php if ($_GET['type'] === 'Verification') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?> !important; font-weight: 500;" href="?type=Verification" class="d-inline-flex align-items-center rounded active text-black" aria-current="page">
            <div style="border-left:3px solid #ffffff00; margin-left: -25px; margin-right: 20px; height:20px; border-radius: 500px;"></div>


            <svg style="margin-right: 10px; margin-left: -12px;" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="<?php if ($_GET['type'] === 'Verification') { ?> #3862eb <?php } else { ?> #aca8a9 <?php } ?>">
                <g>
                    <rect fill="none" height="24" width="24" />
                    <rect fill="none" height="24" width="24" />
                </g>
                <g>
                    <path d="M23,12l-2.44-2.79l0.34-3.69l-3.61-0.82L15.4,1.5L12,2.96L8.6,1.5L6.71,4.69L3.1,5.5L3.44,9.2L1,12l2.44,2.79l-0.34,3.7 l3.61,0.82L8.6,22.5l3.4-1.47l3.4,1.46l1.89-3.19l3.61-0.82l-0.34-3.69L23,12z M9.38,16.01L7,13.61c-0.39-0.39-0.39-1.02,0-1.41 l0.07-0.07c0.39-0.39,1.03-0.39,1.42,0l1.61,1.62l5.15-5.16c0.39-0.39,1.03-0.39,1.42,0l0.07,0.07c0.39,0.39,0.39,1.02,0,1.41 l-5.92,5.94C10.41,16.4,9.78,16.4,9.38,16.01z" />
                </g>
            </svg>
            Верификация
        </a></li-->


</ul>