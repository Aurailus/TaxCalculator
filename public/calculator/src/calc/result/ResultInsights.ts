// (c) Nicole Collings 2019-present, all rights reserved.

class ResultInsights {
	elem: JQuery;

	increase = "trending_up";
	decrease = "trending_down";
	level		 = "trending_flat";
	info		 = "fiber_manual_record";

	constructor(procCurr: ProcessedResults, procPrev?: ProcessedResults) {
		let lines = "";

		if (procPrev) {
			let taxChangeNumber = procCurr.total - procPrev.total;
			let taxChangePercent = taxChangeNumber / procPrev.total * 100;

			if (Math.round(taxChangeNumber) != 0) {
				let icon = (taxChangeNumber > 0) ? this.increase : this.decrease;
				lines += `<p><i class='material-icons'>${icon}</i> Your estimated property tax has <strong>
									${(taxChangeNumber > 0 ? "increased" : "decreased")}</strong> by 
									<span class='slab'>${formatNum(taxChangeNumber, 2, "$")}</span> 
									<span class='slab'>(${formatNum(taxChangePercent, 1)}%)</span> since last year.</p>`;
			}
			else {
				lines += `<p><i class="material-icons">${this.level}</i> Your estimated property tax has not changed since last year.</p>`;
			}

			let assessedChangeNumber = procCurr.assessed - procPrev.assessed;
			console.log(procCurr.assessed, procPrev.assessed)
			let assessedChangePercent = assessedChangeNumber / procPrev.assessed * 100;

			if (Math.round(assessedChangeNumber) != 0) {
				let icon = (assessedChangeNumber > 0) ? this.increase : this.decrease;
				lines += `<p><i class='material-icons'>${icon}</i> Your assessed value has <strong>
								 ${(assessedChangeNumber > 0 ? "increased" : "decreased")}</strong> by
								 <span class='slab'>${formatNum(assessedChangeNumber, 0, "$")}</span> 
								 <span class='slab'>(${formatNum(assessedChangePercent, 1)}%)</span> since last year.</p>`;
			}
			else {
				lines += `<p><i class="material-icons">${this.level}</i> Your assessed value has not changed since last year.</p>`;
			}

			let changeOffAvg = assessedChangePercent - DATA.insights.increase;

			if (Math.round(changeOffAvg) != 0) {
				let icon = (changeOffAvg > 0) ? this.increase : this.decrease;
				lines += `<p><i class="material-icons">${icon}</i> Your assessed value change is 
								 <span class='slab'>${formatNum(changeOffAvg, 1)}%</span> ${(changeOffAvg) > 0 ? "above" : "below"} average.`;
			}
			else {
				lines += `<p><i class="material-icons">${this.level}</i> Your assessed value change is average.</p>`;
			}
		}

		lines += `<p><i class="material-icons">${this.level}</i> The average 
			residential property assessed value increase in ${DATA.city} is <span class='slab'>${DATA.insights.increase}%</slab></p>`;
			
		lines += `<p><i class="material-icons">${this.info}</i> The average Single Family Dwelling assessment in ${DATA.year} was <span class='slab'><span class='slab'>${formatNum(DATA.insights.currentAvg, 0, "$")}</slab></span>.</p>`;
		lines += `<p><i class="material-icons">${this.info}</i> The average Single Family Dwelling assessment in ${DATA.year - 1} was <span class='slab'><span class='slab'>${formatNum(DATA.insights.previousAvg, 0, "$")}</slab></span>.</p>`;


		this.elem = $(`
			<div class='result_pane insights'>
				<h2 class="title"><i class="material-icons">bubble_chart</i> Tax Insights</h2>
				<div class="inner">
					${lines}
				</div>
			</div>
			`);
	}
}
