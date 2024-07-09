<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Creator</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/5.1.3/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1 class="mb-4">Создание шаблона</h1>
        <div id="template-form">
            <div class="mb-3">
                <label for="key-name" class="form-label">Ключ</label>
                <input type="text" class="form-control" id="key-name">
            </div>
            <button id="add-key" class="btn btn-primary">Добавить ключ</button>
        </div>
        <hr>
        <h2 class="mt-4">Шаблоны</h2>
        <ul id="template-list" class="list-group"></ul>
        <button id="save-templates" class="btn btn-success mt-4">Сохранить шаблоны</button>
        <pre id="json-output" class="mt-4"></pre>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script>
$(document).ready(function () {
    const template = {};

    $('#add-key').on('click', function () {
        const key = $('#key-name').val();

        if (key) {
            template[key] = '';
            addKeyToTemplateList(key);
            $('#key-name').val('');
        }
    });

    $('#save-templates').on('click', function () {
        const json = JSON.stringify(template, null, 2);
        $('#json-output').text(json);
        saveTemplates(json);
    });

    function addKeyToTemplateList(key) {
        const templateList = $('#template-list');
        const listItem = `<li class="list-group-item">${key}</li>`;
        templateList.append(listItem);
    }

    function saveTemplates(json) {
        $.post('save_templates.php', { data: json }, function (response) {
            alert('Шаблоны сохранены!');
        });
    }
});



    </script>
</body>
</html>
