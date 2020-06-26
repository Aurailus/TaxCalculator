// (c) Nicole Collings 2019-present, all rights reserved.

class ResultFinalNumbers {
	elem: JQuery;

	increase = "trending_up";
	decrease = "trending_down";
	level		 = "trending_flat";

	constructor(procCurr: ProcessedResults, procPrev?: ProcessedResults) {
		let curr = this.formatHTML(procCurr, (procPrev ? DATA.year : -1));
		let prev = (procPrev ? this.formatHTML(procPrev, DATA.year - 1) : null);

		let incr = "";

		if (prev) {
			let taxChangeNumber = procCurr.total - procPrev.total;
			let taxChangePercent = taxChangeNumber / procPrev.total * 100;

			if (Math.round(taxChangeNumber) != 0) {
				let icon = (taxChangeNumber > 0) ? this.increase : this.decrease;
				incr = `<p class="change"><i class='material-icons'>${icon}</i> <strong>
									${(taxChangeNumber > 0 ? "Increased" : "Decreased")}</strong> 
									<span class='slab'>${formatNum(taxChangeNumber, 2, "$")}</span> 
									<span class='slab'>(${formatNum(taxChangePercent, 1)}%)</span></p>`;
			}
		}

		this.elem = $(`
			<div class='result_pane final_numbers'>
				<h2 class="title"><i class="material-icons">account_balance_wallet</i> Total Estimated Property Tax</h2>
				<div class="flex_wrap">
					${curr}
					${prev || ""}
				</div>
				${incr || ""}
			</div>`);
	}

	formatHTML(table: ProcessedResults, year: number) {
		let taxes = formatNum(table.total, 0, "$");
		let grant = formatNum(-table.grant.value, 0, "$");
		let prepaid = formatNum(-table.prepaid, 0, "$");
		let final = formatNum(table.final, 0, "$");

		let yearString = (year == -1 ? "" : `<h3>${year}</h3>`);
		return `
		<div class="calc_box">
			${yearString}
			<div class='line'><p class="title">Taxes:</p> <p class='val'>${taxes}</p></div>
			<div class='line'><p class="title">Grant:</p> <p class='val'>${grant}</p></div>
			<div class='line'><p class="title">Prepaid:</p> <p class='val'>${prepaid}</p></div>
			<div class='line final'><p class="title">Final:</p> <p class='val'>${final}</p></div>
		</div>
		`;
	}
}
