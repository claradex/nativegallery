/**
 * tablesort plugin for jQuery
 * Written by Alexander Konov
 * Based on TableDnD ideas (https://github.com/isocra/TableDnD)
 */

(function($)
{
    $.fn.tablesort = function(options)
	{
		function recountRows(tbl)
		{
			var opts = tbl.data('opts');
			var rows = $(opts.rowSelector, tbl);
			var rowsCount = rows.length;
			var handle = (opts.dragHandle ? $(opts.dragHandle, tbl) : tbl);

			tbl.data('rowsCount', rowsCount);
			handle[rowsCount > 1 ? 'addClass' : 'removeClass']('tablesort-active');

			return rows;
		}


		$(this).each(function()
		{
			var table = $(this);

			// Метод recountRows нужно вызывать извне при добавлении или удалении строк в таблице
			// Это требуется для автоотключения сортировки, если в таблице только одна строка
			if (typeof options == 'string' && options == 'recountRows')
			{
				recountRows(table);
				return table;
			}


			var eventStart = 'touchstart.tablesort mousedown.tablesort';
			var eventMove  = 'touchmove.tablesort mousemove.tablesort';
			var eventEnd   = 'touchend.tablesort mouseup.tablesort';

			var dragObject = null;
			var mouseOffset = null;
			var oldY = 0;

			var defaults = {
				rowSelector: 'tr', // Можно указать tbody, если надо перемещать блоки, состоящие из нескольких строк
				dragHandle: null,  // Селектор "ручки" для переноса (по умолчанию можно перемещать, потянув за любое место строки, кроме <a> и <input>)
				sensitivity: 10,   // Sensitivity setting will throttle the trigger rate for movement detection
				onChange: null     // Функция onChange
			};

			if (options == undefined) options = {};
			var opts = $.extend({}, defaults, options);

			table.data('opts', opts);


			if (opts.dragHandle)
				 table.on(eventStart, opts.dragHandle,  function(e) { startDrag($(this).closest(opts.rowSelector), e); });
			else table.on(eventStart, opts.rowSelector, function(e) { startDrag($(this), e); });

			recountRows(table);


			function startDrag(dragObj, e)
			{
				if (table.data('rowsCount') <= 1) return; // Некуда перетаскивать - всего одна строка в таблице

				var target = $(e.target);
				if (target.closest('a').length != 0 || target.is('input') || target.is('select') || target.is('textarea')) return; // Неподходящие для перетаскивания элементы с собственным поведением

				e.preventDefault();

				dragObject = dragObj;
				mouseOffset = getMouseY(e) - $(e.target).offset().top;

				$(document).on(eventMove, mouseMove).on(eventEnd, mouseUp);

				$('html').add(opts.dragHandle ? $(opts.dragHandle, table) : table).addClass('tablesort-dragging');
				toggleObjectClass(dragObject);
			}


			function toggleObjectClass(obj)
			{
				var s = obj.attr('class');
				if (!s) return;

				var i, cls, arr = s.split(' ');

				for (i = 0; i < arr.length; i++)
				{
					if (/s[0-9]{1,2}/.test(arr[i]))
					{
						cls = parseInt(arr[i].substr(1));
						arr[i] = 's' + (cls >= 10 && cls <= 19 || cls >= 30 && cls <= 39 ? cls-10 : cls+10);
					}

					obj.attr('class', arr.join(' '));
				}
			}


			function getMouseY(e)
			{
				if (e.originalEvent.changedTouches) return e.originalEvent.changedTouches[0].clientY + $(document).scrollTop();
				if (e.pageY) return e.pageY;
				return e.clientY + $(document).scrollTop();
			}


			function checkPageScroll(e)
			{
				var y = (e.originalEvent.changedTouches) ? e.originalEvent.changedTouches[0].clientY : e.clientY;
				var h = $(window).innerHeight();

				if (y <     25) window.scrollBy(0, -10); else
				if (y > h - 25) window.scrollBy(0,  10);
			}


			function rowMoving(dir, currentRow)
			{
				if (!dir || !currentRow) return;
				currentRow[dir > 0 ? 'after' : 'before'](dragObject);
			}


			function mouseMove(e)
			{
				if (!dragObject) return false;
				e.preventDefault();

				checkPageScroll(e);

				var mouseY = getMouseY(e);
				rowMoving(findDragDirection(mouseY), findDropTargetRow(dragObject, mouseY));

				return false;
			}


			function findDragDirection(y)
			{
				var yMin = oldY - opts.sensitivity;
				var yMax = oldY + opts.sensitivity;

				var dir = y >= yMin && y <= yMax ? 0 : y > oldY ? 1 : -1;
				if (dir) oldY = y;

				return dir;
			}


			function findDropTargetRow(draggedRow, y)
			{
				var row, rowY;
				var rows = recountRows(table);
				var rowsCount = table.data('rowsCount');

				for (var i = 0; i < rowsCount; i++)
				{
					row = rows.eq(i);
					rowY = row.offset().top;

					if (y >= rowY && y <= rowY + row.outerHeight()) return draggedRow.is(row) ? null : row;
				}

				return null;
			}


			function mouseUp(e)
			{
				if (!dragObject) return null;
				e.preventDefault();

				$(document).off(eventMove + ' ' + eventEnd);

				toggleObjectClass(dragObject);
				dragObject = null;

				$('html').add('.tablesort-dragging').removeClass('tablesort-dragging');

				if (opts.onChange) opts.onChange.call(table);
				return false;
			}

			return table;
		});
	}
})(jQuery);