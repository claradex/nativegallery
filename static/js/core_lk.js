var gal_cid = -1;
var new_vehicle_idx = 0;
var modified = false;


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
		html += '<td style="padding:3px 10px 5px"><input type="hidden" name="nids[]" value="' + nid + '"><input type="hidden" name="cids[]" value="' + cid + '"><a href="' + (nid > 0 ? '/vehicle/' + vid + '/#n' + nid : '/lk/vehicles.php?action=edit&amp;vid=' + (-nid)) + '" target="_blank" class="num pcnt">' + $('.num', this).html() + '</a></td>\n';
		html += '<td style="padding:3px 10px 6px">' + $('.mname', this).html() + '</td>\n';
		html += '<td style="padding:3px 0 6px 10px; color:#777" class="r">' + _text['UP_ROUTE'] + ':</td>\n';
		html += '<td style="padding:3px 7px" class="nw"><input type="text" class="route" name="route[' + nid + ']" style="width:40px; font-weight:bold; text-align:center" maxlength="7" value="">, <input type="text" class="notes" name="notes[' + nid + ']" style="width:170px" maxlength="100" value="" placeholder="' + _text['UP_NOTES'] + '"></td>\n';
		html += '<td class="r"><a href="#" class="delLink" style="font-size:16px">&times;</a></td>\n';
		html += '</tr>\n';

		html += '<tr>\n';
		html += '<td style="padding:0 12px 7px" colspan="2"><a href="/city/' + cid + '/" target="_blank">' + cname + '</a></td>\n';
		html += '<td style="padding:0 0 7px; color:#777" class="r">' + _text['VIEW'] + ':</td>\n';
		html += '<td style="padding:0 7px 7px" colspan="2"><input type="hidden" class="view" name="view[' + nid + ']" value="0"><a href="#" class="view_link dot">' + views[0] + '</a></td>\n';
		html += '</tr>\n';

		html += '<tr>\n';
		html += '<td colspan="2"></td>\n';
		html += '<td style="padding:0 0 7px; color:#777" class="r">' + _text['UP_BIND'] + ':</td>\n';
		html += '<td style="padding:0 7px 7px" colspan="2"><input type="hidden" name="pri[' + nid + ']" class="pri-value" value="1"><a class="pri-label dot" href="#">' + binds[0].label + '</a></td>\n';
		html += '</tr>\n';

		html += '</tbody>\n';

		var row = $(html);
		$('#conn_veh').append(row).show().tablesort('recountRows');
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


	$('#search_type').on('change', function() { changeColor(this); }).change();


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

	var data = { cid: $('#search_cid').val(), type: $('#search_type').val(), pub_pid: pub_pid };
	if (!by_gos)
		 data.num = $('#search_num').val().trim();
	else data.gos = $('#search_gos').val().trim();

	$.get('/api.php?action=upload-search-vehicles', data, function (r)
	{
		$('#vlist').html(r);
		$('#search_cid, #search_type, #search_num, #search_gos').prop('disabled', false);
	});
    return false;
}




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
			selectCity(keys[0]);
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




document.onclick = function(e)
{
	e = e || window.event;
	E = e.target || e.srcElement;
	if (E.id != 'phint' && E.parentNode.id != 'phint' && E != _getID('mform').place) $('#phint').slideUp();

	if (E.className != 'searchVehiclesBtn' && E.id != 'vlist_table' && E.className != 'num' && $('#vlist').css('display') == 'block') $('#vlist').hide().html('');

	if ($(E).closest('#views-selector').length == 0) $('#views-selector').hide();
};



function showHint(id) { $('#'+id+'_hint').fadeIn() }
function hideHint(id) { $('#'+id+'_hint').fadeOut() }

function changeColor(sel) {	sel.className = sel.options[sel.selectedIndex].className }



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