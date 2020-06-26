// (c) Nicole Collings 2019-present, all rights reserved.

class Config {
	inputs: (NumericInput | DecimalInput)[];
	unsaved: boolean;

	constructor(inputs: (NumericInput | DecimalInput)[]) {
		this.inputs = inputs;
		this.unsaved = false;

		inputs.forEach((v, n) => v.updateOverlay());
			
		$(".tax_switch").click((e) => this.switchTaxes(e));
		$(".fee_switch").click((e) => this.switchFees(e));

		document.querySelectorAll("input").forEach((v) => {
			v.addEventListener("input", () => {
				v.classList.remove("invalid");
				this.showUnsaved();
			})
		})

		// $("input[name=city_name]").on("input", () => this.showUnsaved());
		// $("input[name=year]"     ).on("input", () => this.showUnsaved());
		$(".save_options .save"  ).on("click", () => this.attemptSave());
	}

	showUnsaved() {
		this.unsaved = true;
		$(".save_options_wrap").addClass('visible');
	}

	attemptSave() {
		let canSave = true;
		$("input").each((_, v) => {
			if (($(v).hasClass('numeric') || $(v).hasClass('decimal')) && isNaN(parseFloat($(v).val().toString()))) { 
				canSave = false; $(v).addClass('invalid'); }});
		if (!canSave) return false;

		let taxes: Tax[] = [];
		let fees: Fee[] = [];
		let grants: Grant[] = [];

		let ind = 0;
		let curr: HTMLInputElement = null;
		while ((curr = document.getElementById("tax_current_" + ind) as HTMLInputElement) != null) {
			taxes.push({
				name: (document.getElementById("tax_name_" + ind) as HTMLInputElement).value,
				values: {
					current: parseFloat(curr.value),
					previous: parseFloat((document.getElementById("tax_previous_" + ind) as HTMLInputElement).value),
				}
			})
			ind++;
		}

		ind = 0;
		curr: HTMLInputElement = null;
		while ((curr = document.getElementById("fee_current_" + ind) as HTMLInputElement) != null) {
			fees.push({
				name: (document.getElementById("fee_name_" + ind) as HTMLInputElement).value,
				values: {
					current: parseFloat(curr.value),
					previous: parseFloat((document.getElementById("fee_previous_" + ind) as HTMLInputElement).value),
				}
			})
			ind++;
		}

		ind = 0;
		let name: HTMLInputElement = null;
		while ((name = document.getElementById("grant_name_" + ind) as HTMLInputElement) != null) {
			grants.push({
				name: name.value,
				value: parseFloat((document.getElementById("grant_value_" + ind) as HTMLInputElement).value),
			});
			ind++;
		}

		let data = {
			city: (document.getElementById("city_name") as HTMLInputElement).value,
			year: parseInt((document.getElementById("year") as HTMLInputElement).value),

			taxes: taxes,
			fees: fees,
			grants: grants,
			insights: {
				increase: 		parseFloat((document.getElementById("assessed_value_increase") as HTMLInputElement).value),
				currentAvg: 	parseFloat((document.getElementById("current_avg_assessment" ) as HTMLInputElement).value),
				previousAvg:	parseFloat((document.getElementById("previous_avg_assessment") as HTMLInputElement).value)
			}
		}

		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/admin/config", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = () => window.location.reload();
		xhr.send(JSON.stringify(data));
	}

	switchTaxes(e: any) {
		e.stopPropagation();
		e.stopImmediatePropagation();

		let i = 0;
		let curr = null;
		while ((curr = document.getElementById('tax_current_' + i)) != null) {
			let prev = document.getElementById('tax_previous_' + i++) as HTMLInputElement;

			if (isNaN(parseFloat(curr.value))) curr.classList.add('invalid');
			else {
				prev.value = curr.value;
				curr.value = "";
			}
		}

		this.showUnsaved();
		this.inputs.forEach((v, n) => v.updateOverlay());

		return false;
	}

	switchFees(e: any) {
		e.stopPropagation();
		e.stopImmediatePropagation();

		let i = 0;
		let curr = null;
		while ((curr = document.getElementById('fee_current_' + i)) != null) {
			let prev = document.getElementById('fee_previous_' + i++) as HTMLInputElement;

			if (isNaN(parseFloat(curr.value))) curr.classList.add('invalid');
			else {
				prev.value = curr.value;
				curr.value = "";
			}
		}

		this.showUnsaved();
		this.inputs.forEach((v, n) => v.updateOverlay());

		this.showUnsaved();
		this.inputs.forEach((v, n) => v.updateOverlay());

		return false;
	}
}
