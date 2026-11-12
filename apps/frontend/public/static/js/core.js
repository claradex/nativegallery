var _text = {};

function _getID(t)
{
	return document.getElementById(t);
}

function trim(t)
{
	return t.replace(/^\s+/, '').replace(/\s+$/, '');
}

function addTexts(txt)
{
	for (var key in txt) _text[key] = txt[key];
}

function switchClass(objNode, strCurrClass, strNewClass)
{
	if (matchClass(objNode, strNewClass))
		 replaceClass(objNode, strCurrClass, strNewClass);
	else replaceClass(objNode, strNewClass, strCurrClass);
}

function removeClass(objNode, strCurrClass)
{
	replaceClass(objNode, '', strCurrClass);
}

function addClass(objNode, strNewClass)
{
	replaceClass(objNode, strNewClass, '');
}

function replaceClass(objNode, strNewClass, strCurrClass)
{
	var strOldClass = strNewClass;
	if (strCurrClass && strCurrClass.length)
	{
		strCurrClass = strCurrClass.replace('/\s+(\S)/g', '|$1');
		if (strOldClass.length) strOldClass += '|';
		strOldClass += strCurrClass;
	}
	objNode.className = objNode.className.replace(new RegExp('(^|\\s+)(' + strOldClass + ')($|\\s+)', 'g'), '$1');
	objNode.className += ((objNode.className.length)? ' ' : '') + strNewClass;
}

function matchClass(objNode, strCurrClass)
{
	return (objNode && objNode.className.length && objNode.className.match(new RegExp('(^|\\s+)(' + strCurrClass + ')($|\\s+)')));
}

function showId(id)
{
	_getID(id).style.display = 'block';
}

function hideId(id)
{
	_getID(id).style.display = 'none';
}


$(document).ready(function()
{
	$(this).on('keydown', function(e)
	{
		if ($(e.target).is('input, textarea')) return;

		if (e.ctrlKey)
		{
			var link;

			switch (e.which)
			{
			case 0x24: window.location = '/'; return;
			case 0x25: link = 'PrevLink'; break;
			case 0x27: link = 'NextLink'; break;
			case 0x26: link =   'UpLink'; break;
			case 0x28: link = 'DownLink'; break;
			}

			if (link)
			{
				var a = $('#' + link);
				if (a.length) window.location = a.attr('href')
			}
		}
	});

	$('a.self-close').on('click', function()
	{
		window.open(this.href);
		return false;
	});

	$('input, select, textarea', $('.form-field')).on('focus blur', function() { $(this).closest('.form-field').toggleClass('active').prev('.form-label').toggleClass('active'); })
});