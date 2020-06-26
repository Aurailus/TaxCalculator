// (c) Nicole Collings 2019-present, all rights reserved.
/// <reference path="../@types/jquery/JQuery.d.ts"/>
/// <reference path="../@types/p5/index.d.ts"/>

let dynamicElements: (NumericInput | DecimalInput)[] = [];

declare let DATA: CalculatorData;

$(() => {
	$("input[type=numeric]").each((_, v) => { dynamicElements.push(new NumericInput($(v))) });
	$("input[type=decimal]").each((_, v) => { dynamicElements.push(new DecimalInput($(v))) });

	if (window.location.href.split("#")[0].endsWith("config")) new Config(dynamicElements);
	if (window.location.href.split("#")[0].endsWith("theme" )) new Theme(dynamicElements);

	if (window.location.hash.length >= 2) {
		$(".wrap").prepend(`<div id="saved"><i class="material-icons">save</i> Your changes have been saved.</div>`);

		$("main").scrollTop(0);
		window.location.hash = "";
	}
});

$(window).on("load", () => {
	//Reflow any elements that may have moved
	dynamicElements.forEach((v, n) => v.reflow());
});
