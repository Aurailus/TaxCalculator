class Header {
	FLOAT_CUTOFF: number = 32;
	nav_floating: boolean = false;

	constructor(elem: JQuery) {
		
		$(document).scroll(() => {
			if ($(document).scrollTop() > this.FLOAT_CUTOFF && !this.nav_floating) {
				elem.addClass("floating");
				this.nav_floating = true;
			}
			else if ($(document).scrollTop() < this.FLOAT_CUTOFF && this.nav_floating) {
				elem.removeClass("floating");
				this.nav_floating = false;
			}
		});
	}
}
