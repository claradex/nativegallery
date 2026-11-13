'use client';

import './TourContent.css';
import { useState } from 'react';

export function TourContent({ title }: { title: string }) {
  const [activeTab, setActiveTab] = useState('start');
  return (
<tr>
    <td className="main">
      

        <div className="wrap2">
            <div className="wrap1">
                <div id="auth" className="page-wrap">
                    <div className="page_content">
                        <div id="tour">
                            <div className="rightNav">
                                <h1>Экскурсия по сайту</h1>
                                <div className="rightLinks">
                                    <div className="tab">
                                        <button className={activeTab === 'start' ? 'tablinks active' : 'tablinks'} data-tour-tab="start" onClick={() => setActiveTab('start')} id="defaultOpen">
                                            <div className="tabicon"><img src="https://ovk.to/assets/packages/static/openvk/img/icons/1.svg" width="16" height="16" /></div>Начало
                                        </button>
                                        <button className={activeTab === 'profile' ? 'tablinks active' : 'tablinks'} data-tour-tab="profile" onClick={() => setActiveTab('profile')}>
                                            <div className="tabicon"><img src="https://ovk.to/assets/packages/static/openvk/img/icons/2.svg" width="16" height="16" /></div>Профиль
                                        </button>
                                        <button className={activeTab === 'photos' ? 'tablinks active' : 'tablinks'} data-tour-tab="photos" onClick={() => setActiveTab('photos')}>
                                            <div className="tabicon"><img src="https://ovk.to/assets/packages/static/openvk/img/icons/3.svg" width="16" height="16" /></div>Фотографии и Видео
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div id="start" className="tabcontent" style={{ display: activeTab === 'start' ? 'block' : 'none' }}>
                                <h2>С чего начать?</h2>
                                <ul className="listing">
                                    <li><span>Регистрация аккаунта является самым первым и основным этапом в начале вашего пути на данном сайте.</span></li>
                                    <li><span>Для регистрации вам потребуется ввести Логин, E-mail и пароль.</span></li>
                                    <li><span>В качестве логина для входа на сайт, Вы можете использовать свой E-mail или никнейм, указанный при регистрации.</span></li>
                                </ul>
                                <img src="/static/img/tour1.png" width="440" />
                                <p className="big">Регистрируясь на сайте, вы соглашаетесь с <a href="/rules">правилами сайта</a></p>
                                <div style={{"marginTop":"10px","paddingLeft":"175px"}}>
                                </div>
                                <br />
                            </div>
                            <div id="profile" className="tabcontent" style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
                                <h2>Ваш профиль</h2>
                                <ul className="listing">
                                    <li><span>Для взаимодействия с сайтом, у вас появляется профиль.</span></li>
                                    <li><span>Ваш профиль виден всем пользователям и даже гостям сайта. <b>В целях приватности и безопасности, пожалуйста, воздержитесь от публикации личной информации в профиле.</b></span></li>
                                    <li><span>На Вас, как и Вы на других пользователей можете подписываться, чтобы следить за обновлениями во вкладке <b><a href="/fav_authors">Фотографии избранных авторов</a></b>.</span></li>
                                </ul>
                                <img src="/static/img/tour2.png" width="440" />
                                <br />
                            </div>
                            <div id="photos" className="tabcontent" style={{ display: activeTab === 'photos' ? 'block' : 'none' }}>
                                <h2>Фотографии и Видео</h2>
                                <ul className="listing">
                                    <li><span>Фотографии и Видео — это неотъемлемая часть сайта, на которой строится вся идея портала {title}.</span></li>
                                    <li><span>На главной странице размещаются последние 30 фотографий и топ 10 фотографий по просмотрам за 24 часа.</span></li>
                                </ul>
                                <img src="/static/img/tour3.png" width="440" />
                                <br />
                            </div>
                            <div id="search" className="tabcontent" style={{ display: activeTab === 'search' ? 'block' : 'none' }}>
                                <h2>Поиск</h2>
                                <ul className="listing">
                                    <li><span>Раздел "Поиск" позволяет искать пользователей и группы.</span></li>
                                    <li><span>Данный раздел сайта со временем будет улучшаться.</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/search.png" width="440" />
                                <ul className="listing">
                                    <li><span>Для начала поиска нужно знать имя (или фамилию) пользователя; а если ищете группу, то нужно знать её название.</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/search2.png" width="440" />
                                <h2>Быстрый поиск</h2>
                                <ul className="listing">
                                    <li><span>Если вы хотите как-либо сэкономить время, то строка поиска доступна и в шапке сайта</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/search_h.png" width="440" />
                                <br />
                            </div>
                            <div id="videos" className="tabcontent" style={{ display: activeTab === 'videos' ? 'block' : 'none' }}>
                                <h2>Загружайте и делитесь видео со своими друзьями!</h2>
                                <ul className="listing">
                                    <li><span>Вы можете загружать неограниченное количество видеозаписей и клипов</span></li>
                                    <li><span>Раздел "Видеозаписи" регулируется настройками приватности</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/videos.png" width="440" />
                                <p className="big">Видео можно загружать минуя раздел "Видеозаписи" через обычное прикрепление к новой записи на стене:</p>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/videos_a.png" width="440" />
                                <h2>Импортирование видео с YouTube</h2>
                                <ul className="listing">
                                    <li><span>Кроме загрузки видео напрямую, сайт поддерживает и встраивание видео из YouTube</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/videos_y.png" width="440" />
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/videos_w.png" width="440" />
                                <br />
                            </div>
                            <div id="audios" className="tabcontent" style={{ display: activeTab === 'audios' ? 'block' : 'none' }}>
                                <h2>Слушайте аудиозаписи</h2>
                                <ul className="listing">
                                    <li><span>Вы можете слушать аудиозаписи в разделе "Мои Аудиозаписи"</span></li>
                                    <li><span>Этот раздел также регулируется настройками приватности</span></li>
                                    <li><span>Самые прослушиваемые песни находятся во вкладке "Популярное", а недавно загруженные — во вкладке "Новое"</span></li>
                                    <img src="https://ovk.to/assets/packages/static/openvk/img/tour/audios.png" width="440" />
                                </ul>
                                <ul className="listing">
                                    <li><span>Чтобы добавить песню в свою коллекцию, наведите на неё и нажмите на плюс. Найти нужную песню можно в поиске</span></li>
                                    <img src="https://ovk.to/assets/packages/static/openvk/img/tour/audios_search.png" width="440" />
                                    <li><span>Если вы не можете найти нужную песню, вы можете загрузить её самостоятельно</span></li>
                                    <img src="https://ovk.to/assets/packages/static/openvk/img/tour/audios_upload.png" width="440" />
                                </ul>
                                <p className="big"><b>Важно:</b> песня не должна нарушать авторские права</p>
                                <h2>Создавайте плейлисты</h2>
                                <ul className="listing">
                                    <li><span>Вы можете создавать сборники треков во вкладке "Мои плейлисты"</span></li>
                                    <li><span>Можно также добавлять чужие плейлисты в свою коллекцию</span></li>
                                    <img src="https://ovk.to/assets/packages/static/openvk/img/tour/audios_playlists.png" width="440" />
                                </ul>
                                <br />
                            </div>
                            <div id="news" className="tabcontent" style={{ display: activeTab === 'news' ? 'block' : 'none' }}>
                                <h2>Следите за тем, что пишут ваши друзья</h2>
                                <ul className="listing">
                                    <li><span>Раздел "Мои Новости" разделяется на два типа: локальная лента и глобальная лента</span></li>
                                    <li><span>В локальной ленте будут показываться новости только ваших друзей и групп</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/local_news.png" width="440" />
                                <p className="big">Никакой системы рекомендаций. <b>Свою ленту новостей формируете только вы.</b></p>
                                <br />
                            </div>
                            <div id="news_global" className="tabcontent" style={{ display: activeTab === 'news_global' ? 'block' : 'none' }}>
                                <h2>Следите за тем, какие темы обсуждают на сайте</h2>
                                <ul className="listing">
                                    <li><span>В глобальной ленте новостей будут показываться записи всех пользователей сайта и групп</span></li>
                                    <li><span>Просмотр данного раздела может не рекомендоваться для чувствительных и ранимых людей</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/news_global.png" width="440" />
                                <p className="big">Дизайн глобальной ленты по дизайну никак не отличается от локальной</p>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/poll.png" width="440" />
                                <p className="big">В ленте есть множество типов контента: начиная от обычных фото и видео, и заканчивая анонимными постами и опросами</p>
                                <br />
                            </div>
                            <div id="groups" className="tabcontent" style={{ display: activeTab === 'groups' ? 'block' : 'none' }}>
                                <h2>Создавайте группы!</h2>
                                <ul className="listing">
                                    <li><span>На сайте уже имеются тысячи групп, посвящённые различным темам и каким-либо фанатским объединениям</span></li>
                                    <li><span>Вы можете присоединяться к любой группе. А если не нашли подходящую, то можно создавать и свою</span></li>
                                    <li><span>Каждая группа имеет свой раздел вики-страниц, фотоальбомов, блок ссылок и обсуждений</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/groups.png" width="440" />
                                <p className="big">Раздел "Мои Группы" находится в левом меню сайта</p>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/groups_view.png" width="440" />
                                <p className="big">Пример сообщества</p>
                                <h2>Управляйте своей группой вместе с другом</h2>
                                <ul className="listing">
                                    <li><span>Управление группой осуществляется в разделе "Редактировать группу" под аватаром сообщества</span></li>
                                    <li><span>Создайте команду администраторов из обычных участников или тех, кому вы доверяете</span></li>
                                    <li><span>Вы можете скрыть нужного Вам администратора, чтобы он нигде не показывался в пределах вашей группы</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/groups_admin.png" width="440" />
                                <p className="big">Группы часто представляют собой реальные организации, члены которых хотят оставаться на связи со своей аудиторией</p>
                                <br />
                            </div>
                            <div id="events" className="tabcontent" style={{ display: activeTab === 'events' ? 'block' : 'none' }}>
                                <h2>Упс</h2>
                                <ul className="listing">
                                    <li><span>Я был бы очень рад сделать туториал по этому разделу, но раздел находится на этапе разработки. А сейчас мы пока этот раздел туториала пропустим и пойдём дальше...</span></li>
                                </ul>
                                <br />
                            </div>
                            <div id="themes" className="tabcontent" style={{ display: activeTab === 'themes' ? 'block' : 'none' }}>
                                <h2>Темы оформления</h2>
                                <ul className="listing">
                                    <li><span>После регистрации, в качестве оформления у вас будет установлена стандартная тема</span></li>
                                    <li><span>Некоторых новых пользователей может слегка отпугнуть нынешняя стоковая тема, которая веет совсем уж древностью</span></li>
                                    <li><span><b>Но не беда:</b> Вы можете создать свою тему для сайта, ознакомившись с <a href="https://docs.ovk.to/">документацией</a> или выбрать уже существующую из каталога</span></li>
                                </ul>
                                <center><img src="https://ovk.to/assets/packages/static/openvk/img/tour/theme_picker.png" /></center>
                                <p className="big">Каталог тем доступен в разделе "Мои Настройки" во вкладке "Интерфейс" </p><br />
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/theme3.png" width="460" />
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/theme1.png" style={{"float":"left"}} width="220" /></td>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/theme2.png" style={{"float":"right"}} width="220" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <br />
                                <center><img src="/https://ovk.to/assets/packages/static/openvk/img/tour/wordart.png" width="65%" /></center>
                                <br />
                            </div>
                            <div id="customization" className="tabcontent" style={{ display: activeTab === 'customization' ? 'block' : 'none' }}>
                                <h2>Фон профиля и группы</h2>
                                <ul className="listing">
                                    <li><span>Вы можете установить два изображения в качестве фона вашей страницы</span></li>
                                    <li><span>Они будут отображаться по бокам у тех, кто зайдёт на вашу страницу</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/backdrop.png" width="440" />
                                <p className="big">Страница установки фона</p><br />
                                <ul className="listing">
                                    <li><span><b>Совет:</b> перед установкой фона, поэкспериментируйте с разметкой: попробуйте отзеркалить будущую фоновую картинку, или вообще просто создайте красивый градиент</span></li>
                                </ul>
                                <br />
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/backdrop_ex.png" width="440" /></td>
                                        </tr>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/backdrop_ex1.png" width="440" /></td>
                                        </tr>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/backdrop_ex2.png" width="440" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="big">Примеры страниц с установленным фоном</p><br />
                                <p className="big">С помощью этой возможности вы можете добавить своему профилю больше индивидуальности</p>
                                <h2>Аватары</h2>
                                <ul className="listing">
                                    <li><span>Вы можете задать вариант показа аватара пользователя: стандартное, закруглённые и квадратные (1:1)</span></li>
                                    <li><span>Данные настройки будут видны только вам</span></li>
                                </ul>
                                <center><img src="https://ovk.to/assets/packages/static/openvk/img/tour/avatar_picker.png" /></center><br />
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/avatars_def.png" style={{"float":"left"}} width="220" /></td>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/avatars_round.png" style={{"float":"right"}} width="220" /></td>
                                        </tr>
                                    </tbody>
                                </table><br />
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/avatars_quad.png" width="440" />
                                <h2>Редактирование левого меню</h2>
                                <ul className="listing">
                                    <li><span>При необходимости вы можете скрыть ненужные разделы сайта</span></li>
                                    <li><span><b>Напоминание: </b>Разделы первой необходимости (Моя Страница; Мои Друзья; Мои Ответы; Мои Настройки) скрыть нельзя</span></li>
                                </ul>
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/leftmenu.png" style={{"float":"left"}} width="220" /></td>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/leftmenu2.png" style={{"float":"right"}} width="220" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <h2>Вид постов</h2>
                                <ul className="listing">
                                    <li><span>Если надоел старый дизайн стены, который был в некогда популярном оригинальном ВКонтакте.ру, то вы всегда можете изменить вид постов на Микроблог</span></li>
                                    <li><span>Вид постов можно менять между двумя вариантами в любое время</span></li>
                                    <li><span><b>Обратите внимание</b>, что если выбран старый вид отображения постов, то последние комментарии подгружаться не будут</span></li>
                                </ul>
                                <center><img src="https://ovk.to/assets/packages/static/openvk/img/tour/wall_pick.png" /></center><br />
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/wall_old.png" style={{"float":"left"}} width="220" />
                                                <br />
                                                <p className="big"></p>
                                            </td>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/wall_new.png" style={{"float":"right"}} width="220" />
                                                <br />
                                                <p className="big">Микроблог</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <br />
                                <br />
                            </div>
                            <div id="vouchers" className="tabcontent" style={{ display: activeTab === 'vouchers' ? 'block' : 'none' }}>
                                <h2>Ваучеры</h2>
                                <ul className="listing">
                                    <li><span>Ваучер в OpenVK это что-то вроде промокода на добавление какой-либо валюты (проценты рейтинга, голосов и так далее)</span></li>
                                    <li><span>Подобные купоны создаются по каким-либо значимым событиям и праздникам. Следите за <a href="https://t.me/openvk">Telegram-каналом</a> OpenVK</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/vouchers.png" width="440" />
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/vouchers_type.png" width="440" />
                                <p className="big">Ваучеры состоят из 24 цифр и букв</p><br />
                                <ul className="listing">
                                    <li><span>После активации какого-либо ваучера, заданная администраторами валюта будет перечислена в вашу пользу</span></li>
                                    <li><span><b>Помните: </b>Все ваучеры имеют ограниченный срок активации</span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/vouchers_ok.png" width="440" />
                                <p className="big">Успешная активация (например, нам зачислили 100 голосов)</p><br />
                                <p className="big"><b>Внимание: </b>После активации ваучера на вашу страницу, тот же самый ваучер нельзя будет активировать повторно</p><br />
                                <br />
                                <br />
                            </div>
                            <div id="mobile" className="tabcontent" style={{ display: activeTab === 'mobile' ? 'block' : 'none' }}>
                                <h2>Мобильная версия</h2>
                                <ul className="listing">
                                    <li><span>На данный момент мобильной веб-версии сайта пока нет, но зато есть мобильное приложение для Android</span></li>
                                    <li><span>OpenVK Legacy - это мобильное приложение OpenVK для ретро-устройств на Android с дизайном ВКонтакте 3.0.4 из 2013 года</span></li>
                                    <li><span>Минимально поддерживаемой версией является Android 2.1 Eclair, то есть аппараты времён начала 2010-ых вполне пригодятся</span></li>
                                </ul>
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/app1.png" style={{"float":"left"}} width="210" /></td>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/app2.png" style={{"float":"right"}} width="210" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table cellSpacing="5" border={0}>
                                    <tbody>
                                        <tr>
                                            <td><img src="https://ovk.to/assets/packages/static/openvk/img/tour/app3.png" width="425" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="big">Скриншоты приложения</p><br />
                                <h2>Где это можно скачать?</h2>
                                <ul className="listing">
                                    <li><span>Релизные версии скачиваются через официальный репозиторий F-Droid</span></li>
                                    <li><span>Если вы являетесь бета-тестировщиком приложения, то новые версии приложения выкладываются в отдельный канал обновления</span></li>
                                    <li><span><b>Важно: </b>Приложение может иметь различные баги и недочёты, об ошибках сообщайте в <a href="/app">официальную группу приложения</a></span></li>
                                </ul>
                                <img src="https://ovk.to/assets/packages/static/openvk/img/tour/app4.jpeg" width="440" />
                                <br />
                                <br />
                                <p className="big">На этом экскурсия по сайту завершена.</p><br />
                                <br />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </td>
</tr>
  );
}
