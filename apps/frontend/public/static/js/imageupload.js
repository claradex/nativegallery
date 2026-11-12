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
	console.log(e);
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
		

		if (successCallback) successCallback(input);
	};

	img.src = imageUrl;
}