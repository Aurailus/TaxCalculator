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

		document.querySelectorAll(".remove_tax").forEach((v) => v.addEventListener('click', () => this.removeTax(v as HTMLButtonElement)));
		document.querySelectorAll(".remove_fee").forEach((v) => v.addEventListener('click', () => this.removeFee(v as HTMLButtonElement)));
		document.querySelectorAll(".remove_grant").forEach((v) => v.addEventListener('click', () => this.removeGrant(v as HTMLButtonElement)));

		document.querySelectorAll(".tax_new").forEach((v) => v.addEventListener('click', () => this.addTax()));
		document.querySelectorAll(".fee_new").forEach((v) => v.addEventListener('click', () => this.addFee()));
		document.querySelectorAll(".grant_new").forEach((v) => v.addEventListener('click', () => this.addGrant()));

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
		let defaultGrant = 0;

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
			let requiresOccupancyState = 
				((document.getElementById("occ_o_" + ind) as HTMLInputElement).checked ? true :
				(document.getElementById("occ_u_" + ind) as HTMLInputElement).checked ? false : undefined)
			fees.push({
				name: (document.getElementById("fee_name_" + ind) as HTMLInputElement).value,
				requiresOccupancyState: requiresOccupancyState,
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
			if ((document.getElementById("grant_default_" + ind) as HTMLInputElement).checked) defaultGrant = ind;
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
			defaultGrant: defaultGrant,
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

	addTax() {
		const wrap = document.querySelector('.taxes_wrap');
		const lastTax = wrap.lastElementChild;
		const lastInd = parseInt(lastTax.querySelector('input:first-child').id.substr(9, 5));

		const newInd = lastInd + 1;
		const newTax = document.createElement('div');
		newTax.classList.add('rate');
		newTax.innerHTML = `
			<input id='${'tax_name_' + newInd}' type='text' value="">
			<input id='${'tax_current_' + newInd}' type='decimal' value="">
			<input id='${'tax_previous_' + newInd}' type='decimal' value="">
			<button class="remove_tax"><i class="material-icons">close</i></button>
		`;


		newTax.querySelectorAll("input").forEach((v) => {
			v.addEventListener("input", () => {
				v.classList.remove("invalid");
				this.showUnsaved();
			})
		})

		newTax.querySelector(".remove_tax").addEventListener('click', 
			() => this.removeTax(newTax.querySelector(".remove_tax") as HTMLButtonElement));

		wrap.append(newTax);
		newTax.querySelectorAll("input[type=decimal]").forEach((v) => { this.inputs.push(new DecimalInput($(v) as any)) })
		this.inputs.forEach((v, n) => v.reflow());
		this.showUnsaved();
	}

	removeTax(e: HTMLButtonElement) {
		let wrap = e.parentElement as HTMLDivElement;
		let sib = wrap as HTMLElement;
		while ((sib = sib.nextElementSibling as HTMLElement) != null) {
			let ind = parseInt(sib.querySelector('input:first-child').id.substr(9, 5));
			let newInd = ind - 1;
			sib.querySelector('#tax_name_' + ind).id = 'tax_name_' + newInd;
			sib.querySelector('#tax_current_' + ind).id = "tax_current_" + newInd;
			sib.querySelector('#tax_previous_' + ind).id = "tax_previous_" + newInd;
		}
		wrap.remove();
		this.inputs.forEach((v, n) => v.reflow());
		this.showUnsaved();
	}

	addFee() {
		const wrap = document.querySelector('.fees_wrap');
		const lastFee = wrap.lastElementChild;
		const lastInd = lastFee ? parseInt(lastFee.querySelector('input:first-child').id.substr(9, 5)) : -1;

		const newInd = lastInd + 1;
		const newFee = document.createElement('div');
		newFee.classList.add('rate');
		newFee.innerHTML = `
			<input id='${'fee_name_' + newInd}' type='text' value="">
			<input id='${'fee_current_' + newInd}' type='numeric' value="">
			<input id='${'fee_previous_' + newInd}' type='numeric' value="">
			<button class="remove_fee"><i class="material-icons">close</i></button>\
							
			<label>Apply To:</label> 
			<div class="occupancy">
				<label for="${'occ_o_' + newInd}">Occupied</label>
				<input id="${"occ_o_" + newInd}" type='radio' name="${'occupancy_state_' + newInd}" value='Occupied'>
			</div>
			<div class="occupancy">
				<label for="${'occ_u_' + newInd}">Unoccupied</label>
				<input id="${"occ_u_" + newInd}" type='radio' name="${'occupancy_state_' + newInd}" value='Unoccupied'>
			</div>
			<div class="occupancy">
				<label for="${'occ_e_' + newInd}">Either</label>
				<input id="${"occ_e_" + newInd}" type='radio' name="${'occupancy_state_' + newInd}" value='Either' checked>
			</div>
		`;


		newFee.querySelectorAll("input").forEach((v) => {
			v.addEventListener("input", () => {
				v.classList.remove("invalid");
				this.showUnsaved();
			})
		})

		newFee.querySelector(".remove_fee").addEventListener('click', 
			() => this.removeFee(newFee.querySelector(".remove_fee") as HTMLButtonElement));

		wrap.append(newFee);
		newFee.querySelectorAll("input[type=numeric]").forEach((v) => { this.inputs.push(new NumericInput($(v) as any)) });
		this.inputs.forEach((v, n) => v.reflow());
		this.showUnsaved();
	}

	removeFee(e: HTMLButtonElement) {
		let wrap = e.parentElement as HTMLDivElement;
		let sib = wrap as HTMLElement;
		while ((sib = sib.nextElementSibling as HTMLElement) != null) {
			let ind = parseInt(sib.querySelector('input:first-child').id.substr(9, 5));
			let newInd = ind - 1;
			sib.querySelector('#fee_name_' + ind).id = 'fee_name_' + newInd;
			sib.querySelector('#fee_current_' + ind).id = "fee_current_" + newInd;
			sib.querySelector('#fee_previous_' + ind).id = "fee_previous_" + newInd;

			sib.querySelector('#occ_o_' + ind).setAttribute('name', 'occupancy_state_' + newInd);
			sib.querySelector('#occ_u_' + ind).setAttribute('name', 'occupancy_state_' + newInd);
			sib.querySelector('#occ_e_' + ind).setAttribute('name', 'occupancy_state_' + newInd);
			sib.querySelector('#occ_o_' + ind).id = 'occ_o_' + newInd;
			sib.querySelector('#occ_u_' + ind).id = "occ_u_" + newInd;
			sib.querySelector('#occ_e_' + ind).id = "occ_e_" + newInd;
			sib.querySelector('label[for=occ_o_' + ind + ']').setAttribute('for', 'occ_o_' + newInd);
			sib.querySelector('label[for=occ_u_' + ind + ']').setAttribute('for', 'occ_u_' + newInd);
			sib.querySelector('label[for=occ_e_' + ind + ']').setAttribute('for', 'occ_e_' + newInd);
		}
		wrap.remove();
		this.inputs.forEach((v, n) => v.reflow());
		this.showUnsaved();
	}

	addGrant() {
		const wrap = document.querySelector('.grants_wrap');
		const lastGrant = wrap.lastElementChild;
		const lastInd = parseInt(lastGrant.querySelector('input:first-child').id.substr(11, 5));

		const newInd = lastInd + 1;
		const newGrant = document.createElement('div');
		newGrant.classList.add('grant');
		newGrant.innerHTML = `
			<input id='${'grant_name_' + newInd}' type='text' value="">
			<input id='${'grant_value_' + newInd}' type='numeric' value="">
			<button class="remove_grant"><i class="material-icons">close</i></button>
			
			<div class="default">
				<label for="${"grant_default_" + newInd}">Default</label>
				<input id="${"grant_default_" + newInd}" type='radio' name='grant_default'>
			</div>
		`;


		newGrant.querySelectorAll("input").forEach((v) => {
			v.addEventListener("input", () => {
				v.classList.remove("invalid");
				this.showUnsaved();
			})
		})

		newGrant.querySelector(".remove_grant").addEventListener('click', 
			() => this.removeGrant(newGrant.querySelector(".remove_grant") as HTMLButtonElement));

		wrap.append(newGrant);
		newGrant.querySelectorAll("input[type=numeric]").forEach((v) => { this.inputs.push(new NumericInput($(v) as any)) });
		this.inputs.forEach((v, n) => v.reflow());
		this.showUnsaved();
	}

	removeGrant(e: HTMLButtonElement) {
		let wrap = e.parentElement as HTMLDivElement;
		let sib = wrap as HTMLElement;
		while ((sib = sib.nextElementSibling as HTMLElement) != null) {
			let ind = parseInt(sib.querySelector('input:first-child').id.substr(11, 5));
			let newInd = ind - 1;
			sib.querySelector('#grant_name_' + ind).id = "grant_name_" + newInd;
			sib.querySelector('#grant_value_' + ind).id = "grant_value_" + newInd;
		}
		wrap.remove();
		this.inputs.forEach((v, n) => v.reflow());
		this.showUnsaved();
	}
}
