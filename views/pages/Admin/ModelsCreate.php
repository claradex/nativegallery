<?php

use \App\Services\{Auth, DB};
use \App\Models\{User, Vehicle};


$vehicle = DB::query('SELECT * FROM entities WHERE id=:id', array(':id' => $_GET['id']))[0];

if (isset($_POST['create'])) {
    $postData = $_POST;

    $result = [];

    foreach ($postData as $key => $value) {
        if (strpos($key, 'variable') === 0) {
            preg_match('/_(\d+)$/', $key, $matches);
            if (isset($matches[1])) {
                $index = $matches[1];

                if (!isset($result[$index])) {
                    $result[$index] = [];
                }
                $newKey = preg_replace('/^variable/', '', $key);
                $newKey = preg_replace('/_\d+$/', '', $newKey);

                $result[$index][$newKey] = $value;
            }
        }
    }

    $jsonResult = json_encode($result, JSON_PRETTY_PRINT);

    DB::query('INSERT INTO entities VALUES (\'0\', :title, :createdate, :sampledata, :color)', array(':title' => $_POST['title'], ':createdate' => time(), ':sampledata' => $jsonResult, ':color' => $_POST['color']));
    header('Location: /admin?type=Entities');
}
?>
<h1><b>Создание модели</b></h1>
<label>Сущность</label>
<select id="entitySelect" class="form-select" aria-label="Default select example">
    <option selected disabled>Выберите сущность</option>
    <?php
    $datad = DB::query('SELECT * FROM entities');
    foreach ($datad as $d) {
        echo '<option value="' . $d['id'] . '" style="background-color: ' . $d['color'] . '">' . $d['title'] . '</option>';
    }
    ?>


</select>
<form action="/admin?type=EntityCreate" method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block; min-width:500px;">



    <button id="addButton" type="submit" name="create" class="btn btn-primary mt-5">Добавить модель</button>


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
                        document.getElementById('form').innerHTML = '';
                        document.getElementById('form').innerHTML = '<button id="addButton" type="submit" name="create" class="btn btn-primary mt-5">Добавить модель</button>';

                        document.getElementById('form').insertAdjacentHTML('afterbegin', xhr.responseText);

                    } else {
                        console.error('Ошибка при загрузке данных:', xhr.statusText);
                    }
                }
            };

            xhr.send();
        }
    });
</script>