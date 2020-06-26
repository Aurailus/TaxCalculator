// (c) Nicole Collings 2019-present, all rights reserved.

class Results {
	element: JQuery;
	colLeftElem: JQuery;
	colRightElem: JQuery;
	colLeft: number = 0;
	colRight: number = 0;

	constructor(element: JQuery) {
		this.element = element;
		this.colLeftElem = element.children(".col.left");
		this.colRightElem = element.children(".col.right");
	}

	empty() {
		this.element.find(".result_pane").removeClass('visible');
		setTimeout(() => this.element.find(".result_pane").remove(), 200);
		this.colLeft = 0;
		this.colRight = 0;
	}

	create(procCurr: ProcessedResults, procPrev: ProcessedResults) {
		let finals = new ResultFinalNumbers(procCurr, procPrev);
		this.appendElem(finals.elem);

		let insights = new ResultInsights(procCurr, procPrev);
		this.appendElem(insights.elem);

		let piechart = new ResultPieChart();
		this.appendElem(piechart.elem);
		piechart.createSketch(procCurr, procPrev);

		let barchart = new ResultBarChart();
		this.appendElem(barchart.elem);
		barchart.createSketch(procCurr, procPrev);

		let timeout = 16;
		this.element.find(".result_pane").each((_, v) => {
			setTimeout(() => {
				$(v).addClass('visible');
			}, timeout);
			timeout += 100;
		});
	}

	appendElem(elem: JQuery) {
		if ($(window).width() >= 1210) {
			if (this.colLeft > this.colRight) {
				this.colRightElem.append(elem);
				this.colRight += elem.outerHeight();
			}
			else {
				this.colLeftElem.append(elem);
				this.colLeft += elem.outerHeight();
			}
		}
		else {
			this.colLeftElem.append(elem);
		}
	}
}
