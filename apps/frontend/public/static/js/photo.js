$(document).ready(function()
{
	// Убираем лишние параметры
	var url = document.location.toString();
	url = url.replace(/\?vid=\d+$/, '');
	url = url.replace(/\?gid=\d+$/, '');
	url = url.replace(/\?aid=\d+$/, '');
	url = url.replace(/\?upd=\d+$/, '');
	url = url.replace(/\?top=\d+$/, '');
	history.replaceState({}, '', url);


	// Переход к следующему фото
	$('#prev, #next').click(function()
	{
		var next = (this.id == 'prev' ? 0 : 1);

		$.get('/api.php', { action: 'move', pid: pid, vid: vid, gid: gid, aid: aid, next: next }, function(pid)
		{
			if (pid == 0)
			{
				if (!vid && !gid)
				{
					if (next)
						 alert(_text['P_MOVE_FIRST'] + '.');
					else alert(_text['P_MOVE_LAST']  + '.');
				}
				else alert(_text[vid ? 'P_MOVE_ALONE_V' : 'P_MOVE_ALONE_G'] + '.');
			}
			else window.location = '/photo/' + pid + '/' + (vid ? '?vid=' + vid : (gid ? '?gid=' + gid : (aid ? '?aid=' + aid : (upd ? '?upd=1' : ''))));
		});
	});


	// Показ карты
	$('#showmap a').click(function()
	{
		$('#map').show();
		$('#showmap').hide();

		initMap(lat, lng, {
			showNearMarkers: true,
			showCenterMarker: true,
			draggable: false,
			dir: dir
		});

		return false;
	});


	// Голосование за фото
	$('.vote_btn').click(function()
	{
		var vote = $(this).attr('vote');
		if (vote != 0 && vote != 1) return false;
		if (vote) $('.toggle').attr('class', 'toggle on');

		var pid = $(this).closest('.vote').attr('pid');

		var savedClass1 = $('.vote_btn[vote="1"]').attr('class');
		var savedClass0 = $('.vote_btn[vote="0"]').attr('class');

		$(this).toggleClass('voted');
		if ($(this).is('.voted')) $('.vote_btn[vote="' + Number(!Number(vote)) + '"]').removeClass('voted');

		$('.loader[pid="' + pid + '"]').css('visibility', 'visible');

		$.getJSON('/api/photo/vote', { action: 'vote-photo', pid: pid, vote: vote }, function(data)
		{
			if (data && !data.errors)
			{
				var signs, html = '', i, j;

				for (i = 1; i >= 0; i--)
				{
					if (data.votes[i] && data.votes[i].length != 0)
					{
						console.log(i);
						html += '<table class="vblock ' + (i ? 'pro' : 'con' ) + '"><col width="100%">';

						for (j = 0; j < data.votes[i].length; j++)
							html += '<tr><td><a href="/author/' + data.votes[i][j][0] + '/">' + data.votes[i][j][1] + '</a></td><td>' + (data.votes[i][j][2] > 0 ? '+' : '&ndash;') + '1</td></tr>';

						html += '</table>';
					}
				}

				$('#votes').html(html)[html == '' ? 'hide' : 'show']();
				$('.vote[pid="' + pid + '"][vote="1"]')[data.buttons.posbtn ? 'addClass' : 'removeClass']('voted');
				$('.vote[pid="' + pid + '"][vote="0"]')[data.buttons.negbtn ? 'addClass' : 'removeClass']('voted')

				var rating = parseInt(data.rating);
				if (rating > 0) $('#rating').html('+' + rating); else
				if (rating < 0) $('#rating').html('&ndash;' + parseInt(-rating));
						   else $('#rating').html('0');
			}
			else
			{
				$('.vote_btn[vote="1"]').attr('class', savedClass1);
				$('.vote_btn[vote="0"]').attr('class', savedClass0);

				if (data.errors) alert(data.errors);
			}

			$('.loader[pid="' + pid + '"]').css('visibility', 'hidden');
		})
		.fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });

		return false;
	});


	// Конкурсное голосование
	$('.konk_btn').click(function()
	{
		var vote = $(this).attr('vote');
		if (vote != 0 && vote != 1 || $(this).is('.locked')) return false;

		var pid = $(this).closest('.vote').attr('pid');
		var cid = $(this).closest('.vote').attr('cid');
		var savedClass1 = $('.vote[pid="' + pid + '"] .konk_btn[vote="1"]').attr('class');
		var savedClass0 = $('.vote[pid="' + pid + '"] .konk_btn[vote="0"]').attr('class');

		$('.loader[pid="' + pid + '"]').css('visibility', 'visible');

		$(this).toggleClass('voted');
		if ($(this).is('.voted')) $('.vote[pid="' + pid + '"] .konk_btn[vote="' + Number(!Number(vote)) + '"]').removeClass('voted');
		var self_p = 0;
		if (!self_p) // Чужие фото
		{
			$(this).closest('.p20p').removeAttr('class').css('padding', '6px 6px 5px');

			$.getJSON('/api/photo/vote', { action: 'vote-konk', pid: pid, vote: vote, cid: cid }, function (data)
			{
				if (data && !data.errors)
				{
					$('.star[pid="' + pid + '"]').html(data.star ? '<img src="/img/star_' + data.star + '.png" alt="" />' : '');
					$('.vote[pid="' + pid + '"] .konk_btn[vote="1"]')[data.buttons.posbtn_contest ? 'addClass' : 'removeClass']('voted');
					$('.vote[pid="' + pid + '"] .konk_btn[vote="0"]')[data.buttons.negbtn_contest ? 'addClass' : 'removeClass']('voted');


					var rat = $('.s_rating[pid="' + pid + '"]');
					if (rat.length)
					{
						var rating = parseInt(data.rating);
						if (rating > 0) rat.html('+' + rating); else
						if (rating < 0) rat.html('&ndash;' + parseInt(-rating));
								   else rat.html('0');
					}
				}
				else
				{
					$('.vote[pid="' + pid + '"] .konk_btn[vote="1"]').attr('class', savedClass1);
					$('.vote[pid="' + pid + '"] .konk_btn[vote="0"]').attr('class', savedClass0);

					if (data.errors) alert(data.errors);
				}

				$('.loader[pid="' + pid + '"]').css('visibility', 'hidden');
			})
			.fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });
		}
		else // Свои фото
		{
			$.getJSON('/api/photo/vote', { action: 'vote-author', pid: pid, vote: vote }, function (data)
			{
				if (data && !data.errors)
				{
					$('#star[pid="' + pid + '"]').html(data.star ? '<img src="/img/star_' + data.star + '.png" alt="" />' : '');

					$('.vote[pid="' + pid + '"] .konk_btn[vote="1"]')[data.buttons.posbtn_contest ? 'addClass' : 'removeClass']('voted');
					$('.vote[pid="' + pid + '"] .konk_btn[vote="0"]')[data.buttons.negbtn_contest ? 'addClass' : 'removeClass']('voted');
				}
				else
				{
					$('.konk_btn[vote="0"]').attr('class', savedClass0);
					$('.konk_btn[vote="1"]').attr('class', savedClass1);

					if (data.errors) alert(data.errors);
				}

				$('.loader[pid="' + pid + '"]').css('visibility', 'hidden');
			})
			.fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });
		}

		return false;
	});


	// Быстрый переход по фото
    $(document).keydown(function(e)
    {
		if ($(e.target).is('input, textarea')) return;

		if (e.ctrlKey)
		{
			switch (e.which)
			{
			case 0x25: window.location = '/ph.php?pid=' + pid + '&pub=0'; break;
			case 0x27: window.location = '/ph.php?pid=' + pid + '&pub=1'; break;
			}
		}
    });


	// Избранное
	$('#favLink').click(function()
	{
		const url = window.location.pathname;
		const segments = url.split('/'); 
		const id = segments[2];
		var faved = parseInt($(this).attr('faved'));
		$(this).html(faved ? 'Добавить фото в Избранное' : 'Удалить фото из Избранного').attr('faved', faved ? 0 : 1);
		if (!faved) $('.toggle').attr('class', 'toggle on');

		$.get('/api/photo/'+id+'/favorite', function (r) { if (r != 0 && r != 1) alert(r); }).fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });
		return false;
	});


	// Показ всего EXIF
	var showexif = $('#showexif');
	if (showexif.length > 0)
	{
		showexif.on('click', function()
		{
			$('#exif tr').show();
			$('#exif tr:even').attr('class', 's11 h21');
			$('#exif tr:odd').attr('class', 's1 h21');
			$(this).closest('tr').hide();
			return false;
		});

		if ($('#exif tr:visible').length == 1) showexif.click();
	}


	// Свёрнутые блоки в мобильной версии
	$('.pp-item-header').on('click', function()
	{
		var header = $(this);
		$('.chevron', header).toggleClass('active');
		header.siblings('.pp-item-body').slideToggle('fast');
	});


	if ($('#pmain').is('.hidden')) $('.footer').addClass('hidden');


	$('.top-disclaimer-close').on('click', function()
	{
		document.cookie = 'nodisclaim=1;max-age=' + (86400 * 35) + ';path=/';
		$('.top-disclaimer').slideUp();
		return false;
	});
});


function showGrid() { $('#grid, #sh_gr, #hd_gr').toggle(); }

function showReasons() { $('#reasons').toggle(); }