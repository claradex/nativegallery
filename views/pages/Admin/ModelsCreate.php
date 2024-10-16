<?php

use \App\Services\{Auth, DB};
use \App\Models\{User, Vehicle};


$vehicle = DB::query('SELECT * FROM entities WHERE id=:id', array(':id' => $_GET['id']))[0];

if (isset($_POST['create'])) {

    $inputs = $_POST;

    $filteredInputs = [];
    foreach ($inputs as $key => $value) {
        if (strpos($key, 'modelinput_') === 0) {
            $filteredInputs[$key] = $value;
        }
    }
    ksort($filteredInputs);
    $result = [];
    
    $counter = 1;
    
    foreach ($filteredInputs as $key => $value) {
        $result[$counter] = [
            'value' => $value
        ];
        $counter++;
    }
    $jsonResult = json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
    
    DB::query('INSERT INTO entities_data VALUES (\'0\', :title, :createdate, :entityid, :comment, :content)', array(':title' => $_POST['title'], ':createdate'=>time(), ':entityid' => $_POST['entityid'], ':content' => $jsonResult, ':comment' => $_POST['comment']));
    header('Location: /admin?type=Models');
}
?>
<h1><b>Создание модели</b></h1>

<form action="/admin?type=ModelsCreate" method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block; min-width:500px;">
    <div id="inputsMain">
    <label>Сущность</label>
    
    <select name="entityid" id="entitySelect" class="form-select" aria-label="Default select example" required>
        <option selected disabled value="">Выберите сущность</option>
        <?php
        $datad = DB::query('SELECT * FROM entities');
        foreach ($datad as $d) {
            echo '<option value="' . $d['id'] . '" style="background-color: ' . $d['color'] . '">' . $d['title'] . '</option>';
        }
        ?>


    </select>
    
    <div class="mt-3">
        <label for="exampleFormControlInput1" class="form-label">Название</label>
        <input type="text" name="title" class="form-control" id="exampleFormControlInput1" required="">
    </div>
    <div class="mt-3">
        <label for="exampleFormControlInput1" class="form-label">Описание</label>
        <input type="text" name="comment" class="form-control" id="exampleFormControlInput1" required="">
    </div>
    </div>
    <div id="mainContent">

    </div>


   


</form>


<script>
    document.getElementById('entitySelect').addEventListener('change', function() {
        const selectedValue = this.value;

        if (selectedValue) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', "/api/admin/getvehicleinputs/" + selectedValue, true);

            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        document.getElementById('mainContent').innerHTML = '';
                        document.getElementById('mainContent').innerHTML = '<button id="addButton" type="submit" name="create" class="btn btn-primary mt-5">Добавить модель</button>';

                        document.getElementById('mainContent').insertAdjacentHTML('afterbegin', xhr.responseText);

                    } else {
                        console.error('Ошибка при загрузке данных:', xhr.statusText);
                    }
                }
            };

            xhr.send();
        }
    });
</script>