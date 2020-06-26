// (c) Nicole Collings 2019-present, all rights reserved.
class LoadingSpinner {
	element: JQuery;

	constructor(appendTo: JQuery) {
		this.element = $(`
		<div class="sk-cube-grid">
		  <div class="sk-cube sk-cube1"></div>
		  <div class="sk-cube sk-cube2"></div>
		  <div class="sk-cube sk-cube3"></div>
		  <div class="sk-cube sk-cube4"></div>
		  <div class="sk-cube sk-cube5"></div>
		  <div class="sk-cube sk-cube6"></div>
		  <div class="sk-cube sk-cube7"></div>
		  <div class="sk-cube sk-cube8"></div>
		  <div class="sk-cube sk-cube9"></div>
		</div>`);

		this.element.appendTo(appendTo);
		setTimeout(() => {
			this.element.addClass('visible');
		}, 16);
	}

	remove() : void {
		this.element.removeClass('visible');
		setTimeout(() => {	
			this.element.remove();
		}, 200);
	}
}
