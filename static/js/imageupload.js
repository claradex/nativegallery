function formatUploadError(str, d1, d2)
{
	var p = str.indexOf('%d');
	str = str.substr(0, p) + d1 + str.substr(p+2);

	p = str.indexOf('%d');
	str = str.substr(0, p) + d2 + str.substr(p+2);

	return str;
}


function roundEx(n)
{
	return Math.floor(n * 100) / 100;
}


function cannotUpload(input, e)
{
	alert(e + '.');
	$(input).val('');
	$('#filename, #preview').html('');
}


function checkImageForUpload(input, checksize, successCallback)
{
	var ext;
	if (input.files[0].type == 'image/jpeg' || input.files[0].type == 'image/pjpeg') ext = 'jpg'; else
	if (input.files[0].type == 'image/webp') ext = 'webp'; else
	if (input.files[0].type == 'image/gif') ext = 'gif'; else
	if (input.files[0].type == 'image/png') ext = 'png';
	else
	{
		cannotUpload(input, _text['UP_WRONGTYPE']);
		return;
	}

	var size = input.files[0].size / 1024;

	var imageUrl = window.URL.createObjectURL(input.files[0]);

	var img = new Image();
	img.onload = function()
	{
		var warn = '', need_resize = false;

		if (checksize)
		{
			try
			{
				if (UPLOAD_MIN_PX &&
					(
						(img.width >= img.height && img.width  < UPLOAD_MIN_PX) ||
						(img.width <  img.height && img.height < UPLOAD_MIN_PX)
					)
				) throw formatUploadError(_text['UP_TOOSMALL'], img.width > img.height ? img.width : img.height, UPLOAD_MIN_PX);

				if (((ext == 'jpg' || ext == 'webp') && UPLOAD_JPG_MAX_PX && img.width + img.height > UPLOAD_JPG_MAX_PX) ||
					((ext != 'jpg' && ext != 'webp') && UPLOAD_PNG_MAX_PX && img.width > UPLOAD_PNG_MAX_PX && img.height > UPLOAD_PNG_MAX_PX))
				{
					// Если нужно уменьшить - уменьшаем
					if (UPLOAD_STD_PX && (ext == 'jpg' || ext == 'webp'))
					{
						need_resize = true;
						warn = formatUploadError(_text['UP_NEEDRESIZE'], UPLOAD_JPG_MAX_PX, UPLOAD_STD_PX);
					}
					else
					if (!can_upload_oversized)
					{
						if (ext == 'jpg' || ext == 'webp')
							 throw formatUploadError(_text['UP_OVERSIZE_JPG'], img.width + img.height, UPLOAD_JPG_MAX_PX);
						else throw formatUploadError(_text['UP_OVERSIZE_PNG'], img.width > img.height ? img.width : img.height, UPLOAD_PNG_MAX_PX);
					}
				}

				if (!need_resize)
				{
					var max_size;

					if ((ext == 'jpg' || ext == 'webp') && !can_upload_oversized)
						 max_size = maxsize;
					else max_size = UPLOAD_MAX_SIZE * 1024;

					if (size > max_size)
					{
						if (ext == 'jpg' || ext == 'webp')
							 throw formatUploadError(_text['UP_LARGEFILE_JPG'], Math.ceil(size), max_size);
						else throw formatUploadError(_text['UP_LARGEFILE_PNG'], roundEx(size / 1024), UPLOAD_MAX_SIZE);
					}
				}
			}
			catch (e)
			{
				cannotUpload(input, e);
				return;
			}
		}

		$('#preview').html((warn ? '<div class="label-orange" style="display:inline-block; padding:3px 7px; margin-bottom:10px">' + warn + '.</div><br />' : '') + '<a href="' + imageUrl + '" target="_blank"><img src="' + imageUrl + '" class="f" /></a><br /><br />');

		if (successCallback) successCallback(input);
	};

	img.src = imageUrl;
}