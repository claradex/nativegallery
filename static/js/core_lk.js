var gal_cid = -1;
var new_vehicle_idx = 0;
var modified = false;
var cnames = {2: 'Санкт-Петербург'};
var binds = [
	{ value: 1, item: '<b>Основная — ТС на переднем плане</b>', label: '<b>Основная</b>' },
{ value: 0, item: 'Второстепенная — ТС на заднем плане', label: 'Второстепенная' },
{ value: 2, item: '<i>Условная — ТС указано предположительно</i>', label: '<i>Условная</i>' }
];

addTexts({
	'UP_WRONGTYPE': 'Недопустимый тип файла',
	'UP_TOOSMALL': 'Выбранное изображение слишком маленькое — его длина по широкой стороне составляет %d пикселей. Для загрузки на сайт она должна быть не менее %d пикселей',
	'UP_OVERSIZE_JPG': 'Выбранное изображение слишком большое — сумма его ширины и высоты составляет %d пикселей. Для изображений JPEG и WEBP она не должна превышать %d пикселей',
	'UP_OVERSIZE_PNG': 'Выбранное изображение слишком большое — его длина по широкой стороне составляет %d пикселей. Для изображений GIF и PNG она не должна превышать %d пикселей',
	'UP_LARGEFILE_JPG': 'Этот файл слишком большой — %d КБ. Вы можете загружать файлы JPEG и WEBP объёмом до %d КБ',
	'UP_LARGEFILE_PNG': 'Этот файл слишком большой — %d МБ. Вы можете загружать файлы GIF и PNG объёмом до %d МБ',
	'UP_NEEDRESIZE': 'Выбранное фото превышает %d пикселей по сумме ширины и высоты,<br />поэтому оно будет уменьшено до %d пикселей по широкой стороне',
	'UP_NULART': '(подходящей галереи нет в списке, требуется создать новую)',
	'UP_LOADING': 'Загрузка...',
	'UP_SEARCHING': 'Идёт поиск...',
	'UP_OTHER': 'Новая',
	'UP_NOFILE': 'Не выбран файл для загрузки',
	'UP_NOCOORDS': 'Поместите маркер на карте в точку, с которой вы производили съёмку. Для установки маркера достаточно кликнуть по карте в нужном месте.',
	'UP_NODIR': 'Укажите направление съёмки.',
	'UP_NOCITY': 'Вы не указали город. Нажмите кнопку подтверждения для отправки фотографии, если города съемки нет в списке. Нажмите кнопку отмены, если Вы забыли указать город.',
	'UP_OTHERCITY': 'Город съёмки не соответствует привязанным ТС и/или галереям. Продолжить отправку фото?',
	'UP_ERROR': 'Фото не было загружено :-(',
	'UP_SUCCESS': 'Фотография успешно загружена!',
	'UP_NOTHING': 'К сожалению, ничего подходящего найти не удалось',
	'UP_V_LINKED': 'Это ТС уже привязано к данному фото',
	'UP_G_LINKED': 'Эта галерея уже привязана к данному фото',
	'UP_CREATIVE': 'Фотография, загружаемая в «Фотозарисовки» или «Художественную галерею», не может быть привязана к ТС и другим галереям.',
	'UP_NOLINKS': 'Фотография ни к чему не привязана',
	'UP_NO_PRI': 'Фотография не может иметь только второстепенные привязки.',
	'UP_NODATE': 'Вы не указали дату снимка. Нажмите «OK», если так и должно быть, или «Отмена», если хотите добавить дату съёмки',
	'UP_NOPLACE': 'Вы не указали место съёмки. Нажмите «OK», если так и должно быть, или «Отмена», если хотите добавить место съёмки',
	'UP_ARTICLE': 'Галерея',
	'UP_LIMITEXC': 'Сегодня Вы уже загрузили максимально возможное число фотографий. Следующие фотографии Вы можете загрузить завтра',
	'UP_ROUTE': 'Маршрут',
	'UP_NOTES': 'примечание',
	'VIEW': 'Ракурс',
	'UP_NOVIEW': 'Не для всех ТС указан ракурс съёмки.',
	'UP_TOQUEUE': 'Это фото не может быть опубликовано без модерации, поэтому оно было помещено в очередь',
	'UP_BIND': 'Привязка',
	'UP_BIND_PRI': 'Основная — ТС на переднем плане',
	'UP_BIND_SEC': 'Второстепенная — ТС на заднем плане',
	'UP_BIND_CON': 'Условная — ТС указано предположительно',
	'UP_NAA_ALLOW_NO': 'Не указано разрешение на публикацию.',
	'UP_TWOSIDE': 'Вы выбрали тип ПС (двухсторонний/односторонний),  не совпадающий с указанным для данной модели. Так и должно быть?',
	'MAP_SEARCH': 'Адрес или объект...',
	'MAP_NOTFOUND': 'На карте не удалось найти указанное место.',
	'MAP_OSM': 'Карта OpenStreetMap',
	'MAP_OSM_BW': 'Чёрно-белая карта OpenStreetMap',
	'MAP_OSM_HOT': 'Карта Humanitarian OpenStreetMap Team',
	'MAP_TOPO': 'Карта OpenTopoMap',
	'MAP_WIKIMEDIA': 'Карта Wikimedia',
	'MAP_OPNV': 'Карта ÖPNVKarte',
	'MAP_OPENPTMAP': 'Общественный транспорт от OpenPtMap',
	'MAP_RAILWAY': 'Железная дорога от OpenRailwayMap',
	'MAP_BING': 'Спутник Bing',
	'MAP_YANDEX': 'Карта Яндекс',
	'MAP_YANDSAT': 'Спутник Яндекс'
});

var views = {
	0: '<span class="s5">&nbsp;Не указан&nbsp;</span>',
1: 'Спереди-справа (двери)',
2: 'Спереди-слева (окна)',
3: 'Сзади-справа (двери)',
4: 'Сзади-слева (окна)',
5: 'Вид строго спереди',
6: 'Правый борт',
7: 'Вид строго сзади',
8: 'Левый борт',
9: 'Салон, вид вперёд',
10: 'Салон, вид назад',
11: 'Кабина',
12: 'Заводская табличка',
13: 'Отдельные элементы ТС',
14: 'Не определяется (двухстороннее ТС)',
20: 'Вид сверху',
40: 'Вид снизу'};

$(document).ready(function()
{
	$.ajaxSetup({cache: false});
	$('.progress-button').progressInitialize();


	// Выбор города



	// События всплывающего списка результатов поиска
	$('#vlist').on('mouseenter mouseleave', '.found_vehicle', function()
	{
		var state = parseInt($(this).data('state'));
		$(this).toggleClass('s' + state + ' s' + (state+10));
	})
	.on('click', '.found_vehicle a', function(e)
	{
		e.stopPropagation();
	})
	.on('click', '.found_vehicle', function()
	{
        var nid = $(this).data('nid');
        var vid = $(this).data('vid');

		if ($('#conn_veh tbody[data-vid="' + vid + '"]').length > 0)
		{
			alert(_text['UP_V_LINKED'] + '.');
			return;
		}

		var cid = $(this).data('cid');
		var cname = $('.cname', this).html();

		var type = $(this).data('type');

		var html = '<tbody data-nid="' + nid + '" data-vid="' + vid + '" data-twoside="' + $(this).data('twoside') + '" class="s' + $(this).data('state') + '">\n';

		html += '<tr>\n';
		html += '<td style="padding:3px 10px 5px"><input type="hidden" name="nid" value="' + vid + '"><input type="hidden" name="cids[]" value="' + cid + '"><a href="' + (nid > 0 ? '/vehicle/' + vid : '/lk/vehicles.php?action=edit&amp;vid=' + (-nid)) + '" target="_blank" class="num pcnt">' + $('.num', this).html() + '</a></td>\n';
		html += '<td style="padding:3px 10px 6px">' + $('.mname', this).html() + '</td>\n';
		html += '<td style="padding:3px 0 6px 10px; color:#777" class="r">' + _text['UP_ROUTE'] + ':</td>\n';
		html += '<td style="padding:3px 7px" class="nw"><input type="text" class="route" name="route[' + vid + ']" style="width:40px; font-weight:bold; text-align:center" maxlength="7" value="">, <input type="text" class="notes" name="notes[' + vid + ']" style="width:170px" maxlength="100" value="" placeholder="' + _text['UP_NOTES'] + '"></td>\n';
		html += '<td class="r"><a href="#" class="delLink" style="font-size:16px">&times;</a></td>\n';
		html += '</tr>\n';

		

	

		html += '</tbody>\n';

		var row = $(html);
		$('#conn_veh').append(row).show();
		$('.pri-label', row).selector2(binds);

		$('.no-links').hide();

		if (cid != $('#search_cid').val())
		{
			$('#search_cid').val(cid);
			$('#cname').val(cname);
		}

		$('#search_type').val(type).trigger('change');

		cnames[cid] = cname;

		showDefaultCity();
		modify();

		setTimeout(function() { $('#conn_veh tbody[data-nid="' + nid + '"] .view_link').click(); }, 100);
	});
	$('#vlist').on('mouseenter mouseleave', '#add_new_vehicle', function()
	{
		var state = parseInt($(this).data('state'));
		$(this).toggleClass('s' + state + ' s' + (state+10));
	})


	


	var placeElement = document.getElementById('place');
	if (placeElement) {
		$('#place').autocompleteHL({
			minLength: 3,
			source:	function(request, response)
			{
				var cid = $('#search_cid').val();
				if (cid != 0)
					 $.getJSON('/api/geodb/search', { place: request.term }, response).fail(function(jx) { alert(jx.responseText); });
				else response(null);
			}
		});
	}
	


	$('#image').click(function()
	{
		$('#dateLoaded, #dateAbsent').hide();
		$('#map_frame').removeClass('s12').css('background-color', '#ccc');

		$('#statusbox').html('');
		$('#errorsbox').hide();
	})
	.change(function(e)
	{
		$('#filename').html(this.files[0].name);

		checkImageForUpload(e.target, true, no_exif ? null : function(input)
		{
			EXIF.getData(input.files[0], function()
			{
				var dt = EXIF.getTag(this, "DateTimeOriginal");
				if (dt)
				{
					dt = dt.split(' ')[0].split(':');
					setDate(parseInt(dt[2]), parseInt(dt[1]), parseInt(dt[0]));
					$('#dateLoaded').fadeIn('slow');
				}
				else $('#dateAbsent').fadeIn('slow');

				var lt = EXIF.getTag(this, 'GPSLatitude');
				var ln = EXIF.getTag(this, 'GPSLongitude');
				if (lt && ln)
				{
					lt = parseCoord(lt, EXIF.getTag(this, 'GPSLatitudeRef'));
					ln = parseCoord(ln, EXIF.getTag(this, 'GPSLongitudeRef'));

					$('#lat').val(lt);
					$('#lng').val(ln);

					if (map)
					{
						var pos = [lt, ln];
						marker.setLatLng(pos);
						map.setView(pos);
					}

					$('#map_frame').css('background-color', '').attr('class', 's12');
				}
			});
		});
	});




	$('#day, #month, #year').on('change', function() { $('#dateAbsent').hide(); });




	// Комментарий
	$('#up-comment-link').on('click', function() { $('#up-comment-row').toggle(); });




	// Опции прямой публикации
	/*$('input[name="pub"]').on('click', function()
	{
		$('#temp_pub').css('display', $('#pub0').is(':checked') ? 'none' : 'block')
	});*/


	// Хак для IE
	$('label.button').on('click', function()
	{
		$(this).css('position', 'static');
		setTimeout(function() { $('label.button').css('position', 'relative'); }, 50);
	});


	// Опции даты
	$('.approx-aprx').css('font-weight', 'normal');


	// Временная публикация
	$('#cond').on('click', function() { if ($(this).is(':checked')) $('#tech').prop('checked', false); });
	$('#tech').on('click', function() { if ($(this).is(':checked')) $('#cond').prop('checked', false); });




	// Закрытие селектора ракурса по Esc или Backspace
	$(document).on('keydown', function(e)
	{
		if ((e.which == 27 || e.which == 8) && $('#views-selector').is(':visible'))
		{
			e.preventDefault();
			$('#views-selector').hide();
		}
	});


	// Модификация формы (но не только здесь)
	$('#image, #day, #month, #year, #pdate_approx, #main-cid, #place, #notes, #naa, #nomap, #license, #comment, #notes_mod, #px').on('change', modify);
	$('#conn_veh').on('change', 'input:checkbox, input:text', modify);


});



function modify()
{
	modified = true;
}





function parseCoord(val, ref)
{
	var coord = parseFloat(val[0] + (val[1] / 60.0) + (val[2] / 3600.0));
	if (ref == 'W' || ref == 'S') coord = -coord;
	return coord;
}



function searchVehicles(by_gos)
{
	$('#search_cid, #search_type, #search_num, #search_gos').prop('disabled', true);
	$('#vlist').html('<div class="nw" style="padding:6px 10px">' + _text['UP_SEARCHING'] + '</div>').show();

	var data = { cid: $('#search_cid').val(), type: $('#search_type').val() };
	if (!by_gos)
		 data.num = $('#search_num').val().trim();
	else data.gos = $('#search_gos').val().trim();

	$.get('/api/vehicles/load', data, function (r)
	{
		$('#vlist').html(r);
		$('#search_cid, #search_type, #search_num, #search_gos').prop('disabled', false);
	});
    return false;
}

document.onclick = function(e)
{
	e = e || window.event;
	E = e.target || e.srcElement;


	if (E.className != 'searchVehiclesBtn' && E.id != 'vlist_table' && E.className != 'num' && $('#vlist').css('display') == 'block') $('#vlist').hide().html('');

	if ($(E).closest('#views-selector').length == 0) $('#views-selector').hide();
};




function artClick()
{
	var art = $('input[name="art"]:checked').val();
	if (art == 0)
	{
		$('.lnk-vehicle').show();
		$('.lnk-gallery').hide();
	}
	else
	{
		$('.lnk-vehicle').hide();
		$('.lnk-gallery').show();

		loadGalleries(art == 2 ? 0 : $('#search_cid').val());
	}

	$('#lnk_cid_tr')[art == 2 ? 'hide' : 'show']();
}




function loadGalleries(cid)
{
	if (cid == gal_cid) return;
	gal_cid = cid;

	var sel = $('#search_gid').prop('disabled', true).empty().append('<option value="0">' + _text['UP_LOADING'] + '</option>');
	$.get('/api.php', { action: 'get-galleries', cid: gal_cid }, function(data) { sel.html(data).prop('disabled', false); }, 'html');
}



function showDefaultCity()
{
	var cids = $('#links input[name="cids[]"]');
	if (cids.length == 0)
	{
		cnames.length = 0;
		return;
	}

	var i, cid, new_cnames = {};
	for (i = 0; i < cids.length; i++)
	{
		cid = cids.eq(i).val();
		if (cid) new_cnames[cid] = cnames[cid];
	}

	var keys = Object.keys(new_cnames);
	if (keys.length)
	{
		cnames = new_cnames;

		cid = $('#main-cid').val();
		if (cnames[cid] == undefined)
		{
			keys = Object.keys(cnames);
			$('#main-cid').val(keys[0]);
			$('#main-cname').val(cnames[keys[0]]);
		}
	}
}






function setDate(d, m, y)
{
	$('#day').val(d);
	$('#month').val(m);
	$('#year').val(y);
	$('#pdate_approx').val(0);
}








function showHint(id) { $('#'+id+'_hint').fadeIn() }
function hideHint(id) { $('#'+id+'_hint').fadeOut() }




function toggleNAA(wl)
{
	if ($('#naa').prop('checked'))
	{
		$('#naa_hint').show();

		if (!wl)
		{
			$('#pub1_label').hide();
			$('#pub0').prop('checked', true);
		}
	}
	else
	{
		$('#naa_hint').hide();
		$('#pub1_label').show();
	}
}



function checkSpecialViews()
{
	var fields = $('.route, .notes');
	if (!moderator) fields.add('#place');

	if ($('.view[value="9"], .view[value="10"], .view[value="11"], .view[value="12"]').length > 0)
		 fields.prop('disabled', true).val('');
	else fields.prop('disabled', false);
}