// (c) Nicole Collings 2019-present, all rights reserved.

interface BarChartElem {
	name: string,
	amount: number,
	percent: number
	disp?: number
}

class ResultBarChart {
	elem: JQuery;
	sketch: p5;
	canvas: any;
	procCurr: ProcessedResults;
	procPrev: ProcessedResults;
	dataCurr: BarChartElem[];
	dataPrev: BarChartElem[];

	maxNameWidth: number = 0;

	constructor() {
		this.elem = $(`
			<div class='result_pane final_numbers'>
				<h2 class="title"><i class="material-icons">equalizer</i> Tax Rates Comparison</h2>
				<div id="barChartSketchWrap"></div>
			</div>
		`);
	}

	private getData(table: ProcessedResults) : BarChartElem[] {
		function norm(val, min, max) { return (val - min) / (max - min); }

		let max = table.total;

		let values: BarChartElem[] = [];

		for (let payout of table.allPayouts) {
			values.push({
				name: payout.name,
				amount: payout.value,
				percent: norm(payout.value, 0, max)
			})
		}

		//Expand small slices
		let total = 0;
		for (let value of values) {
			value.disp = (value.percent < 0.0005) ? 0 : value.percent + Math.max(0.005 - (value.percent / 2), 0)
			total += value.disp;
		}

		//Normalize Slices
		for (let value of values) {
			value.disp /= total;
		}

		return values;
	}

	createSketch(procCurr: ProcessedResults, procPrev: ProcessedResults) {
		this.procCurr = procCurr;
		this.procPrev = procPrev;

		this.dataCurr = this.getData(procCurr);
		if (procPrev) this.dataPrev = this.getData(procPrev);


		let realScale = this.elem.find("#barChartSketchWrap").outerWidth();
		let size = Math.max(realScale, 450);
		let w = size;
		let h = 50 + (!this.procPrev ? 50 * procCurr.allPayouts.length : 72 * procPrev.allPayouts.length);

		let factor = realScale / size;

		this.sketch = new p5((p: p5) => {
			p.setup			 = () => this.setup(p, w, h);
			p.draw			 = () => this.draw(p, w, h);
			// p.mouseMoved = () => this.mouseMoved(p);
		});

		setTimeout(() => {
			$("#barChartSketchWrap canvas").css({
				"width": realScale,
				"height": h * factor
			});
		}, 16)
	}

	private setup(p: p5, w: number, h: number) {
		this.canvas = p.createCanvas(w, h);
		this.canvas.parent('barChartSketchWrap');

		p.noLoop();
		p.frameRate(60);

		p.textSize(18);
		p.textFont("Roboto");
		for (let val of this.dataCurr) {
			this.maxNameWidth = Math.max(this.maxNameWidth, p.textWidth(val.name));
		}
	}

	private mouseMoved(p: p5) {
		// if (p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height) p.redraw();
	}

	private draw(p: p5, w: number, h: number) {
		let colorsLight = ["#c73092", "#b12bba", "#8139c0", "#5239c0", "#3447bd", "#296cdb", "#1c91f7", "#00b8d0", "#00a091"];
		let colorsDark	= ["#9c196d", "#911f99", "#6b2aa3", "#3d289a", "#273a9e", "#224ac2", "#0b6fdf", "#009dab", "#008377"];

		p.background($("body").hasClass('light') ? "#fff" : "#333");

		let maxPercent = 0;
		for (let s = (this.procPrev ? 1 : 0); s >= 0; s--) {
			let table = (s == 0 ? this.dataCurr : this.dataPrev);

			for (let i = 0; i < table.length; i++) {
				maxPercent = Math.max(maxPercent, table[i].amount);
			}
		}

		let barHeight = (!this.procPrev ? 40 : 28);
		let betweenBarSpacing = 4;
		let barPadding = 12;
		let barLeft = this.maxNameWidth + 20;
		
		let y = 24;

		for (let i = 0; i < this.dataCurr.length; i++) {
			for (let s = 0; s <= (this.procPrev ? 1 : 0); s++) {

				let table = (s == 0 ? this.dataCurr : this.dataPrev);
				let color = ((s == 0) ? colorsLight : colorsDark)[8 - (i % 9)];
				let data = table[table.length - 1 - i];

				let barWidth = Math.max((w - barLeft - 20) * (data.amount / maxPercent), 3);
				let barPos = y + (s == 1 ? barHeight + betweenBarSpacing : 0);

				p.noStroke();
				p.fill($("body").hasClass('light') ? "#ddd" : "#292929");
				p.rect(barLeft + 4, barPos + 6, barWidth, barHeight);
				p.fill(color)
				p.rect(barLeft, barPos, barWidth, barHeight);

				p.textSize(18);

				if (!this.dataPrev) barPos += 5;

				if (s == 0) {
					p.textAlign(p.RIGHT);
					p.textFont("Roboto");
					p.fill($("body").hasClass('light') ? "#222" : "#ccc");
					p.text(data.name, barLeft - 8, barPos + 21);
					p.fill($("body").hasClass('light') ? "#000" : "#fff");
				}
				if (s == 1) {
					let change: number = (this.dataCurr[table.length - 1 - i].amount - data.amount) / data.amount * 100;

					p.textAlign(p.RIGHT);
					p.textFont("Roboto Slab");
					p.fill($("body").hasClass('light') ? "#000" : "#fff");
					p.text(formatNum(change, 0) + "%", 
						barLeft - 24, barPos + 21);

					p.textSize(32);
					p.textFont("Material Icons");
					p.text(change > 0 ? 'arrow_drop_up' : 'arrow_drop_down', barLeft + 3, barPos + 31);

					p.textSize(18);
				}

				p.textAlign(p.LEFT);
				p.textFont("Roboto Slab");

				let text = formatNum(data.amount, 2, "$");
				if (p.textWidth(text) < barWidth - 24) {
					p.fill("#fff");
					p.textAlign(p.RIGHT);
					p.text(text, barWidth + barLeft - 8, barPos + 21);
					p.textAlign(p.LEFT);
					p.fill($("body").hasClass('light') ? "#000" : "#fff");
				}
				else {
					p.text(text, barWidth + barLeft + 8, barPos + 21);
				}
			
				if (!this.dataPrev) barPos -= 5;
			}

			y += barHeight * (this.procPrev ? 2 : 1) + (this.procPrev ? betweenBarSpacing : 0) + barPadding;
		}

		//Draw Info
		if (this.procPrev) {
			p.textFont("Roboto");
			p.textSize(16);
			p.textAlign(p.CENTER);
			p.fill($("body").hasClass('light') ? "#333" : "#aaa");
			p.text("Darker bars are a comparison to the previous year.", w / 2, h - 4);
			p.textAlign(p.LEFT);
		}
	}
}
