(function($)
{
    $.fn.selector2 = function(items, options)
    {
		if (this.length == 0) return;

    	this.each(function()
		{
			var labelElement = $(this);
			var valueField = $('input', labelElement.parent());
			var currentIndex = -1;

			var defaults = {
				selectCallback: null
			};

			if (options == undefined) options = {};
			var opts = $.extend({}, defaults, options);


			labelElement.on('click', function()
			{
				var currentValue = valueField.val();

				var val, html = '<div class="selector2-helper">';
				for (var i = 0; i < items.length; i++)
				{
					html += '<div data-index="' + i + '" data-value="' + items[i].value + '"';
					if (items[i].value == currentValue)
					{
						currentIndex = i;
						html += ' class="hov"';
					}
					html += '>' + (items[i].item || items[i].label) + '</div>';
				}
				html += '</div>';

				var helper = $(html).appendTo('body');
				var offset = $(this).offset();

				helper.css('top', Math.max(0, offset.top - currentIndex * 22 - 1) + 'px');
				helper.css('left', (offset.left - 7) + 'px');

				helper.on('click', '> div', function()
				{
					var el = $(this);
					var val = el.data('value');
					var idx = el.data('index');

					valueField.val(val);
					labelElement.html(items[idx].label);
					if (opts.selectCallback) opts.selectCallback.call(labelElement, val);

					helper.remove();
					$(document).off('.selector2');
				})
				.on('mouseenter', '> div', function() { var el = $(this); el.addClass('hov').siblings().removeClass('hov'); currentIndex = el.data('index'); });

				$(document).on('click.selector2', function(e)
				{
					if (!$(e.target).is(helper)) helper.remove();
					$(document).off('.selector2');
				})
				.on('keydown.selector2', function(e)
				{
					if (e.which == 40 || e.which == 38)
					{
						e.preventDefault();
						$('> div', helper).removeClass('hov');
						if (e.which == 40 && ++currentIndex == items.length) currentIndex = 0; else
						if (e.which == 38 && --currentIndex < 0) currentIndex = items.length - 1;
						$('div[data-index="' + currentIndex + '"]', helper).addClass('hov');
					}
					else
					if ((e.which == 13 || e.which == 32) && currentIndex != -1)
					{
						e.preventDefault();
						$('div[data-index="' + currentIndex + '"]', helper).trigger('click');
					}
					else
					if (e.which == 27 || e.which == 8)
					{
						e.preventDefault();
						helper.remove();
						$(document).off('.selector2');
					}
				});

				helper.show();

				return false;
			});
		});

		return this;
	};
})(jQuery);
