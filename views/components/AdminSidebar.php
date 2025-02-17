<?php

use \App\Core\Page;
use \App\Services\DB;
$nonreviewedimgs = DB::query('SELECT COUNT(*) FROM photos WHERE moderated=0')[0]['COUNT(*)'];
                                if ($nonreviewedimgs > 0) {
                                    $nonr = '<span class="badge text-bg-danger">'.$nonreviewedimgs.'</span>';
                                }
?>
<link rel="stylesheet" href="https://rsms.me/inter/inter.css">
<style>
    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap");
body {
    font-family: Inter !important;
}

</style>
<script src="/static/js/changeTab.js" defer></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/boxicons@latest/css/boxicons.min.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-gH2yIJqKdNHPEq0n4Mqa/HGKIhSkIHeL5AyhkYV8i59U5AR6csBvApHHNl/vI1Bx" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.5/dist/umd/popper.min.js" integrity="sha384-Xe+8cL9oJa6tN/veChSP7q+mnSPaj5Bcu9mPX5F5xIGE0DVittaqT5lorf0EI7Vk" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0/dist/js/bootstrap.min.js" integrity="sha384-ODmDIVzN+pFdexxHEHFBQH3/9/vQ9uori45z4JjnFsRydbmQbmL5t1tQ0culUzyK" crossorigin="anonymous"></script>
<link rel="stylesheet" href="/static/css/header.admin.css">
<link rel="stylesheet" href="/static/css/tabs.css">
<div class="layout__left-column layout__sticky">
 <header style="background-color: #0d1012;" class="header">
            <div class="header__container">


              
    
                <div class="header__toggle">
                    <i class='bx bx-menu' id="header-toggle"></i>
                </div>
            </div>
        </header>

    <div class="nav" id="navbar">

        <nav class="nav__container">
            <div>
                <a href="/admin" class="nav__link nav__logo">
                    <h5><b><?=NGALLERY['root']['title']?></b></h5>
                </a>



                

                <div class="nav__list">

                    <div class="nav__items">
                        <h3 class="nav__subtitle"></h3>

                        <a href="/admin" class="nav__link">
                            <i class="bx bx-user-pin nav__icon"></i>
                            <span class="nav__name">Пользователи</span>
                        </a>
                        <a href="/admin?type=Photo" class="nav__link">
                            <i class="bx bx-camera nav__icon"></i>
                            <span class="nav__name">Фотографии<?=$nonr?></span>
                        </a>
                        <a href="/admin?type=Galleries" class="nav__link">
                            <i class="bx bx-images nav__icon"></i>
                            <span class="nav__name">Галереи</span>
                        </a>
                        <a href="/admin?type=News" class="nav__link">
                            <i class="bx bx-news nav__icon"></i>
                            <span class="nav__name">Новости сайта</span>
                        </a>
                        <a href="/admin?type=Contests" class="nav__link">
                            <i class="bx bx-party nav__icon"></i>
                            <span class="nav__name">Фотоконкурсы <span class="badge text-bg-warning">BETA</span></span>
                        </a>
                        <a href="/admin?type=Entities" class="nav__link">
                            <i class="bx bx-package nav__icon"></i>
                            <span class="nav__name">Сущности</span>
                        </a>
                        <a href="/admin?type=Models" class="nav__link">
                            <i class="bx bx-data nav__icon"></i>
                            <span class="nav__name">База моделей</span>
                        </a>
                        <a href="/admin?type=GeoDB" class="nav__link">
                            <i class="bx bx-world nav__icon"></i>
                            <span class="nav__name">GeoDB<span class="badge text-bg-warning">BETA</span></span>
                        </a>
                        <!--a href="/admin?type=Pages" class="nav__link">
                            <i class="bx bx-file-blank nav__icon"></i>
                            <span class="nav__name">Страницы</span>
                        </!--a-->
                        <a href="/admin?type=Settings" class="nav__link">
                            <i class="bx bx-cog nav__icon"></i>
                            <span class="nav__name">Настройки<span class="badge text-bg-warning">BETA</span></span>
                        </a>
                       

                    </div>
                    
                </div>
            </div>

        </nav>
    </div>
</div>
        <script>
        /*==================== SHOW NAVBAR ====================*/
const showMenu = (headerToggle, navbarId) =>{
    const toggleBtn = document.getElementById(headerToggle),
    nav = document.getElementById(navbarId)
    
    // Validate that variables exist
    if(headerToggle && navbarId){
        toggleBtn.addEventListener('click', ()=>{
            // We add the show-menu class to the div tag with the nav__menu class
            nav.classList.toggle('show-menu')
            // change icon
            toggleBtn.classList.toggle('bx-x')
        })
    }
}
showMenu('header-toggle','navbar')

/*==================== LINK ACTIVE ====================*/
const linkColor = document.querySelectorAll('.nav__link')

function colorLink(){
    linkColor.forEach(l => l.classList.remove('active'))
    this.classList.add('active')
}

linkColor.forEach(l => l.addEventListener('click', colorLink))
</script>