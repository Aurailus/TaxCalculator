// (c) Nicole Collings 2019-present, all rights reserved.

interface InputsConfig {
	inputs_wrapper: JQuery,

	currAssessedValueElem: JQuery,
	currHomeownerGrantElem: JQuery,
	currLotVacancyElem: JQuery,
	currTaxPrepaymentsElem: JQuery,

	prevAssessedValueElem: JQuery,
	prevHomeownerGrantElem: JQuery,
	prevLotVacancyElem: JQuery,
	prevTaxPrepaymentsElem: JQuery,

	calculateButton: JQuery,
	previousYearEnabledElem: JQuery
}

interface ProcessedResults {
	taxPayout: Payout[],
	feePayout: Payout[],
	allPayouts: Payout[],

	total: number,
	assessed: number,
	grant: Grant,
	prepaid: number,
	final: number
}

interface Payout {
	name: string;
	value: number;
}

class Calculator {
	inputs: InputsConfig;
	resultsHandler: Results;

	constructor(inputs: InputsConfig, resultsHandler: Results) {
		this.inputs = inputs;
		this.resultsHandler = resultsHandler;

		//Toggle Previous Year Box Visibility
		inputs.previousYearEnabledElem.change(e => this.togglePreviousYear());

		//Bind Calculate Button
		inputs.calculateButton.click(e => this.calcClicked(e));
	}

	private calculate() {
		let prev = this.inputs.previousYearEnabledElem.prop('checked');

		let procPrev: ProcessedResults;
		let procCurr: ProcessedResults = this.process(true, 
			parseInt(this.inputs.currAssessedValueElem.val().toString()),
			!this.inputs.currLotVacancyElem.prop('checked'),
			parseInt(this.inputs.currHomeownerGrantElem.children('.item').attr('val')),
			parseInt(this.inputs.currTaxPrepaymentsElem.val().toString()));

		if (prev) {
			procPrev = this.process(false, 
				parseInt(this.inputs.prevAssessedValueElem.val().toString()),
				!this.inputs.prevLotVacancyElem.prop('checked'),
				parseInt(this.inputs.prevHomeownerGrantElem.children('.item').attr('val')),
				parseInt(this.inputs.prevTaxPrepaymentsElem.val().toString()));
		}

		//Sort by Value

		procCurr.taxPayout.sort((a: Payout, b: Payout) : number => a.value - b.value);
		procCurr.feePayout.sort((a: Payout, b: Payout) : number => a.value - b.value);
		procCurr.allPayouts.sort((a: Payout, b: Payout) : number => a.value - b.value);

		if (procPrev) {
			let newPayout = [];
			for (let a of procCurr.taxPayout) {
				for (let b of procPrev.taxPayout) {
					if (a.name == b.name) newPayout.push(b);
				}
			}
			procPrev.taxPayout = newPayout;

			newPayout = [];
			for (let a of procCurr.feePayout) {
				for (let b of procPrev.feePayout) {
					if (a.name == b.name) newPayout.push(b);
				}
			}
			procPrev.feePayout = newPayout;

			newPayout = [];
			for (let a of procCurr.allPayouts) {
				for (let b of procPrev.allPayouts) {
					if (a.name == b.name) newPayout.push(b);
				}
			}
			procPrev.allPayouts = newPayout;
		}

		// Render Results

		setTimeout(() => this.resultsHandler.create(procCurr, procPrev), 1100);
	}

	private togglePreviousYear() {
		this.inputs.inputs_wrapper.toggleClass('prev_visible', this.inputs.previousYearEnabledElem.prop('checked'));

		let disabled = !this.inputs.inputs_wrapper.hasClass('prev_visible');

		this.inputs.prevAssessedValueElem .prop('disabled', disabled);
		this.inputs.prevLotVacancyElem	  .prop('disabled', disabled);
		this.inputs.prevTaxPrepaymentsElem.prop('disabled', disabled);

		this.inputs.prevHomeownerGrantElem.attr('tabindex', disabled ? "-1" : "0");

		if (disabled) {
			this.inputs.prevAssessedValueElem.val("");
			this.inputs.prevAssessedValueElem.trigger('change');
			this.inputs.prevLotVacancyElem.prop('checked', false);
			this.inputs.prevTaxPrepaymentsElem.val("0");
			this.inputs.prevTaxPrepaymentsElem.trigger('change');
		}
	}

	private calcClicked(e: JQuery.ClickEvent) {
		let problem = false;

		if (isNaN(parseInt(this.inputs.currAssessedValueElem.val().toString()))) {
			problem = true;
			this.inputs.currAssessedValueElem.trigger('invalid');
		}
		if (isNaN(parseInt(this.inputs.currTaxPrepaymentsElem.val().toString()))) {
			problem = true;
			this.inputs.currTaxPrepaymentsElem.trigger('invalid');
		}
		if (this.inputs.previousYearEnabledElem.prop('checked')) {
			if (isNaN(parseInt(this.inputs.prevAssessedValueElem.val().toString()))) {
			problem = true;
			this.inputs.prevAssessedValueElem.trigger('invalid');
			}
			if (isNaN(parseInt(this.inputs.prevTaxPrepaymentsElem.val().toString()))) {
				problem = true;
				this.inputs.prevTaxPrepaymentsElem.trigger('invalid');
			}
		}

		if (!problem) {
			this.resultsHandler.empty();
			$(".calculate_info").remove();
			
			this.calculate();

			let s = new LoadingSpinner(this.resultsHandler.element);
			setTimeout(() => s.remove(), 1100);
		}

		e.preventDefault();
		return false;
	}

	//Return a table of calculated tax values.
	private process(current: boolean, assessed: number, occupied: boolean, grantInd: number, prepayments: number) : ProcessedResults {
		let taxes: Payout[] = [];
		let fees: Payout[] = [];
		let sum = 0;

		for (let tax of DATA.taxes) {
			let value = assessed * (current ? tax.values.current : tax.values.previous) / 1000;
			taxes.push({name: tax.name, value: value});
			sum += value;
		}

		for (let fee of DATA.fees) {
			if (fee.requiresOccupancyState !== undefined && fee.requiresOccupancyState != occupied) continue;
			let value = (current ? fee.values.current : fee.values.previous);
			fees.push({name: fee.name, value: value});
			sum += value;
		}

		let results: ProcessedResults = {
			taxPayout: taxes,
			feePayout: fees,
			allPayouts: [...taxes].concat(fees),

			total: sum,
			assessed: assessed,
			grant: DATA.grants[grantInd],
			prepaid: prepayments,
			final: sum - DATA.grants[grantInd].value - prepayments,
		}

		return results;
	}
}
