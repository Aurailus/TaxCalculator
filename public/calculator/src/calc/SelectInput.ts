// (c) Nicole Collings 2019-present, all rights reserved.

class SelectInput {
	element: JQuery;
	options: JQuery;
	list: JQuery;
	bind: Function | any;

	constructor(element: JQuery) {
		this.element = element;
		this.options = element.children().clone();
		this.list = null;

		this.options.attr('tabindex', '0');

		element.children().each(function(i, v) {
			if (!$(v).hasClass('selected')) {
				$(v).detach();
			}
		});

		this.element.click(() => this.interact());

		$(document).keypress((e) => {
			if ($(':focus').is(this.element)) {
				this.interact();
			}
			if (this.list != null) {
				this.list.children().each((i, v) => {
					if ($(":focus").is($(v))) {
						this.selectElement($(v));
					}
				});
			}
		});
	}

	reflow() {
		//stub
	}

	private selectElement(elem: JQuery) {
		this.options.removeClass('selected');
		elem.addClass('selected');
		this.element.children('.item').remove();
		this.element.append(elem.clone());
		this.element.children('.item').removeAttr('tabindex');

		$(document).off('click', this.bind);

		this.list.removeClass('open');
		setTimeout(() => {
			this.list.remove();
			this.list = null
		}, 100);

		this.element.focus();
	}

	private closeOut() {
		//Close the popup without setting a new child
		setTimeout(() => {
			if (this.list != null) {
				$(document).off('click', this.bind);

				this.list.removeClass('open');
				setTimeout(() => {
					this.list.remove();
					this.list = null
				}, 100);
			}
		}, 150);
	}

	private interact() {
		if (this.list == null) {

			this.list = $("<div class='select_list'></div>");
			this.options.appendTo(this.list);
			this.element.append(this.list);

			setTimeout(() => {
				this.list.addClass('open');
				this.list.find('.selected').focus();
			}, 16);

			let ctx = this;
			this.options.click(function() {
				ctx.selectElement.call(ctx, $(this));
			});

			this.bind = () => this.closeOut();
			setTimeout(() => $(document).click(this.bind), 100);
		}
	}
}
