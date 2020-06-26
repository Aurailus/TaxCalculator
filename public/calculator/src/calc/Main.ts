// (c) Nicole Collings 2019-present, all rights reserved.
/// <reference path="../@types/jquery/JQuery.d.ts"/>
/// <reference path="../@types/p5/index.d.ts"/>

let dynamicElements: (NumericInput | SelectInput)[] = [];

declare let DATA: CalculatorData;

$(() => {
	//Create Numeric Input Objects
	$("input[type=numeric]").each((_, v) => { 
		dynamicElements.push(new NumericInput($(v))) });
	//Create Selection Objects
	$(".input_select").each((_, v) => { 
		dynamicElements.push(new SelectInput($(v))) });
	//Relflow any Elements that may have moved
	setTimeout(() => dynamicElements.forEach((v, n) => v.reflow()), 150);

	let results = new Results($(".results_wrap"));

	$("#admin").click(() => window.open("/admin", '_blank'));

	let calculator = new Calculator({
		inputs_wrapper: $(".inputs"),

		currAssessedValueElem: $("#assessed_value_current"),
		currHomeownerGrantElem: $("#homeowner_grant_current"),
		currLotVacancyElem: $("#lot_vacant_current"),
		currTaxPrepaymentsElem: $("#tax_prepayments_current"),

		prevAssessedValueElem: $("#assessed_value_previous"),
		prevHomeownerGrantElem: $("#homeowner_grant_previous"),
		prevLotVacancyElem: $("#lot_vacant_previous"),
		prevTaxPrepaymentsElem: $("#tax_prepayments_previous"),

		calculateButton: $("#calculate"),
		previousYearEnabledElem: $("#prev_year_enabled")
	}, results);
});

$(window).on("load", () => {
	//Reflow any elements that may have moved
	dynamicElements.forEach((v, n) => v.reflow());

	console.log("%cInterested in this web application?", 'display: block; text-align: center; font-size: 18px; color: #fff; background-color: #222;');
	console.log("%cFind out more at tax-calculator.ca", 'display: block; text-align: center; font-size: 14px; color: #fff; background-color: #222;');

	let prevHeight: number = 0;
	setTimeout(heightChange, 200);
	function heightChange() {
		if ($("#frame_wrap").outerHeight() != prevHeight) {
			prevHeight = $("#frame_wrap").outerHeight();
			window.parent.postMessage(prevHeight, "*");
		}
		setTimeout(heightChange, 200);
	}
});

function formatNum(num: number, decimals: number = 2, prefix = '') {
	let opts = { useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals };
	let str = (num < 0 ? "-" : "") + prefix + Math.abs(num).toLocaleString('en', opts);
	return str;
}

function mod(a, n) {
    return ((a % n) + n) % n;
};
