/**
 * @title AJAX Chart jQuery Plugin
 * @author Alex Furey
 * @date 10-aug-2016
 * @version 1.2.6
 */

(function($) {
	
	function getWrapper(element, params) {
		return $(element).data($.fn.achart.dataKeys.wrapper);
	}
	
	function getChart(element, params) {
		return getWrapper(element, params).getChart();
	}
	
	function getImage(element, params) {
		return getChart(element, params).getImageURI();
	}
	
	function drawChart(element, params) {
		getWrapper(element, params).draw();
	}
	
	function forceID(element) {
		var id = $(element).attr('id');
		if (typeof id === typeof undefined || id === false) {
			forceID.next = ++forceID.next || 1;
			$(element).attr('id', $.fn.achart.autoIdPrefix + forceID.next);
			return $(element).attr('id');
		} else {
			return id;
		}
	}
	
	function initChart(element, type, opts) {
		type = type || $.fn.achart.defaults.init.type;
		opts = opts || $.fn.achart.defaults.init.opts;
		var wrapper = new google.visualization.ChartWrapper({
			chartType: type,
			containerId: forceID(element),
			options: opts
		});
		$(element).data($.fn.achart.dataKeys.wrapper, wrapper);
		google.visualization.events.addOneTimeListener(wrapper, 'ready', function() {
			google.visualization.events.addListener(wrapper, 'ready', function() {
				$(element).trigger('achart.ready', arguments);
			});
			google.visualization.events.addListener(wrapper, 'select', function() {
				$(element).trigger('achart.select', getChart(element).getSelection(), arguments);
			});
			google.visualization.events.addListener(wrapper.getChart(), 'error', function() {
				$(element).trigger('achart.error', arguments);
			});
		});
	}
	
	function updateSettings(element, opts, overwrite) {
		var wrapper = getWrapper(element);
		var hasData = $(element).data($.fn.achart.dataKeys.hasData);
		overwrite = overwrite || $.fn.achart.defaults.update.overwrite;
		opts = (overwrite ? opts : $.extend(true, {}, wrapper.getOptions(), opts));
		wrapper.setOptions(opts);
		if (hasData) {
			drawChart(element);
		}
	}
	
	function loadData(element, ajax, expect) {
		var wrapper = getWrapper(element);
		expect = expect || $.fn.achart.defaults.load.expect;
		ajax.dataType = $.fn.achart.defaults.load.ajax.dataType;
		$(element).data($.fn.achart.dataKeys.lastAjax, ajax);
		$(element).data($.fn.achart.dataKeys.lastExpect, expect);
		return $.ajax(ajax).done(function(data) {
			wrapper.setDataTable(new google.visualization.DataTable(data[expect]));
			drawChart(element);
			$(element).data($.fn.achart.dataKeys.hasData, true);
		});
	}
	
	function reloadData(element, ajax, expect) {
		var lastAjax = $(element).data($.fn.achart.dataKeys.lastAjax) || {};
		var lastExpect = $(element).data($.fn.achart.dataKeys.lastExpect) || $.fn.achart.defaults.load.expect;
		$.extend(true, lastAjax, ajax);
		return loadData(element, lastAjax, lastExpect);
	}
	
	function chartSelection(element, selection) {
		if (selection) {
			getChart(element).setSelection(selection);
		} else {
			selection = getChart(element).getSelection();
		}
		return selection;
	}
	
	$.fn.achart = function(action, a, b) {
		if (action === 'wrapper') {
			return getWrapper(this);
		} else if (action === 'chart') {
			return getChart(this);
		} else if (action === 'image') {
			return getImage(this);
		} else if (action === 'load') {
			return loadData(this, a, b);
		} else if (action === 'reload') {
			return reloadData(this, a, b);
		} else if (action === 'select') {
			return chartSelection(this, a);
		} else {
			return this.each(function() {
				if (action === 'draw') {
					drawChart(this);
				} else if (action === 'update') {
					updateSettings(this, a, b);
				} else if (action === 'init') {
					initChart(this, a, b);
				}
			});
		}
	};
	
	$.achart = function() {
		var callbacks = arguments;
		google.charts.setOnLoadCallback(function() {
			$.each(callbacks, function(index, callback) {
				if ($.isFunction(callback)) {
					callback();
				}
			});
		});
	};
	
	$.fn.achart.autoIdPrefix = 'achart-autoid-';
	$.fn.achart.dataKeys = {
		wrapper: 'achart-wrapper',
		hasData: 'achart-hasdata',
		lastAjax: 'achart-lastajax',
		lastExpect: 'achart-lastexpect'
	};
	$.fn.achart.defaults = {
		init: {
			type: 'PieChart',
			opts: {}
		},
		update: {
			overwrite: false
		},
		load: {
			ajax: {
				dataType: 'json'
			},
			expect: 'data'
		}
	};
	
})(jQuery);
