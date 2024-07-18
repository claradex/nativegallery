var navLock = false;
var lastQuoteLinkBlock = true;

$(document).ready(function()
{
	// Изменение рейтинга комментария (с учётом форматирования)
	function setComVote(cell, rating)
	{
		if (rating > 0) cell.removeClass('con').addClass('pro').html('+' + rating); else
		if (rating < 0) cell.removeClass('pro').addClass('con').html('&ndash;' + parseInt(-rating));
		else cell.removeClass('pro con').html(0);
	}


	// Голосование за комментарии
	$(document).on('click', '.w-btn', function()
	{
		var vote = $(this).attr('vote');
		if (vote != 0 && vote != 1) return false;

		var voted = $(this).is('.voted');
		$(this).toggleClass('voted');

		var diff = (vote == 1 && !voted || vote == 0 && voted) ? 1 : -1;

		var otherButton = $(this).siblings('.w-btn');
		var votedOther = otherButton.is('.voted');

		if (votedOther)
		{
			otherButton.removeClass('voted');
			diff *= 2;
		}

		var cell = $(this).siblings('.w-rating');
		var rating = parseInt(cell.is('.con') ? -cell.html().substring(1) : cell.html());

		setComVote(cell, rating + diff);


		var cell_ext = $(this).siblings('.w-rating-ext');
		cell_ext.addClass('active-locked');

		var pro = $('.pro', cell_ext);
		var con = $('.con', cell_ext);

		if (vote == 1 || vote == 0 && votedOther) pro.html('+' + (parseInt(pro.text().substr(1)) + (vote == 1 && !voted ? 1 : -1)));
		if (vote == 0 || vote == 1 && votedOther) con.html('–' + (parseInt(con.text().substr(1)) + (vote == 0 && !voted ? 1 : -1)));


		var wvote = $(this).closest('.wvote');
		setTimeout(function() { $('.w-btn', wvote).removeClass('active'); }, 200);
		setTimeout(function() { cell_ext.removeClass('active active-locked'); }, 1000);

		$.getJSON('/api/photo/comment/rate', { action: 'vote-comment', wid: wvote.attr('wid'), vote: vote }, function (data)
		{
			if (data && !data[3])
			{
				$('.w-btn[vote="1"]', wvote)[data[0][1] ? 'addClass' : 'removeClass']('voted');
				$('.w-btn[vote="0"]', wvote)[data[0][0] ? 'addClass' : 'removeClass']('voted');

				pro.html('+' + data[1][1]);
				con.html('' + data[1][0]);

				setComVote(cell, data[2]);
			}
			else if (data[3]) alert(data[3]);
		})
		.fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });

		return false;
	})
	// Отображение кнопок
	.on('mouseenter mouseleave', '.w-btn[vote="1"]', function() { $(this).toggleClass('s2 s12'); })
	.on('mouseenter mouseleave', '.w-btn[vote="0"]', function() { $(this).toggleClass('s5 s15'); })
	.on('mouseenter touchstart', '.wvote', function() { $('.w-btn, .w-rating-ext', this).addClass('active'); })
	.on('mouseleave', '.wvote', function() { $('.w-btn, .w-rating-ext', this).removeClass('active'); })
	.on('touchstart', function(e) { if (!$(e.target).is('.wvote') && $(e.target).closest('.wvote').length == 0) $('.w-btn, .w-rating-ext').removeClass('active'); });


	// Подсветка комментария, если дана ссылка на комментарий
	var anchorTestReg = /#(\d+)$/;
	var arr = anchorTestReg.exec(window.location.href);
	if (arr != null) $('.comment[wid="' + arr[1] + '"]').addClass('s2');


	// Ссылка на комментарий
	$('.cmLink').on('click', function()
	{
		var comment = $(this).closest('.comment');
		comment.siblings().removeClass('s2');
		comment.addClass('s2');
	});


	// Удаление комментария
	$('.delLink').on('click', function() { return confirm(_text['P_DEL_CONF']); });


	// Цитирование
	$('.quoteLink').on('click', function()
	{
		var comment = $(this).closest('.comment'), mText, mTextArray;
		var selection = window.getSelection();

		var selectedText = selection.toString();
		var quotedText = (selectedText == '') ? $('.message-text', comment).text() : selectedText;
		var msg = '';

		if (selectedText == '' && comment.next('.comment').length == 0) msg = _text['P_QUOTE_MSG']; else
		if (quotedText.length > 600) msg = _text['P_QUOTE_LEN'];

		if (msg != '')
		{
			if ($('.no-quote-last', comment).length == 0) comment.append('<div class="no-quote-last">' + msg + '</div>');

			if (lastQuoteLinkBlock)
			{
				lastQuoteLinkBlock = false;
				return false;
			}
		}
		else $('.no-quote-last').remove();

		if (selectedText == '')
			 mText = $('.message-text', comment).html();
		else mText = $('<div>').append(selection.getRangeAt(0).cloneContents()).html();

		mText = mText.replace(/<\/?i[^>]*>/ig, '').replace(/<\/?u>/ig, '').replace(/<\/?span[^>]*>/ig, '').replace(/<\/?div[^>]*>/ig, '');
		mText = mText.replace(new RegExp('\<a href\=\"', 'ig'), '').replace(new RegExp('\" target\=\"\_blank\"\>[^>]*\<\/a\>', 'ig'), '');
		mText = mText.replace(/<br/ig, '[br]').replace(/(<([^>]+)>)/ig, '').replace(/\[br\]/ig, '<br');
		mText = mText.replace(/&gt;/ig, '>').replace(/&lt;/ig, '<').replace(/&quote;/ig, '"').replace(/&amp;/ig, '&');
		mTextArray = mText.split(/<br\s*\/?>\s*/i);

		var mText2 = '';
		for (var i = 0; i < mTextArray.length; ++i)
			mText2 += '> ' + mTextArray[i] + '\n';

		var txtField = $('#wtext');
		if (txtField.length)
		{
			var messageText = txtField.val();
			var insertText = (messageText == '' ? '' : '\n') + _text['P_QUOTE_TXT'] + ' (' + $('.message_author', comment).text() + ', ' + $('.message_date', comment).text() + '):\n' + mText2 + '\n';

			txtField.val(messageText + insertText);
			txtField[0].focus();
		}

		return false;
	});


	// Отправка комментария


	// Окно ввода комментария
	$('#wtext').on('keypress', function(e) { if ((e.which == 10 || e.which == 13) && e.ctrlKey) $('#f1').submit(); })
	.on('focus', function() { navLock = true; })
	.on('blur', function() { navLock = false; });

});