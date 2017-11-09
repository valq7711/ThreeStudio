
function InspectorView(container, state)
{
	this.container = container.getElement();

	this.container.sortable({
		axis: 'y',
		handle: 'h3',
		stop: function(event, ui) {
			ui.item.children('h3').trigger('focusout');
		}
	});

	this.actor = null;

	var self = this;
	this.container.on('input change', '.component-value input', function() {
		var input = $(this);
		var attrs = input.data('name').split('.');
		obj = self.actor.components[input.closest('.component').data('index')];
		for (var i = 0; i < attrs.length - 1; ++i) {
			obj = obj[attrs[i]];
		}
		var value;
		if (input.hasClass('boolean')) {
			value = input.prop('checked');
		}
		else if (input.hasClass('integer')) {
			value = !isNaN(input.val()) ? (input.val() ? parseInt(input.val()) : input.data('default')) : undefined;
		}
		else if (input.hasClass('decimal')) {
			value = !isNaN(input.val()) ? (input.val() ? parseFloat(input.val()) : input.data('default')) : undefined;
		}
		else {
			value = input.val() || input.data('default');
		}
		if (value !== undefined) {
			var attr = attrs.pop();
			if (obj[attr]._parse) {
				obj[attr]._parse(value);
			} else {
				obj[attr] = value;
			}
		}
	});
	setInterval(this.refreshAll.bind(this), 50);
}

InspectorView.prototype.setSelection = function(actors)
{
	if (actors.length) {
		this.actor = actors[0];
		this.container.html(this.actor.components.map(serializeComponent).join('\n'));
		jscolor.installByClassName('color');
		this.refreshAll();
	} else {
		this.actor = null;
		this.container.empty();
	}
};

InspectorView.prototype.refreshAll = function(input)
{
	if (!this.actor) {
		return;
	}
	var self = this;
	this.container.find('.component-value input').each(function() {
		self.refreshInput($(this));
	});
};

InspectorView.prototype.refreshInput = function(input)
{
	if (input.is(':focus')) {
		return;
	}
	var attrs = input.data('name').split('.');
	obj = this.actor.components[input.closest('.component').data('index')];
	for (var i = 0, n = attrs.length - 1; i < n; ++i) {
		obj = obj[attrs[i]];
	}
	var attr = attrs.pop();
	var value = obj[attr];
	if (value._serialize) {
		value = obj[attr]._serialize();
	}
	if (input.hasClass('boolean')) {
		input.prop('checked', value);
	} else {
		input.val(value);
		if (input.hasClass('color')) {
			input[0].jscolor.importColor();
		}
	}
};
