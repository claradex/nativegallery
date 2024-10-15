<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Face Detection with TensorFlow.js</title>
</head>
<body>
    <h1>Face Detection using TensorFlow.js</h1>
    <input type="file" id="imageUpload" accept="image/*">
    <br><br>
    <canvas style="width: 100px;" id="canvas"></canvas>
    <br><br>
    <div id="inputFields"></div> <!-- Контейнер для динамически создаваемых полей ввода -->
    <br>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
    <script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/blazeface"></script>
    <script>
        // app.js
const imageUpload = document.getElementById('imageUpload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const inputFieldsContainer = document.getElementById('inputFields');

// Переменная для хранения модели
let model;

// Функция для загрузки модели
async function loadModel() {
    model = await blazeface.load();
    console.log("BlazeFace model loaded");
}

// Функция для распознавания лиц
async function detectFaces(image) {
    const predictions = await model.estimateFaces(image, false);
    return predictions;
}

// Загрузка модели при инициализации
loadModel();

imageUpload.addEventListener('change', async () => {
    const file = imageUpload.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Очищаем предыдущие поля ввода
        inputFieldsContainer.innerHTML = '';

        // Используем кэшированную модель для распознавания
        const predictions = await detectFaces(img);

        if (predictions.length > 0) {
            predictions.forEach((prediction, index) => {
                // Получаем координаты лица
                const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight).flat();
                
                // Рисуем рамку вокруг лица
                ctx.beginPath();
                ctx.rect(x, y, width - x, height - y);
                ctx.lineWidth = 3;
                ctx.strokeStyle = 'red';
                ctx.stroke();

                // Добавляем номер лица на изображении
                ctx.fillStyle = 'red';
                ctx.font = '16px Arial';
                ctx.fillText(`Лицо ${index + 1}`, x, y > 10 ? y - 10 : 10);

                // Создаем поле ввода для каждого распознанного лица
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.placeholder = `Информация о лице ${index + 1}`;
                inputFieldsContainer.appendChild(inputField);
                inputFieldsContainer.appendChild(document.createElement('br'));
            });
        } else {
            alert('No faces detected');
        }
    };
});

    </script>
</body>
</html>
