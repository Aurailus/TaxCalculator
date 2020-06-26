class Perspective {
	constructor(elem: JQuery) {
		elem.each((i, v) => {
			let fric = 0.2;

			let currOffsetX = 0;
			let currOffsetY = 0;
			let targetOffsetX = 0;
			let targetOffsetY = 0;

			let me = $(v);
			let parent = me.parent();
			let section = parent.parent().parent();

			parent.css({'perspective': '1500px'});

			section.hover((e) => {
				parent.addClass('hover')
				me.css({'will-change': 'transform'});
			}, () => { 
				parent.removeClass('hover');
				me.css({'will-change': ''});

				targetOffsetX = 0;
				targetOffsetY = 0;
			});

			section.mousemove((e) => {
				if (parent.hasClass('hover') && 
					(e.pageY > parent.offset().top && e.pageY < parent.offset().top + parent.outerHeight())) {

					let offsetX = e.pageX - parent.offset().left - me.offset().left / 2;
					let offsetY = e.pageY - parent.offset().top;

					offsetX = Math.max(Math.min(offsetX, me.outerWidth()), 0);
					offsetY = Math.max(Math.min(offsetY, me.outerHeight()), 0);

					targetOffsetX = Math.round(( (offsetX / me.outerWidth()  * 2 - 1) * 7) * 100) / 100;
					targetOffsetY = Math.round((-(offsetY / me.outerHeight() * 2 - 1) * 7) * 100) / 100;
				}
				else {
					targetOffsetX = 0;
					targetOffsetY = 0;
				}
			});

			function updateElem() {
				currOffsetX = Math.round((currOffsetX * (1 - fric) + targetOffsetX * (fric)) * 100) / 100;
				currOffsetY = Math.round((currOffsetY * (1 - fric) + targetOffsetY * (fric)) * 100) / 100;

				me.css({
					'transform':
					'rotateX(' + (currOffsetY) + 'deg) ' + 
					'rotateY(' + (currOffsetX) + 'deg) '
				});

				requestAnimationFrame(updateElem);
			}

			requestAnimationFrame(updateElem);
		});
	}
}
