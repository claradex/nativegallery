<?php

use \App\Services\{Auth, DB, Date, TaskScheduler};
use \App\Models\User;

$task = new TaskScheduler();

$contestCreate = true;
if (!$task->isTaskExists("ExecContests", "php ".$_SERVER['DOCUMENT_ROOT'].$task->findHandlerById(NGALLERY_TASKS, 'ExecContests'))) {
    $contestCreate = false;
}
?>


<tr>
    <td class="main">
        <h1><b>Фотоконкурсы</b></h1>
        <div class="v-header__tabs">
            <div class="v-tabs">
                <div class="v-tabs__scroll">
                    <div class="v-tabs__content"><a href="#" onclick="changeTab('contests')" id="contests" class="v-tab v-tab-b v-tab--active"><span class="v-tab__label">
                                Конкурсы
                            </span></a><a href="#" onclick="changeTab('categories')" id="categories" class="v-tab v-tab-b"><span class="v-tab__label">
                                Категории

                            </span></a>


                    </div>
                </div>
            </div>
        </div>
        <div class="kandle__block active__block" id="contests__block">
            <div class="p20w" style="display:block">
                <a data-bs-toggle="modal" data-bs-target="#createContest" href="#" class="btn btn-primary mt-3  <?php if ($contestCreate === false) {
                                                                                                                    echo 'disabled';
                                                                                                                } ?>">Провести новый</a>
                <table class="table">
                    <?php
                    if ($contestCreate === false) {
                        echo "<div class='alert alert-warning mt-3' role='alert'>У вас не добавлена задача на проведение конкурсов. Без неё, сервер не сможет завершать конкурс и проводить новый автоматически.<a href='/admin?type=Settings' type='button' style='margin-left: 5px;' class='btn btn-sm btn-outline-dark'>Включить</a></div>";
                    }
                    ?>
                    <tbody>
                        <tr>
                            <th width="100">ID</th>
                            <th width="25%">Тема</th>
                            <th>Дата начала отбора</th>
                            <th>Дата конца отбора</th>
                            <th>Дата начала</th>
                            <th>Дата конца</th>
                            <th>Статус</th>
                            <th></th>
                        </tr>
                        <?php
                        $themes = DB::query('SELECT * FROM contests ORDER BY id DESC');
                        foreach ($themes as $t) {
                            $themetitle = DB::query('SELECT title FROM contests_themes WHERE id=:id', array(':id' => $t['themeid']))[0]['title'];
                            if ($t['status'] === 0) {
                                $status = 'Ещё не проведён';
                            } else if ($t['status'] === 1) {
                                $status = 'Отбор кандидатов';
                            } else if ($t['status'] === 02) {
                                $status = 'Ещё не открыт для отбора победителей';
                            } else if ($t['status'] === 2) {
                                $status = 'Отбор победителей';
                            } else if ($t['status'] === 3) {
                                $status = 'Завершён';
                            } else {
                                $status = 'Сбой';
                            }
                            echo '<tr class="' . $color . '">
                            <td>' . $t['id'] . '</td>
                            <td>' . $themetitle . '</td>
                            <td>' . Date::zmdate($t['openpretendsdate']) . '</td>
                            <td>' . Date::zmdate($t['closepretendsdate']) . '</td>
                            <td>' . Date::zmdate($t['opendate']) . '</td>
                            <td>' . Date::zmdate($t['closedate']) . '</td>
                            <td>' . $status . '</td>
                            </tr>';
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="kandle__block" style="display: none;" id="categories__block">
            <div class="p20w" style="display:block">
                <a data-bs-toggle="modal" data-bs-target="#createContestTheme" href="#" class="btn btn-primary mt-3">Создать</a>
                <table class="table">
                    <tbody>
                        <tr>
                            <th width="100">ID</th>
                            <th width="50%">Название</th>
                            <th>В автоматическом отборе</th>
                            <th></th>
                        </tr>
                        <?php
                        $themes = DB::query('SELECT * FROM contests_themes');
                        foreach ($themes as $t) {
                            if ($t['status'] === 1) {
                                $auto = 'Да';
                            } else {
                                $auto = 'Нет';
                            }
                            echo '<tr class="' . $color . '">
                            <td>' . $t['id'] . '</td>
                            <td>' . $t['title'] . '</td>
                            <td>' . $auto . '</td>
                            </tr>';
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </td>
</tr>
<div class="modal fade" id="createContest" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Создание конкурса</b></h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="contest">
                    <div class="mb-3">
                        <label for="exampleFormControlTextarea1" class="form-label">Тематика</label>
                        <select name="themeid" class="form-select" aria-label="Default select example">
                            <?php
                            $themes = DB::query('SELECT * FROM contests_themes');
                            foreach ($themes as $t) {
                                echo '<option value="'.$t['id'].'">'.$t['title'].'</option>';
                            }
                            ?>
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="exampleFormControlTextarea1" class="form-label">Дата начала отбора претенднетов</label>
                                <input name="openpretendsdate" type="datetime-local" class="form-select">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="exampleFormControlTextarea1" class="form-label">Дата конца отбора претенднетов</label>
                                <input name="closepretendsdate" type="datetime-local" class="form-select">
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input name="startContestNow" class="form-check-input" type="checkbox" value="1" id="startContestNow">
                                <label class="form-check-label" for="startContestNow">
                                    Провести конкурс сразу после конца отбора претендентов
                                </label>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="contestStart" class="form-label">Дата начала проведения конкурса</label>
                                <input id="contestStartInput" name="opendate" type="datetime-local" class="form-select">
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label for="exampleFormControlTextarea1" class="form-label">Дата конца проведения конкурса</label>
                                <input name="closedate" type="datetime-local" class="form-select">
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>
                <a href="#" onclick="createContest(); return false;" data-bs-dismiss="modal" class="btn btn-primary">Добавить</a>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="createContestTheme" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Добавление категории конкурса</b></h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="contestTheme">
                    <div class="mb-3">
                        <label for="exampleFormControlTextarea1" class="form-label">Название</label>
                        <input class="form-control" id="exampleFormControlTextarea1" name="body">
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="1" name="active" id="flexCheckChecked" checked>
                        <label class="form-check-label" for="flexCheckChecked">
                            Активна для автоматического подбора
                        </label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>
                <a href="#" onclick="createContestTheme(); return false;" data-bs-dismiss="modal" class="btn btn-primary">Добавить</a>
            </div>
        </div>
    </div>
</div>



<script>
    $(document).ready(function() {
    $('#startContestNow').on('change', function() {
        $('#contestStartInput').prop('disabled', $(this).is(':checked'));
    });
});
    function createContestTheme() {
        var formData = new FormData(document.getElementById("contestTheme"));
        $.ajax({
            type: "POST",
            url: '/api/admin/contests/createtheme',
            data: formData,
            success: function(response) {
                var jsonData = JSON.parse(response);

                Notify.noty('success', 'OK!');


            },
            cache: false,
            contentType: false,
            processData: false
        });

    }

    function createContest() {
        var formData = new FormData(document.getElementById("contest"));
        $.ajax({
            type: "POST",
            url: '/api/admin/contests/create',
            data: formData,
            success: function(response) {
                var jsonData = JSON.parse(response);

                Notify.noty('success', 'OK!');


            },
            cache: false,
            contentType: false,
            processData: false
        });

    }
</script>