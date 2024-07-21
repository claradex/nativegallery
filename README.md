# NativeGallery
![](https://raw.githubusercontent.com/claradex/nativegallery/main/static/img/banner.png)
NativeGallery - это реверсивный open-source движок популярного сайта transphoto.org (СТТС) и ему подобных.

## ❗ Движок находится в разработке. Некоторые функции, которые присутствуют на оригинальных галереях могут отличаться от функционала NativeGallery или отсуствовать совсем. Пожалуйста, оставляйте найденные баги и свои пожелания в Issues.

### Почему я должен использовать ваш движок?
* **Свобода**: СТТС не предоставляет всем свой исходный код для создания отдельных подобных ему сайтов. С NativeGallery вы сможете обойти это предпятствие!
* **Гибкость**: Настраивайте сайт по вашим предпочтениям: управляйте приватностью разделов, настраивайте дизайн сайта, назначайте администраторов, фотомодераторов и многое другое!
* **Скорость**: Движок оптимизирован под последнюю версию PHP 8.3 и MariaDB 10!

### Системные требования
Мы настоятельно рекомендуем устанавливать движок на VPS/VDS/выделенный сервер. Поддержка на Shared-хостингах не осуществляется!

**Операционная система**: Ubuntu 20.04 и выше\
**PHP:** 8.3 и выше
**База данных**: MySQL 8.0 и выше

### Статус функционала
- [x] Авторизация, Регистрация
- [x] Просмотр профилей
- [ ] Публикация фото:
  - [ ] Привязка сущности (Транспортное Средство, Поезд, Самокат, Камень и прочее)
  - [x] Загрузка фото
  - [ ] GeoDB
  - [x] Геометка
  - [ ] Направление съёмки
  - [ ] Галереи
  - [ ] Вид сущности (Трамвай, Метрополитен, Троллейбус и т.д)
- [ ] GeoDB
- [ ] Фотоконкурс
- [ ] Поиск
  - [ ] Поиск по критериям
    - [ ] Дата публикации
    - [ ] Дата съёмки
    - [x] Поиск фотографий пользователя
- [ ] Сущности
  - [ ] Страница сущности
  - [ ] Статус (Эксплуатируется, списан и прочее)
  - [ ] Привязка к номеру
- [ ] Фотографии:
  - [x] Просмотр
  - [x] Рейтинг
  - [x] Комментирование
  - [x] Рейтинг комментариев
  - [ ] Полноценный EXIF
  - [ ] Модерация
  - [ ] Редактирование
  - [ ] Примечания (для сущностей)
- [ ] Обновления:
  - [ ] Новые фотографии
  - [ ] Новые фотографии из подписок
  - [ ] Новые фотографии по городам (требуется GeoDB)
- [ ] Комментарии:
  - [x] Публикация
  - [ ] Модерация
  - [ ] Рейтинг
  - [ ] BB-коды
  - [ ] Форматирование
  - [ ] Удаление
  - [ ] Редактирование





### Установка
* Убедитесь, что вы предварительно установили на своём сервере PHP 8.3, MySQL версии 8.0 и выше.
* Можно использовать любой сервер, совместимый с htaccess. Можно NGINX, но тогда конфигурацию придется под него адаптировать.
* Скачайте или склонируйте репозиторий 
* Распакуйте архив на своём сервере
* Пропишите ```composer instal``` в терминале, находясь в папке своего проекта для установки зависимостей
* Импортируйте файлы SQL в вашу базу данных из папки /sqlcore
* Переименуйте ngallery-example.yaml в ngallery.yaml и сконфигурируйте ваш сервер NativeGallery.
* Если вы всё сделали правильно, то вы увидите пустую главную страницу вашей галереи.
* Готово! Ваш сервер СТТС готов к работе.
