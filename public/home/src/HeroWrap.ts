class HeroWrap {
	CLEAR_TIME: number = 32;
	WRITE_TIME: number = 46;

	heroes: any = [];
	ind: number = 0;

	constructor(textElem: JQuery, image: JQuery, referrer: string) {
		if (!referrer) referrer = "default";
		this.heroes = HEROES[referrer];

		setInterval(() => {
			image.removeClass('fade-in').addClass('fade-out');
			this.clearDynamicText(textElem);
			
			setTimeout(() => {
				image.removeClass('fade-out').addClass('out');
				
				setTimeout(() => {
					this.ind++;
					if (this.ind > this.heroes.length - 1) this.ind = 0;

					image.removeClass('out').addClass('fade-in')
						.css('background-image', ' linear-gradient(165deg, #5fa7ff, #e98bdd), url(/img/' + this.heroes[this.ind].image + ')');

					this.setDynamicText(this.heroes[this.ind].for + ".", textElem);
				}, 30);
			}, 300);
		}, 5000);
	}

	clearDynamicText(elem: JQuery) {
		let text = elem.text();
		let time = this.CLEAR_TIME;

		function eraseChar() {
			text = text.substr(0, text.length - 1);
			elem.text(text);
			if (text.length > 0) setTimeout(eraseChar, time);
		}

		eraseChar();
	}

	setDynamicText(target, elem: JQuery) {
		let text = "";
		let ind = 0;
		let time = this.WRITE_TIME;

		function addChar() {
			text += target.substr(ind++, 1);
			elem.text(text);
			if (text.length < target.length) setTimeout(addChar, time);
		}

		addChar();
	}
}
