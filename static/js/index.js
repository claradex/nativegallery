ar1 = new Image();
ar1.src = '/img/ar1.gif';


$(document).ready(function()
{
	$('.ix-country > a[href="#"]').on('click', function(e)
	{
		var block = $(this).parent().next('div');
		if (block.is(':hidden'))
		{
			block.slideDown();
			$('.ix-arrow', this).addClass('ix-arrow-expanded');
		}
		else
		{
			block.slideUp();
			$('.ix-arrow', this).removeClass('ix-arrow-expanded');
		}

		return false;
	});


	$(window).on('load resize', function()
	{
		var list = $('#idx-regions-list');
		var h = list.closest('table').height() - list.position().top + 40;
		list.css('height', h + 'px');
	});


	$('#loadmore').on('click', LoadRecentPhotos).click();
	$('#newrand' ).on('click', LoadRandomPhotos).click();

	updateInterval = setInterval(LoadPubPhotos, 60000);


	//$('#cname').citySelector('cid', { defaultLabel: _text['IX_ANY'] });


	$('#type').on('change', function() { $('#type').attr('class', $('#type option:selected').attr('class')); }).change();
	$('#num').on('change keyup', function() { $('#qsearch').prop('disabled', $('#num').val().trim() == ''); }).on('keypress', function(event) { if (event.keyCode == 13) { searchVehicles(); return false; } }).change();
	$('#searchbtn').on('click', searchVehicles);


	/*$('#qcity').citySelector(null, {
		selectCallback: function(item) { window.open('/city/' + item.value + '/'); },
		clearField: true
	});*/


	$(document).on('click', function(e)
	{
		var target = $(e.target);
		if (target.closest('#cars_list').length > 0 ||
			target.closest('#idx-column-menu').length > 0 ||
			target.is('#mobile-menu') ||
			target.is('button')) return;

		$('#cars_list').hide().html('');

		var menu = $('div#idx-column-menu');
		if (menu.is(':visible'))
		{
			menu.hide();
			$('#backgr').hide();
		}

		e.stopPropagation();
	});


	$('#loginbtn').on('click', function()
	{
		var username = $('#username').val().trim();
		var password = $('#password').val().trim();

		if (username != '' && username != '')
		{
			$('#loginbtn').prop('disabled', true).val(_text['IX_LOGGING']);

			$.post('/api.php?action=check-login', { username: username, password: password, remember: $('#remember').is('checked') }, function(r)
			{
				if (r == 0)
					 $('#loginform').submit();
				else window.location.reload();
			})
			.fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });
		}
	});


	$('#mobile-menu').on('click', function()
	{
		$('#idx-column-menu, #backgr').toggle();
		return false;
	});


	$('.ix-plus, .ix-minus').on('click', function()
	{
		$(this).toggleClass('ix-plus ix-minus');

		var block = $(this).closest('.ix-region');
		$('.ix-hideable-citylist, .ix-hideable-cname', block).toggle();

		return false;
	});
});


function searchVehicles()
{
	$('#cars_list').html('<img src="/img/wait.gif" style="display:block; padding:2px">').show();
	$.get('/api.php', { action: 'index-qsearch', cid: $('#cid').val(), type: $('#type').val(), num: $('#num').val() }, function (r) { $('#cars_list').html(r); });
    return false;
}



function AddPhotoToBlock(block, arr, prepend)
{
	block[prepend ? 'prepend' : 'append']('<div class="prw-grid-item"><div class="prw-wrapper">' + arr.links + '<div>' + arr.pdate + '</div></div><a href="/photo/' + arr.pid + '/" target="_blank" class="prw-animate" style="background-image:url(\'' + arr.prw + '\')">' + (arr.ccnt != 0 ? '<div class="hdshade"><div class="com-icon">' + arr.ccnt + '</div></div>' : '') + '</a></div>');
}



function LoadRandomPhotos()
{
	var random = $('#random-photos');
	var width = random.is('.mobile') ? 0 : random.width();
	var newrand = $('#newrand');
	var loader = $('#newrand-loader');

	newrand.hide();
	loader.show();

	$.getJSON('/api.php', { action: 'get-random-photos', width: width }, function(data)
	{
		random.html('');

		if (data)
			for (var i = 0; i < data.length; i++) AddPhotoToBlock(random, data[i]);
		else random.append('Load error');

		newrand.show();
		loader.hide();
	})
	.fail(function(jx) { if (jx.responseText != '') console.log(jx.responseText); });

	return false;
}



function LoadRecentPhotos()
{
	var recent = $('#recent-photos');
	var lastpid = recent.attr('lastpid');
	var width = recent.width();
	var loadmore = $('#loadmore');
	var hidden = $('.prw-grid-item:hidden', recent);

	if (recent.is('.mobile')) width *= 1.5;

	loadmore.prop('disabled', true).addClass('loader-button').val(' ');

	$.getJSON('/api.php', { action: 'get-recent-photos', width: width, lastpid: lastpid, hidden: hidden.length }, function(data)
	{
		if (data)
		{
			if (lastpid == 0) recent.attr('firstpid', data[0].pid);
			hidden.show();

			for (var i = 0; i < data.length; i++) AddPhotoToBlock(recent, data[i]);
			recent.attr('lastpid', data[i-1].pid);
		}
		else recent.append('Load error');

		loadmore.prop('disabled', false).removeClass('loader-button').val(_text['IX_LOADMORE']);
	})
	.fail(function(jx) { if (jx.responseText != '') console.log(jx.responseText); });
}



function LoadPubPhotos()
{
	var recent = $('#recent-photos');
	var firstpid = recent.attr('firstpid');

	if (firstpid == 0) return;

	$.getJSON('/api.php', { action: 'get-pub-photos', firstpid: firstpid }, function(data)
	{
		if (data)
		{
			if (data.length)
			{
				for (var i = 0; i < data.length; i++)
				{
					$('.prw-grid-item:visible', recent).eq(-1).hide();
					AddPhotoToBlock(recent, data[i], true);
				}

				recent.attr('firstpid', data[i-1].pid);
			}
		}
		else clearInterval(updateInterval);
	})
	.fail(function(jx) { if (jx.responseText != '') console.log(jx.responseText); });
}