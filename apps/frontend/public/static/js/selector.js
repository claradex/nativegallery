function hlText(text, val)
{
	val = val.replace(' -', ' —');
	var p = text.toLowerCase().indexOf(val.toLowerCase());
	if (p != -1) text = text.substring(0, p) + '<span class="hl">' + text.substring(p, p + val.length) + '</span>' + text.substring(p + val.length);
	return text;
}


$(document).ready(function() { $('head').append('<link rel="stylesheet" href="/css/ui-lightness/jquery-ui-1.8.20.custom.css">'); });


(function($)
{
    $.fn.autocompleteSelector = function(valfield, query, options)
    {
    	if (this.length == 0) return;

		function idToJQ(id)
		{
			if (!id) return null;
			if (id instanceof jQuery) return id;
			if (typeof id === 'string' || id instanceof String) return $('#' + id);
			return $(id);
		}

	    var valueField = idToJQ(valfield);
		var labelField = this;

		this.savedLabel = this.val();
		var makeBold = (this.css('font-weight') == '700');

		var defaults = {
			minLength: 2,
			params: {},
			paramsCallback: null,
			selectCallback: null,
			focusCallback: null,
			blurCallback: null,
			renderItem: null,
			defaultValue: 0,
			defaultLabel: null,
			valueName: 'value',
			labelName: 'label',
			flag: null,
			flagValueName: 'rid',
			flagLabelName: null,
			hlFlag: false,
			clearField: false,
			method: 'get'
		};

	    if (options == undefined) options = {};
	    var opts = $.extend({}, defaults, options);

		var flagImg;
		if (!opts.flag)
		{
			if (opts.flagLabelName && valfield && (typeof valfield === 'string' || valfield instanceof String))
			{
				flagImg = $('#rid_' + valfield);
				if (flagImg.length == 0) flagImg = null;
			}
		}
		else flagImg = idToJQ(opts.flag);

		var xsign;
		if (valueField && opts.defaultLabel)
		{
			xsign = $('<div class="xsign" />');

			xsign.insertAfter(labelField).on('click', function()
			{
				valueField.val(opts.defaultValue);
				labelField.val(opts.defaultLabel).trigger('item-select');
				if (opts.selectCallback) opts.selectCallback(null);
			});

			var paddingRight = parseInt(labelField.css('padding-right'));

			function labelFieldChange()
			{
				if (labelField.val().trim() != opts.defaultLabel.trim())
				{
					labelField.css('padding-right', (paddingRight + 22) + 'px');
					xsign.show();
				}
				else
				{
					labelField.css('padding-right', paddingRight);
					xsign.hide();
				}
			}

			labelField.on('item-select', labelFieldChange);
			labelFieldChange();
		}
		else xsign = null;

		this.autocomplete({
			minLength: opts.minLength,
			source:	function(request, response)
			{
				if (opts.paramsCallback) opts.paramsCallback(opts.params);
		        opts.params.term = request.term;

				if (opts.method == 'post')
					$.post(query, opts.params, response, 'json').fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });
				else $.get(query, opts.params, response, 'json').fail(function(jx) { if (jx.responseText != '') alert(jx.responseText); });
			},
			focus: function(event, ui)
			{
				if (event.pageX == undefined)
				{
					labelField.val(ui.item.label);
					return false;
				}
			},
			select:	function(event, ui)
			{
				if (valueField) valueField.val(ui.item[opts.valueName]);

				if (!opts.clearField)
				{
					var label = $('<div />').html(ui.item[opts.labelName]).text();
					labelField.val(label).trigger('item-select');
					labelField.savedLabel = label;

					if (flagImg) flagImg.attr('src', '/img/r/' + ui.item[opts.flagValueName] + '.gif');
					if (makeBold) labelField.css('font-weight', 'bold');
				}
				else labelField.val(labelField.savedLabel);

				if (opts.selectCallback) opts.selectCallback(ui.item);
				return false;
			}
		})
		.focus(function()
		{
			if (valueField)
			{
				labelField.savedLabel = labelField.val();
				if (makeBold) labelField.css('font-weight', 'normal');
			}

			if (opts.focusCallback) opts.focusCallback();
		})
		.blur(function()
		{
			var val = labelField.val().trim();
			if (opts.defaultLabel && val == '')
			{
				if (valueField) valueField.val(opts.defaultValue);
				labelField.val(opts.defaultLabel).trigger('item-select');
				if (flagImg) flagImg.attr('src', '/img/r/0.gif');
				if (opts.selectCallback) opts.selectCallback(null);
			}
			else
			if (val != labelField.savedLabel) labelField.val(labelField.savedLabel);

			if (valueField && makeBold) labelField.css('font-weight', 'bold');

			if (opts.blurCallback) opts.blurCallback();
		});

	    if (!opts.renderItem)
	    {
		    if (!opts.flagLabelName)
			     opts.renderItem = function(ul, item) { return $('<li><a><b>' + hlText(item[opts.labelName], this.element.val()) + '</b></a></li>').appendTo(ul); };
		    else opts.renderItem = function(ul, item) { return $('<li><a><div style="float:right; position:relative; top:1px" class="sm">&nbsp; &nbsp;' + (item[opts.flagLabelName] != undefined ? (opts.hlFlag ? hlText(item[opts.flagLabelName], this.element.val()) : item[opts.flagLabelName]) + ' &nbsp;' : '') + '<img src="/img/r/' + item.rid + '.gif" style="position:relative; top:-1px"></div><b>' + hlText(item[opts.labelName], this.element.val()) + '</b></a></li>').appendTo(ul); };
	    }

	    this.data('ui-autocomplete')._renderItem = opts.renderItem;
		this.on('click', function() { if (labelField.savedLabel == this.value) { this.select(); } });

		return this;
	};


	$.fn.citySelector = function(valfield, options)
	{
		if (options == undefined) options = {};
		options.flagLabelName = 'rname';
		options.hlFlag = true;
    	this.autocompleteSelector(valfield, '/api.php?action=get-cities', options);
	};


	$.fn.groupSelector = function(valfield, options)
	{
		if (options == undefined) options = {};
		options.flagLabelName = 'rname';
		options.hlFlag = true;
    	this.autocompleteSelector(valfield, '/api.php?action=get-groups', options);
	};


	$.fn.regionSelector = function(valfield, options)
	{
		if (options == undefined) options = {};
		options.flagValueName = 'value';
		if (!options.renderItem) options.renderItem = function(ul, item) { return $('<li><a style="line-height:14px; padding:3px 5px"><img src="/img/r/' + item.value + '.gif"> <b>' + hlText(item.label, this.element.val()) + '</b></a></li>').appendTo(ul); };
		this.autocompleteSelector(valfield, '/api.php?action=get-regions', options);
	};


	$.fn.autocompleteHL = function(options)
	{
		this.autocomplete(options).data('ui-autocomplete')._renderItem = function(ul, item) { return $('<li><a style="line-height:14px; padding:3px 5px" class="sm">' + hlText(item.label, this.element.val()) + '</a></li>').appendTo(ul); };
	}
})(jQuery);
