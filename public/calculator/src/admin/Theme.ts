// (c) Nicole Collings 2019-present, all rights reserved.

class Theme {
	inputs: (NumericInput | DecimalInput)[];
	unsaved: boolean;

	constructor(inputs: (NumericInput | DecimalInput)[]) {
		this.inputs = inputs;
		this.unsaved = false;
		
		new ColorPicker("headerTheme", $("#header_theme"), "headerTheme", true);

		if			(DATA.theme.backgroundTheme == "dark") 	$("#background_dark")				.prop('checked', true);
		else if (DATA.theme.backgroundTheme == "light") $("#background_light")			.prop('checked', true);
		else 																						$("#background_transparent").prop('checked', true);

		if (DATA.theme.showTitle) $("#display_sys_title").prop('checked', true);

		document.querySelectorAll("input").forEach((e) => e.addEventListener('input', () => this.showUnsaved()));
		$(".save_options .save").click(() => this.attemptSave());
	}

	showUnsaved() {
		this.unsaved = true;
		$(".save_options_wrap").addClass('visible');
	}

	attemptSave() {
		$("form").submit();
	}
}
