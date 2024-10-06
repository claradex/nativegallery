<?php

use \App\Services\{Auth, DB};
use \App\Models\User;

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
<h1><b>Создание сущности</b></h1>
<form action="/admin?type=EntityCreate" method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block; min-width:500px;">

    <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">Название</label>
        <input type="text" name="title" class="form-control" id="exampleFormControlInput1" placeholder="Вагон метро">
    </div>
   <div class="mb-3">
   <label for="exampleColorInput" class="form-label">Цвет</label>
   <input name="color" type="color" class="form-control form-control-color" id="exampleColorInput" value="#563d7c" title="Choose your color">
   </div>
  
    <p>Вводимые переменные</p>
    <div class="alert alert-dark" role="alert">
        Добавляйте и регулируйте поля ввода, которые будут являться шаблонной формой для создания моделей к сущности.
    </div>
    <div class="row" id="entityform">
        <div class="col-md-3">
            <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Название переменной</label>
                <input name="variablename_1" type="text" class="form-control" id="exampleFormControlInput1" placeholder="#FFFFFF">
            </div>
        </div>
        <div class="col-md-3">
            <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">ID</label>
                <input name="variableid_1" type="text" class="form-control" id="exampleFormControlInput1" placeholder="blablabla">
            </div>
        </div>
        <div class="col-md-3">
            <label for="exampleFormControlInput1" class="form-label">Тип</label>
            <select name="variabletype_1" class="form-select" aria-label="Default select example">
                <option value="1">Строка</option>
                <option value="2">Число</option>
            </select>
        </div>
        <div class="col-md-3">
            <label for="exampleFormControlInput1" class="form-label">Обязателен?</label>
            <select name="variableimportant_1" class="form-select" aria-label="Default select example">
                <option value="1">Да</option>
                <option value="2">Нет</option>
            </select>
        </div>
    </div>
    <button id="addButton" type="button" class="btn btn-outline-primary">Добавить ещё</button>
    <button id="addButton" type="submit" name="create" class="btn btn-primary">Создать сущность</button>
    </div>


</form>

<script>
    let count = 1; // Начальное значение для номера переменной

    document.getElementById('addButton').addEventListener('click', function() {
        count++; // Увеличиваем номер переменной

        // Создаем новый элемент
        const newElement =
            `<div class="col-md-3">
            <div class="mb-3">
                <label for="exampleFormControlInput${count}" class="form-label">Название переменной</label>
                <input name="variablename_${count}" type="text" class="form-control" id="exampleFormControlInput${count}" placeholder="#FFFFFF">
            </div>
        </div>
        <div class="col-md-3">
            <div class="mb-3">
                <label for="exampleFormControlInput${count}" class="form-label">ID</label>
                <input name="variableid_${count}" type="text" class="form-control" id="exampleFormControlInput${count}" placeholder="blablabla">
            </div>
        </div>
        <div class="col-md-3">
            <label for="exampleFormControlInput${count}" class="form-label">Тип</label>
            <select name="variabletype_${count}" class="form-select" aria-label="Default select example">
                <option value="1">Строка</option>
                <option value="2">Число</option>
            </select>
        </div>
        <div class="col-md-3">
            <label for="exampleFormControlInput${count}" class="form-label">Обязателен?</label>
            <select name="variableimportant_${count}" class="form-select" aria-label="Default select example">
                <option value="1">Да</option>
                <option value="2">Нет</option>
            </select>
        </div>`;

        // Добавляем новый элемент в #entityform
        document.getElementById('entityform').insertAdjacentHTML('beforeend', newElement);
    });
</script>