<?php

use App\Services\{Router, Auth, DB, Date};
?>
<html lang="ru">


<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <h1>Результаты поиска</h1>
                <div>Найдено изображений: <b><?=DB::query('SELECT COUNT(*) FROM photos WHERE user_id=:uid AND moderated=1 ORDER BY id DESC', array(':uid'=>$_GET['id']))[0]['COUNT(*)']?></b> &nbsp;·&nbsp; <a href="#sf">Новый поиск</a></div><br>
               <?php
               $photos = DB::query('SELECT * FROM photos WHERE user_id=:uid AND moderated=1 ORDER BY id DESC', array(':uid'=>$_GET['id']));
               foreach ($photos as $p) {
                echo '<div class="p20p">
                    <table>
                        <tbody>
                            <tr>
                                <td class="pb_photo" id="p1936120"><a href="/photo/'.$p['id'].'" target="_blank" class="prw"><img class="f" src="'.$p['photourl'].'">
                                        <div class="hpshade">
                                        ';
                                        if (DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'] >= 1) {
                                            echo '<div class="com-icon">'.DB::query('SELECT COUNT(*) FROM photos_comments WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div>';
                                        }
                                        echo '
                                        <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div></div>
                                    </a></td>
                                <td class="pb_descr">
                                
                                    <p><b class="pw-place">'.htmlspecialchars($p['place']).'</b></p>
                                    <span class="pw-descr">'.htmlspecialchars($p['postbody']).'</span>
                                    <p class="sm"><b>'.Date::zmdate($p['timeupload']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">'.htmlspecialchars($p['username']).'</a></p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>';
               }
               ?>
<form method="get" id="mform" class="p20w" style="padding:10px 20px 10px 10px">
<table>
<tbody><tr>
    <td colspan="2"><h4 style="margin:-5px 0 10px">Условия, относящиеся к ТС:</h4></td>
</tr>
<tr>
	<td class="lcol">Страна:</td>
	<td>
		<input type="hidden" name="vrid" id="vrid" value="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="vrname" style="width: 250px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Город ТС:</td>
	<td>
		<input type="hidden" name="vcid" id="vcid" value="-1" data-vrid="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="vcname" style="width: 250px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Вид транспорта:</td>
	<td>
        <select name="vtype" id="vtype" class="">
	<option value="-1" class="" selected="">Не имеет значения</option>
	<option value="1" class="s5">Трамвай</option>
	<option value="2" class="s8">Троллейбус</option>
	<option value="3" class="s7">Метрополитен</option>
	<option value="4" class="s9">Монорельс</option>
	<option value="5" class="s2">Фуникулёр</option>
	<option value="6" class="s6">Транслор</option>
	<option value="7" class="s9">Мувер (АТН)</option>
	<option value="8" class="s9">Маглев</option>
	<option value="9" class="s3">Электробус</option>
</select>	</td>
</tr>
<tr>
	<td class="lcol">Локация:</td>
	<td>
        <select name="loid" id="loid" style="width:400px" data-vcid="-1" disabled="">
            <option value="0">Не имеет значения</option>
        </select>
    </td>
</tr>
<tr>
	<td class="lcol">Депо/Парк:</td>
	<td>
        <select name="did" id="did" style="width:400px" data-vcid="-1" data-vtype="-1" data-loid="0" disabled="">
            <option value="0">Не имеет значения</option>
        </select>
    </td>
</tr>
<tr>
	<td class="lcol">Система:</td>
	<td>
		<input type="hidden" name="vgrid" id="vgrid" value="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="vgrname" style="width: 400px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Назначение:</td>
	<td style="padding-bottom:17px">
		<select name="serv">
	<option value="-1" selected="">Не имеет значения</option>
	<option value="0">Пассажирский</option>
	<option value="1">Служебный</option>
	<option value="2">Музейный</option>
</select>	</td>
</tr>
<tr>
	<td class="lcol">Номер:</td>
	<td><input type="text" name="num" style="width:100px" value=""></td>
</tr>
<tr>
	<td class="lcol">Госномер:</td>
	<td style="padding-bottom:17px"><input type="text" name="gos" style="width:100px" value=""></td>
</tr>
<tr>
	<td class="lcol">Модель:</td>
	<td>
		<input type="hidden" name="mid" id="mid" value="-1" data-vtype="-1">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="mname" style="width: 250px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" disabled="" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>&nbsp;
		<input type="checkbox" name="sub" id="sub" value="1"> <label for="sub">Учесть подмодели</label>
	</td>
</tr>
<tr>
	<td class="lcol">Шасси:</td>
	<td style="padding-bottom:17px">
		<input type="hidden" name="chid" id="chid" value="-1" data-vtype="-1">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="chname" style="width: 250px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" disabled="" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>&nbsp;
		<input type="checkbox" name="sub2" id="sub2" value="1"> <label for="sub2">Учесть подмодели</label>
	</td>
</tr>
<tr>
    <td colspan="2"><h4 style="margin:0 0 10px">Условия, относящиеся к галереям:</h4></td>
</tr>
<tr>
	<td class="lcol">Город галереи:</td>
	<td>
		<input type="hidden" name="gcid" id="gcid" value="-1">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="gcname" style="width: 250px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Вид транспорта:</td>
	<td>
        <select name="gtype" id="gtype" class="">
	<option value="-1" class="" selected="">Не имеет значения</option>
	<option value="0" class="s0">Без вида транспорта</option>
	<option value="1" class="s5">Трамвай</option>
	<option value="2" class="s8">Троллейбус</option>
	<option value="3" class="s7">Метрополитен</option>
	<option value="4" class="s9">Монорельс</option>
	<option value="5" class="s2">Фуникулёр</option>
	<option value="6" class="s6">Транслор</option>
	<option value="7" class="s9">Мувер (АТН)</option>
	<option value="8" class="s9">Маглев</option>
	<option value="9" class="s3">Электробус</option>
</select>    </td>
</tr>
<tr>
	<td class="lcol">Раздел:</td>
	<td>
		<select name="sid" id="sid" style="width:400px">
	<option value="0" selected="">Не имеет значения</option>
	<option value="1">События ГЭТ</option>
	<option value="2">Фотогалереи ГЭТ</option>
	<option value="6">Транспортное сообщество</option>
	<option value="7">Выставки</option>
	<option value="8">Обзоры</option>
	<option value="9">Строительство и реконструкция</option>
	<option value="13">Железная дорога</option>
	<option value="14">Оборудование электротранспорта</option>
	<option value="15">Творчество</option>
	<option value="20">Метрополитены</option>
	<option value="21">Монорельсы</option>
	<option value="22">Фуникулёры</option>
	<option value="112">События метрополитена</option>
	<option value="113">Карты и схемы</option>
	<option value="114">Временный раздел</option>
</select>	</td>
</tr>
<tr>
	<td class="lcol">Галерея:</td>
	<td style="padding-bottom:17px">
        <select name="gid" id="gid" style="width:400px" data-gcid="-1" data-gtype="-1" data-sid="0" disabled="">
            <option value="0">Не имеет значения</option>
        </select>
    </td>
</tr>
<tr>
    <td colspan="2"><h4 style="margin:0 0 10px">Условия, относящиеся к фото:</h4></td>
</tr>
<tr>
	<td class="lcol">Вид транспорта:</td>
	<td><select name="ptype" id="ptype" class="">
	<option value="-1" class="" selected="">Не имеет значения</option>
	<option value="0" class="s0">Без вида транспорта</option>
	<option value="1" class="s5">Трамвай</option>
	<option value="2" class="s8">Троллейбус</option>
	<option value="3" class="s7">Метрополитен</option>
	<option value="4" class="s9">Монорельс</option>
	<option value="5" class="s2">Фуникулёр</option>
	<option value="6" class="s6">Транслор</option>
	<option value="7" class="s9">Мувер (АТН)</option>
	<option value="8" class="s9">Маглев</option>
	<option value="9" class="s3">Электробус</option>
</select></td>
</tr>
<tr>
	<td class="lcol">Страна:</td>
	<td>
		<input type="hidden" name="prid" id="prid" value="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="prname" style="width: 250px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Система:</td>
	<td>
		<input type="hidden" name="pgrid" id="pgrid" value="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="pgrname" style="width: 400px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Город съёмки:</td>
	<td>
		<input type="hidden" name="pcid" id="pcid" value="-1" data-prid="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="pcname" style="width: 400px; padding-left: 3px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Место съёмки:</td>
	<td style="padding-bottom:15px">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" name="place" id="place" style="width:400px; margin-bottom:3px" value="" class="ui-autocomplete-input" autocomplete="off"><br>
		<input type="checkbox" name="strict" id="strict" value="1"> <label for="strict">Строгое соответствие места съёмки</label><br>
		<input type="checkbox" name="no_ren" id="no_ren" value="1" disabled=""> <label for="no_ren" style="color:#888">Без учёта переименований</label>
	</td>
</tr>
<tr>
	<td class="lcol">Маршрут:</td>
	<td><input type="text" name="route" style="width:60px" value=""></td>
</tr>
<tr>
	<td class="lcol">Примечание:</td>
	<td><input type="text" name="notes" style="width:200px" value=""></td>
</tr>
<tr>
	<td class="lcol">Описание:</td>
	<td style="padding-bottom:17px"><input type="text" name="descr" style="width:400px" value=""></td>
</tr>
<tr>
	<td class="lcol">Конкурсное:</td>
	<td><select name="konk">
	<option value="0" selected="">Не имеет значения</option>
	<option value="10">Все участники</option>
	<option value="9">3 место и выше</option>
	<option value="8">2 место и выше</option>
	<option value="7">1 место и выше</option>
	<option value="5">Пятёрка лучших за месяц</option>
	<option value="4">Фото месяца</option>
	<option value="2">Тройка лучших за год</option>
	<option value="1">Фото года</option>
</select></td>
</tr>
<tr>
	<td class="lcol">Ракурс:</td>
	<td>
		<input type="hidden" name="view" id="view" value="-1">
		<input type="text" id="view_txt" value="Не имеет значения" style="width:300px; cursor:pointer" readonly="">
		<div id="views-selector" style="position:absolute; padding:5px; z-index:20; display:none" class="p20 shadow">
			<table id="views">
	<tbody><tr>
		<td colspan="3" style="text-align:center"><input type="checkbox" name="view_top" value="20" id="v20"> <label for="v20">Вид сверху</label></td>
		<td></td>
	</tr>
	<tr>
		<td><input type="radio" name="view_s" value="4" title="Сзади-слева (окна)" class="views-radio-single" style="position:relative; top:7px; left:7px"></td>
		<td style="text-align:center">
			<input type="radio" name="view_s" value="8" title="Левый борт" class="views-radio-single">
		</td>
		<td><input type="radio" name="view_s" value="2" title="Спереди-слева (окна)" style="position:relative; top:7px; left:-7px"></td>
		<td style="padding:0 35px; line-height:23px" rowspan="3">
            <div><input type="radio" name="view_s" value="12" id="v12"> <label for="v12">Заводская табличка</label></div>
            <div><input type="radio" name="view_s" value="13" id="v13"> <label for="v13">Отдельные элементы ТС</label></div>
            <div class="twoside-old"><input type="radio" name="view_s" value="14" id="v14"> <label for="v14">Не определяется (двухстороннее ТС)</label></div>
			<div><input type="radio" name="view_s" value="0" id="v0"> <label for="v0">Не указан</label></div>
			                <div><input type="radio" name="view_s" value="-1" id="vnone"> <label for="vnone">Не имеет значения</label></div>
			            <div class="sm" style="margin-top:15px"><a href="#" class="views-toggle-link dot">Переключить на: <span class="twoside-single">Одностороннее ТС</span><span class="twoside-twoside">Двухстороннее ТС</span></a></div>
		</td>
	</tr>
	<tr>
		<td style="padding:0 2px"><input type="radio" name="view_s" value="7" title="Вид строго сзади" class="views-radio-single"></td>
		<td class="views-image">
			<table style="width:138px; height:82px">
				<tbody><tr>
					<td style="text-align:left; padding-left:25px">
						<input type="radio" name="view_s" value="9" title="Салон, вид вперёд">
					</td>
					<td style="text-align:right; padding:0">
						<input type="radio" name="view_s" value="10" title="Салон, вид назад" class="views-radio-single">
						<input type="radio" name="view_s" value="11" title="Кабина" style="position:relative; top:-7px">
					</td>
				</tr>
			</tbody></table>
		</td>
		<td style="padding:0 2px"><input type="radio" name="view_s" value="5" title="Вид строго спереди"></td>
	</tr>
	<tr>
		<td><input type="radio" name="view_s" value="3" title="Сзади-справа (двери)" class="views-radio-single" style="position:relative; top:-7px; left:7px"></td>
		<td style="text-align:center">
			<input type="radio" name="view_s" value="6" title="Правый борт">
		</td>
		<td><input type="radio" name="view_s" value="1" title="Спереди-справа (двери)" style="position:relative; top:-7px; left:-7px"></td>
	</tr>
	<tr>
		<td colspan="3" style="text-align:center"><input type="checkbox" name="view_bottom" value="40" id="v40"> <label for="v40">Вид снизу</label></td>
		<td></td>
	</tr>
</tbody></table>
<script>

function openViewSelector(val, el, twoside)
{
    var selector = $('#views-selector');

    var view = val % 20;
    var modifier = val - view;

    $('input[value="' + view + '"]', selector).prop('checked', true);
    $('#v20').prop('checked', modifier == 20);
    $('#v40').prop('checked', modifier == 40);

    if (view != 14)
    {
        selector.attr('data-twoside', twoside);
        $('.twoside-old').hide();
    }
    else
    {
        selector.attr('data-twoside', 1);
        $('.twoside-old').show();
    }


    var p = el.offset();
    selector.css('left', p.left + 'px').css('top', (p.top + el.height() + 3) + 'px').show();
}


function setView(e, func)
{
    var selector = $('#views-selector');

    var view = parseInt($('input[type="radio"]:checked', selector).val());
    var modifier = parseInt($('input[type="checkbox"]:checked', selector).val());
    if (isNaN(modifier)) modifier = 0;

    var label = view || !modifier ? views[view] : '';
    if (label != '' && modifier) label += ' + ';
    if (modifier) label += views[modifier];

    func(e, view, modifier, label);

    selector.hide();
}


function setViewSelectorCallback(func)
{
    var selector = $('#views-selector');

    $('input[type="radio"]', selector).on('click', function(e)
    {
        setView(e, func);
    });

    $('input[type="checkbox"]', selector).on('click', function()
   	{
   		if ($(this).is('#v20:checked')) $('#v40').prop('checked', false); else
   		if ($(this).is('#v40:checked')) $('#v20').prop('checked', false);
   	});

    $(document).on('click', function(e)
    {
        if ($(e.target).closest('#views-selector').length == 0 && $('#views-selector').is(':visible'))
        {
            setView(e, func);
        }
    })
    .on('keydown', function(e)
   	{
        // Закрытие селектора ракурса по Esc или Backspace
   		if ((e.which == 27 || e.which == 8) && $('#views-selector').is(':visible'))
   		{
   			e.preventDefault();
            setView(e, func);
   		}
   	});

}


$(document).ready(function()
{
	$('.views-toggle-link').on('click', function()
	{
	    var selector = $('#views-selector');
	    var twoside = selector.attr('data-twoside');

	    selector.attr('data-twoside', twoside == 1 ? 0 : 1);
		return false;
	});
});

</script>
		</div>
	</td>
</tr>
<tr>
	<td class="lcol">Модель камеры:</td>
	<td style="padding-bottom:17px"><input type="text" name="cammod" style="width:300px" value=""></td>
</tr>
<tr>
	<td class="lcol">Пользователь:</td>
	<td>
		<input type="hidden" name="aid" id="aid" value="0">
		<div class="ac-loader"></div><span role="status" aria-live="polite" class="ui-helper-hidden-accessible"></span><input type="text" id="aname" style="width: 200px; padding-left: 4px; padding-right: 3px;" value="Не имеет значения" class="ui-autocomplete-input" autocomplete="off"><div class="xsign" style="display: none;"></div>
	</td>
</tr>
<tr>
	<td class="lcol">Авторство:</td>
	<td><select name="auth">
	<option value="0" selected="">Не имеет значения</option>
	<option value="1">только авторские</option>
	<option value="2">присланные этим пользователем</option>
</select>	</td>
</tr>
<tr>
	<td></td>
	<td><input type="checkbox" name="fav" id="fav" value="1"> <label for="fav">Поиск в Избранном</label></td>
</tr>
<tr>
	<td></td>
	<td><input type="checkbox" name="lost" id="lost" value="1"> <label for="lost">Потерянные фотографии</label><br>&nbsp;</td>
</tr>
<tr>
	<td class="lcol">Дата съёмки с</td>
	<td>
		<input type="text" name="date1" id="date1" size="10" maxlength="10" value="12.02.2025" disabled=""> &nbsp;по&nbsp;
		<input type="text" name="date2" id="date2" size="10" maxlength="10" value="12.02.2025" disabled="">&nbsp;
		<input type="checkbox" name="anydate" id="anydate" value="1" checked="checked"> <label for="anydate">Не имеет значения</label>
	</td>
</tr>
<tr>
	<td class="lcol">Опубликовано с</td>
	<td>
		<input type="text" name="pub1" id="pub1" size="10" maxlength="10" value="12.02.2025" disabled=""> &nbsp;по&nbsp;
		<input type="text" name="pub2" id="pub2" size="10" maxlength="10" value="12.02.2025" disabled="">&nbsp;
		<input type="checkbox" name="anypub" id="anypub" value="1" checked="checked"> <label for="anypub">Не имеет значения</label>
	</td>
</tr>
<tr>
	<td></td>
	<td class="sm" style="color:#888">Даты в формате ДД.ММ.ГГГГ<br>&nbsp;</td>
</tr>
<tr>
	<td></td><td>&nbsp;</td>
</tr>
<tr>
	<td class="lcol">Лицензии:</td>
	<td>
		<input type="checkbox" id="license_cc1" value="1" name="license_cc"> <label for="license_cc1">Выбрать только с свободными лицензиями</label><br>
		<input type="checkbox" id="license_cc2" value="1" name="license_cc_commerce" disabled=""> <label for="license_cc2">Материалы для коммерческого использования</label><br>
		<input type="checkbox" id="license_cc3" value="1" name="license_cc_derivatives" disabled=""> <label for="license_cc3">Материалы, которые можно изменять, адаптировать  или использовать как основу</label>
	</td>
</tr>
<tr>
	<td></td><td>&nbsp;</td>
</tr>
<tr>
	<td align="right">Сортировать по&nbsp;</td>
	<td><select name="order">
	<option value="0">городу, бортовому номеру, дате съёмки</option>
	<option value="1">дате съёмки, городу, бортовому номеру</option>
	<option value="2">времени публикации (сверху старые)</option>
	<option value="3" selected="">времени публикации (сверху новые)</option>
	<option value="4">числу просмотров</option>
	<option value="5">рейтингу</option>
	<option value="6">числу комментариев</option>
</select>	</td>
</tr>
<tr>
	<td></td>
	<td><br><input type="submit" value="&nbsp; &nbsp; &nbsp; Искать &nbsp; &nbsp; &nbsp;"></td>
</tr>
</tbody></table>
</form>
                </tbody>

                
    </table>


</body>

</html>