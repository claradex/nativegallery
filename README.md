# NativeGallery
![](https://raw.githubusercontent.com/claradex/nativegallery/main/static/img/banner.png)
NativeGallery - это реверсивный open-source движок популярного сайта transphoto.org (СТТС), RailGallery, Fotobus и ему подобных.




# Почему я должен использовать ваш движок?
* **Свобода**: СТТС не предоставляет всем свой исходный код для создания отдельных подобных ему сайтов. С NativeGallery вы сможете обойти это предпятствие!
* **Гибкость**: Настраивайте сайт по вашим предпочтениям: управляйте приватностью разделов, настраивайте дизайн сайта, назначайте администраторов, фотомодераторов и многое другое!
* **Скорость**: Движок оптимизирован под последнюю версию PHP 8.3 и MariaDB 10!

# Системные требования
Мы настоятельно рекомендуем устанавливать движок на VPS/VDS/выделенный сервер. Поддержка на Shared-хостингах не осуществляется!

**Операционная система**: Ubuntu 20.04 и выше\
**PHP:** 8.3 и выше\
**База данных**: MySQL 8.0 и выше

# Статус функционала
### Обязательные к выполнению функции
- [x] Авторизация, Регистрация
- [x] Просмотр профилей
- [ ] Публикация фото:
  - [x] Привязка сущности (Транспортное Средство, Поезд, Самокат, Камень и прочее)
  - [x] Загрузка фото
  - [ ] GeoDB
  - [x] Геометка
  - [ ] Направление съёмки
  - [ ] Состояние фотографии
    - [x] Временная публикация
    - [x] Условная публикация
    - [x] Техническая публикация
    - [ ] Требует исправления
    - [ ] Возможность создания своих статусов
  - [x] Галереи
  - [x] Вид сущности (Трамвай, Метрополитен, Троллейбус и т.д)
- [ ] GeoDB
- [ ] Фотоконкурс
- [ ] Поиск
  - [ ] Поиск по критериям
    - [ ] Дата публикации
    - [ ] Дата съёмки
    - [x] Поиск фотографий пользователя
- [ ] Сущности
  - [x] Страница сущности
  - [x] Статус (Эксплуатируется, списан и прочее)
  - [ ] Привязка к номеру
- [ ] Фотографии:
  - [x] Просмотр
  - [x] Рейтинг
  - [x] Комментирование
  - [x] Рейтинг комментариев
  - [x] Избранные фотографии
  - [x] Полноценный EXIF
  - [x] Модерация
  - [ ] Редактирование
  - [ ] Примечания (для сущностей)
- [ ] Обновления:
  - [x] Новые фотографии
  - [x] Новые фотографии из подписок
  - [ ] Новые фотографии по городам (требуется GeoDB)
- [ ] Комментарии:
  - [x] Публикация
  - [ ] Модерация
  - [x] Рейтинг
  - [ ] BB-коды
  - [ ] Форматирование
  - [x] Удаление
  - [x] Редактирование
### Необязательные, но будет неплохо их сделать тоже
  - [ ] Авторизация
    - [ ] Через Telegram
    - [ ] Через ВКонтакте
    - [ ] Через Google
    - [ ] Через Яндекс
    - [ ] Через Twitter
    - [ ] Через Facebook
    - [ ] Через Discord
    - [ ] Через Steam (?!)
    - [ ] Сторонняя авторизация через API
  - [ ] Автоматическое обновление движка через Админ-панель
  - [ ] СТТС.Клуб (Native Clubs)
    - [ ] Отметки людей на фотографиях
    - [ ] Прямой эфир (https://sttsclub.ru/live/)
  - [ ] СТТС.Форум (NativeGallery Forum)
  - [ ] Экспорт всех фотографий и данных с аккаунта




# Установка
* Убедитесь, что вы предварительно установили на своём сервере PHP 8.3, MySQL версии 8.0 и выше.
* Можно использовать любой сервер, совместимый с htaccess. Можно NGINX, но тогда конфигурацию придется под него адаптировать.
* Скачайте или склонируйте репозиторий 
* Распакуйте архив на своём сервере
* Пропишите ```composer instal``` в терминале, находясь в папке своего проекта для установки зависимостей
* Импортируйте файлы SQL в вашу базу данных из папки /sqlcore
* Переименуйте ngallery-example.yaml в ngallery.yaml и сконфигурируйте ваш сервер NativeGallery.
* Если вы всё сделали правильно, то вы увидите пустую главную страницу вашей галереи.
* Готово! Ваш сервер NativeGallery (aka СТТС) готов к работе.
