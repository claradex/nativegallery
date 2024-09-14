<?php

?>
<h1><b>Создание сущности</b></h1>
<form action="/admin?type=UserEdit&user_id=<?= $_GET['user_id'] ?>" method="post" name="form" id="form" enctype="multipart/form-data" style="display:inline-block; min-width:500px;">

    <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">Название</label>
        <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="Вагон метро">
    </div>
    <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">Цвет</label>
        <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="#FFFFFF">
    </div>
    <p>Вводимые переменные</p>
    <div class="alert alert-dark" role="alert">
        Добавляйте и регулируйте поля ввода, которые будут являться шаблонной формой для создания моделей к сущности.
    </div>
    <div class="row">
        <div class="col-md-3">
            <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">Название переменной</label>
                <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="#FFFFFF">
            </div>
        </div>
        <div class="col-md-3">
            <div class="mb-3">
                <label for="exampleFormControlInput1" class="form-label">ID</label>
                <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="#FFFFFF">
            </div>
        </div>
        <div class="col-md-3">
        <label for="exampleFormControlInput1" class="form-label">Тип</label>
            <select class="form-select" aria-label="Default select example">
                <option value="1">Строка</option>
                <option value="2">Число</option>
            </select>
        </div>
        <div class="col-md-3">
        <label for="exampleFormControlInput1" class="form-label">Обязателен?</label>
            <select class="form-select" aria-label="Default select example">
                <option value="1">Да</option>
                <option value="2">Нет</option>
            </select>
        </div>
    </div>
    <button type="button" class="btn btn-outline-primary">Добавить ещё</button>
    </div>
    

</form>