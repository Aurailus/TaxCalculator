// (c) Nicole Collings 2019-present, all rights reserved.

class NumericInput {
	element: JQuery;
	overlay: JQuery;
	max_digits: number;

	constructor(element: JQuery, max_digits = 12) {
		this.element = element;
		this.max_digits = max_digits;

		this.element.attr('type', 'text');
		this.element.attr('inputmode', 'numeric');
		this.element.addClass('numeric');

		//Create Overlay for showing Pretty-printed value on.
		this.overlay = $("<div class='numeric_overlay'></div>");
		this.overlay.insertAfter(this.element);

		this.positionOverlay();
		this.updateOverlay();
		$(window).on('resize', () => this.positionOverlay());

		//Set Insertion Point to the End of the Input
		this.element.focus((e) => this.setInsertionPoint(e));
		//Prevent Click Events from Alterring Cursor Position.
		this.element.on("mousedown touchstart click press", (e) => this.preventCursorUpdate(e));

		//Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
		this.element.keydown((e) => this.preventKeyNav(e));
		//Disallow Non-numeric inputs (e, +, -)
		this.element.keypress((e) => this.handleUpdate(e));

		//Update overlay on external change
		this.element.change((e) => this.updateOverlay());

		this.element.on("invalid", () => this.showErrorPlaceholder());
	}

	showErrorPlaceholder() {
		let prefix = "<span class='prefix'>$</span>";
		let error = " <span class='error'>Required</span>";
		this.overlay.html(prefix + error);
	}

	reflow() {
		this.positionOverlay();
	}

	private positionOverlay() {
		let pos = this.element.position();
		let border_width = parseInt(this.element.css('border-top-width'));
		pos.top += border_width;
		pos.left += border_width;
		let pad = parseInt(this.element.css('padding-left'));
		let size = {width: this.element.innerWidth(), height: this.element.innerHeight()};

		this.overlay.css({
			"top": pos.top + pad - 1.5,
			"left": pos.left + pad,
			"max-width": size.width - pad * 2,
			"height": size.height - pad * 2 + 2
		});
	}

	private updateOverlay() {
		let prefix = "<span class='prefix'>$</span>";
		let pretty = "";
		let num = parseInt(this.element.val().toString());
		if (!isNaN(num)) pretty = parseInt(this.element.val().toString()).toLocaleString('en', { useGrouping: true });
		let str = prefix + pretty;
		this.overlay.html(str);
	}

	private getDigits() : number {
		return this.element.val().toString().length;
	}

	private setInsertionPoint(e: JQuery.FocusEvent) {
		//Set Insertion Point to the End of the Input
		let len = this.element.val().toString().length;
	  (<HTMLInputElement>this.element[0]).setSelectionRange(len, len);
	}

	private preventCursorUpdate(e: JQuery.Event) {
		//Prevent Click Events from Alterring Cursor Position.
		this.element.focus();
		return false;
	}

	private handleUpdate(e: JQuery.KeyPressEvent) {
		//Remove leading zero if there is one
		if (this.getDigits() > 0 && this.element.val().toString()[0] == "0") {
			this.element.val(this.element.val().toString().substr(1));
		}
		//Prevent Value Getting too Long
		if (this.getDigits() >= this.max_digits) {
			e.preventDefault();
			return false;
		}
		//Disallow Non-numeric inputs (e, +, -)
		if (!this.allowedInput(e.keyCode)) {
			e.preventDefault();
			return false;
		}
		//Prevent multiple leading zeroes
		if (e.keyCode == 48 && this.getDigits() > 0) {
			if (this.element.val().toString()[0] == "0") {
				e.preventDefault();
				return false;
			}
		}
	}

	private validateInput() {
		let str = this.element.val().toString();
		let sanitized = "";
		for (let i = 0; i < str.length; i++) {
			if (this.allowedInput(str.charCodeAt(i))) {
				sanitized += str[i];
			}
		}
		if (str != sanitized) {
			this.element.val(sanitized);
		}
	}

	private preventKeyNav(e: JQuery.KeyDownEvent) {
		//Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
		if (!this.allowedInput(e.keyCode)) {
			//Android doesn't seem to call KeyPress events on the mobile keyboard always, 
			//so if an invalid key is pressed, set a timeout to validate the contents after it has been added.
			setTimeout(() => this.validateInput(), 1);

			e.preventDefault();
			e.stopPropagation();
			return false;
		}

		//Update the overlay, this is in this method so that backspace events also update it.
		setTimeout(() => this.updateOverlay(), 1);
	}

	private allowedInput(k: number): boolean {
		//Backspace
		if (k == 8) return true;
		//Tab
		if (k == 9) return true;
		//Number Row
		if (k >= 48 && k <= 57) return true;
		//Number Pad
		if (k >= 96 && k <= 105) return true;

		return false;
	}
}
