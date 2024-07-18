<?php
use App\Services\{Router, Auth};

$user = new \App\Models\User(Auth::userid());

if (!isset($_GET['type']) || $_GET['type'] != 'Photo') {
    if ($user->i('admin') === 2) {
        header('Location: ?type=Photo');
    }
}

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
    <div id="backgr"></div>
    <tr>
    <td class="main">
        <style>
            .fw-normal {
    font-weight: 400 !important;
}
.pb-1 {
    padding-bottom: .25rem !important;
}
.list-unstyled {
    padding-left: 0;
    list-style: none;
}
.row {
    --bs-gutter-x: 1.5rem;
    --bs-gutter-y: 0;
    display: flex;
    flex-wrap: wrap;
    margin-top: calc(-1* var(--bs-gutter-y));
    margin-right: calc(-.5* var(--bs-gutter-x));
    margin-left: calc(-.5* var(--bs-gutter-x));
}
@media (min-width: 768px) {
    .col-md-3 {
        flex: 0 0 auto;
        width: 25%;
    }
.col-md-9 {
        flex: 0 0 auto;
        width: 75%;
    }
}

</style>

    <div id="container-app">
        <div class="container mt-3">
            
            <div class="row mt-3">
            
                <div class="col-md-3">

                    <div style="top: 1rem; margin-left: 15px;">

                        <aside style="background-color: #ffffff00 !important;" class="bd-sidebar">
                            <nav class="bd-links" id="bd-docs-nav" aria-label="Docs navigation">
                                <ul class="list-unstyled mb-0 py-3 pt-md-1">
                                    <li class="mb-1">


                                        <div class="collapse show" id="getting-started-collapse">
                                            <?=\App\Controllers\AdminController::loadMenu();?>
                                            
                                        </div>
                                    </li>

                                </ul>
                            </nav>

                        </aside>
                    </div>
                </div>
                <div class="col-md-9">
                <?=\App\Controllers\AdminController::loadContent();?>      </div>
            </div>
        </div>
    </div></td></tr>
    </table>
    <br><br><br>
            <script src="/static/js/ripple.js"></script>
</body>

</html>