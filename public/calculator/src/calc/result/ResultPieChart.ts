// (c) Nicole Collings 2019-present, all rights reserved.

interface PieChartElem {
	name: string,
	amount: number,
	percent: number
	disp?: number
}

class ResultPieChart {
	elem: JQuery;
	sketch: p5;
	canvas: any;
	dataCurr: PieChartElem[];
	dataPrev: PieChartElem[];
	totalCurr: number;
	totalPrev: number;

	constructor() {
		this.elem = $(`
			<div class='result_pane final_numbers'>
				<h2 class="title"><i class="material-icons">donut_small</i> Tax Breakdown</h2>
				<div id="pieChartSketchWrap"></div>
			</div>
		`);
	}

	private getData(table: ProcessedResults, order?: PieChartElem[]) : PieChartElem[] {
		function norm(val, min, max) { return (val - min) / (max - min); }

		let max = table.total;
		let values: PieChartElem[] = [];

		let count = 0;
		let maxCount = 10;
		for (let i = table.allPayouts.length - 1; i >= 0; i--) {
			let payout = table.allPayouts[i];
			if (++count < maxCount || table.allPayouts.length == maxCount) {
				values.push({
					name: payout.name,
					amount: payout.value,
					percent: norm(payout.value, 0, max)
				})
			}
			else if (values.length == maxCount - 1) {
				values.push({
					name: "Other",
					amount: payout.value,
					percent: norm(payout.value, 0, max)
				})
			}
			else {
				values[maxCount - 1].amount += payout.value;
				values[maxCount - 1].percent = norm(values[maxCount - 1].amount, 0, max);
			}
		}
		values.reverse();

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

	createSketch(procCurr: ProcessedResults, procPrev?: ProcessedResults) {
		this.dataCurr = this.getData(procCurr);
		if (procPrev) this.dataPrev = this.getData(procPrev, this.dataCurr);
		this.totalCurr = procCurr.total;
		this.totalPrev = (procPrev) ? procPrev.total : 0;
			
		let realScale = this.elem.find("#pieChartSketchWrap").outerWidth();
		let size = Math.max(realScale, 550);
		let w = size;
		let h = size + 21 * (procCurr.allPayouts.length - 1);
		if (procPrev) h += 60;

		let factor = realScale / size;

		this.sketch = new p5((p: p5) => {
			p.setup			 = () => this.setup(p, w, h);
			p.draw			 = () => this.draw(p, w, h);
			p.mouseMoved = () => this.mouseMoved(p);
		});

		setTimeout(() => {
			$("#pieChartSketchWrap canvas").css({
				"width": realScale,
				"height": h * factor
			});
		}, 16)
	}

	private setup(p: p5, w: number, h: number) {
		this.canvas = p.createCanvas(w, h);
		this.canvas.parent('pieChartSketchWrap');

		p.angleMode(p.RADIANS);

		p.noLoop();
		p.frameRate(30);
	}

	private convertAng(ang: number) {
		if (ang < 0) return Math.PI*2 + ang;
		return ang;
	}

	private mouseMoved(p: p5) {
		if (p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height) p.redraw();
	}

	private drawSegments(table: PieChartElem[], p: p5, x: number, y: number, start: number, end: number, 
											 shadow: boolean, colorsFill: string[], colorsActive: string[],
											 sx: number = 0, sy: number = 0): number {
		
		//Draw Pie Segments
		p.fill(255);
		p.noStroke();

		let mouseAng = this.convertAng(p.atan2(p.mouseY - y, p.mouseX - x));
		let distance = p.sqrt(p.sq(p.mouseY - y) + p.sq(p.mouseX - x));
		let inDistance = distance >= start / 2 && distance <= end / 2;

		let ang;
		ang = -p.PI/2;

		let activeNum = -1;

		for (let s = 1; s >= (shadow ? 0 : 1); s--) {
			for (let i = 0; i < table.length; i++) {
				if (table[i].disp == 0) continue;
				let rad = table[i].disp * p.TAU;

				let active = false;

				p.strokeWeight(3);
				if (!s) {
					//Clip to -PI to PI
					ang = (ang + p.PI + p.TAU) % p.TAU - p.PI;
					let angleRefS = this.convertAng(ang);
					let angleRefE = this.convertAng(ang - rad);

					if ((((angleRefS > angleRefE) && (mouseAng < angleRefS && mouseAng > angleRefE)) || 
				 			 ((angleRefS < angleRefE) && (mouseAng < angleRefS && mouseAng < angleRefE)) ||
							 ((angleRefS < angleRefE) && (mouseAng > angleRefS && mouseAng > angleRefE))) 
							&& inDistance) {
						active = true;
						activeNum = i;
					}

					let colorInd = mod(i - table.length + 10, 10);
					p.fill((active ? colorsActive[colorInd] : colorsFill[colorInd]));
					p.stroke($("body").hasClass('light') ? (active ? colorsActive[colorInd] : colorsFill[colorInd]) : (active ? "#fff" : colorsFill[colorInd]));
				}
				else {
					p.noStroke();
					p.fill("#0003");
				}

				p.arc(x + (s?sx:0), y + (s?sy:0), end, end, ang - rad, ang);

				ang -= rad;
			}
		}
		
		//Draw Divider Lines
		p.strokeWeight(3);
		p.stroke($("body").hasClass('light') ? (shadow ? "#ccc" : "#ddd") : (shadow ? "#292929" : "#333"));

		ang = -p.PI/2;

		for (let i = 0; i < table.length; i++) {

			let rad = table[i].disp * p.TAU;

			let xDir = p.cos(ang - rad);
			let yDir = p.sin(ang - rad);

			p.line(x + xDir, y + yDir, x + xDir * (end+2) / 2, y + yDir * (end+2) / 2);
			ang -= rad;
		}

		//Fill in the middle
		p.noStroke();

		if (shadow) {
			p.fill($("body").hasClass('light') ? "#fff" : "#292929");
			p.ellipse(x, y, start - 2);
			p.blendMode(p.LIGHTEST);
			p.fill($("body").hasClass('light') ? "#ccc" : "#333");
			p.ellipse(x + sx / 2, y + sy / 2, start - 6);
			p.blendMode(p.BLEND);
		}
		else {
			p.fill($("body").hasClass('light') ? "#ccc" : "#333");
			p.ellipse(x, y, start - 2);
		}

		return activeNum;
	}

	private draw(p: p5, w: number, h: number) {
		let colorsLightActive = ["#de3e53", "#e838aa", "#c93bd4", "#964ad9", "#5239c0", "#4b5dcd", "#3f7bdf", "#3ca2f8", "#37d7e5", "#4ac6bc"];
		let colorsLight 			= ["#c73044", "#c73092", "#b12bba", "#8139c0", "#5239c0", "#3447bd", "#296cdb", "#1c91f7", "#00b8d0", "#00a091"];
		let colorsDarkActive  = ["#bd283b", "#b52281", "#a224ab", "#752eb3", "#422ca4", "#3447bd", "#296cdb", "#2a98f7", "#19c6d9", "#21b1a4"];
		let colorsDark				= ["#ad2335", "#9c196d", "#911f99", "#6b2aa3", "#3d289a", "#273a9e", "#224ac2", "#0b6fdf", "#009dab", "#008377"];

		p.background($("body").hasClass('light') ? "#fff" : "#333");

		let circleSize = (w - 32);

		let x = w / 2;
		let y = h - circleSize / 2;
		let end: number;
		let start: number;

		let active = -1;

		//Draw Prev Segment (If Exists)
		if (this.dataPrev) {
			end = (w - 32) - w / 8;
			start = end - w / 6;

			let active1 = this.drawSegments(this.dataPrev, p, x, y, start, end, true, colorsDark, colorsDarkActive, 4, 6);
			if (active1 >= 0) active = active1 + this.dataCurr.length;
		}

		//Draw main Segment
		end = (w - 32) * 2 / (this.dataPrev ? 3 : 2.5);
		start = end - w / 4;

		let active2 = this.drawSegments(this.dataCurr, p, x, y, start, end, true, colorsLight, colorsLightActive, 4, 6);
		if (active2 >= 0) active = active2;

		//Draw Info
		let mw = w/2 - 140;
		if (this.dataPrev) mw -= 120;

		if (this.dataPrev) {
			p.fill("#fff");
			p.textFont("Roboto Slab");
			p.textAlign(p.RIGHT);
			p.textSize(32);
			p.fill($("body").hasClass('light') ? "#000" : "#fff")
			p.text(DATA.year.toString(), mw + 290, 40);
			p.text((DATA.year - 1).toString(), mw + 290 + 240, 40);
		}

		let off = 0;
		for (let i = this.dataCurr.length * (this.dataPrev ? 2 : 1) - 1; i >= 0; i--) {
			let ind = i % this.dataCurr.length;
			let prev = i >= this.dataCurr.length;

			let imActive = active == i;

			let dataPiece = (prev ? this.dataPrev : this.dataCurr)[ind];
			let mh = (this.dataPrev ? 70 : 20) + 22*off;
			let x = 0;
			if (prev) x += 240;

			p.fill(colorsLight[mod(i - this.dataCurr.length + 10, 10)]);
			p.stroke($("body").hasClass('light') ? "#fff" : "#fff");
			p.strokeWeight(2);
			p.ellipse(mw, mh - 7, 16);

			if (!prev) {
				p.textAlign(p.LEFT);
				p.fill($("body").hasClass('light') ? "#222" : "#ccc");
				p.noStroke();
				p.textSize(18);
				p.textFont("Roboto");
				p.text(`${dataPiece.name} `, mw + 16, mh);
			}

			p.textAlign(p.LEFT);
			p.fill($("body").hasClass('light') ? "#222" : "#ccc");
			p.noStroke();
			p.textSize(18);
			p.textFont("Roboto Slab");
			p.textAlign(p.RIGHT);
			if (imActive) {
				p.fill($("body").hasClass('light') ? "#333" : "#fff");
				let w = p.textWidth(formatNum(dataPiece.amount, 0, "$"));
				p.ellipse(mw + 220 + x + 65, mh - 6, 24);
				p.ellipse(mw + 220 + x - w + 3, mh - 6, 24);
				p.rect(mw + 220 + x - w + 1, mh - 18, w + 65, 24);

				p.fill($("body").hasClass('light') ? "#eee" : "#333");
			}
			p.text(`${formatNum(dataPiece.amount, 0, "$")}`, mw + 220 + x, mh);
			if (!imActive) p.fill($("body").hasClass('light') ? "#000" : "#fff");
			p.text(`${formatNum(dataPiece.percent * 100, 1)}%`, mw + 290 + x, mh);
			
			off++;
			off %= this.dataCurr.length;
		}

		//Draw Disclaimer
		p.textFont("Roboto");
		p.textSize(16);
		p.textAlign(p.CENTER);
		p.fill($("body").hasClass('light') ? "#333" : "#aaa");
		p.text("Small segments are enlarged for clarity.", w / 2, h - 4);
		p.textAlign(p.LEFT);

		//Draw Middle Text
		if (active >= 0) {
			p.textFont("Roboto Slab");
			p.textSize(42);
			p.textAlign(p.CENTER);
			p.fill($("body").hasClass('light') ? "#222" : "#ccc");
			p.text((active >= this.dataCurr.length) ? (DATA.year - 1).toString() : DATA.year.toString(), x, y - 4);
			p.textSize(22);
			p.fill($("body").hasClass('light') ? "#000" : "#fff");
			p.text(formatNum((active >= this.dataCurr.length ? this.totalPrev : this.totalCurr), 0, "$"), x, y + 26);
			p.textAlign(p.LEFT);
		}
	}
}
