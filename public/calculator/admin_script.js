"use strict";
// (c) Nicole Collings 2019-present, all rights reserved.
class ColorPicker {
    constructor(name, parent, table_key, transparent = false) {
        const colors = [
            { name: "orange", hex: "#ff5722" },
            { name: "magenta", hex: "#e91e63" },
            { name: "indigo", hex: "#673ab7" },
            { name: "cyan", hex: "#00bcd4" },
            { name: "neutral", hex: "#607d8b" },
            { name: "lime", hex: "#8bc34a" },
            { name: "neon", hex: "#ffeb3b" },
            { name: "earth", hex: "#795548" },
            { name: "red", hex: "#f44336" },
            { name: "lavender", hex: "#9c27b0" },
            { name: "navy", hex: "#3f51b5" },
            { name: "blue", hex: "#2196f3" },
            { name: "teal", hex: "#009688" },
            { name: "green", hex: "#4caf50" },
            { name: "gold", hex: "#ff9800" },
        ];
        if (transparent)
            colors.push({ name: "trans", hex: "rgba(127,127,127,0.07)" });
        else
            colors.push({ name: "black", hex: "#000" });
        let selected = DATA.theme[table_key];
        for (let color of colors) {
            parent.append($(`<input ${selected == color.name ? "checked" : ""} class="color_picker" type="radio" 
											id="${name + "_" + color.name}" name="${name}" value="${color.name}">`));
            parent.append($(`<label class="color_picker" for="${name + "_" + color.name}" style="background-color: ${color.hex};">`));
        }
    }
}
// (c) Nicole Collings 2019-present, all rights reserved.
class Config {
    constructor(inputs) {
        this.inputs = inputs;
        this.unsaved = false;
        inputs.forEach((v, n) => v.updateOverlay());
        $(".tax_switch").click((e) => this.switchTaxes(e));
        $(".fee_switch").click((e) => this.switchFees(e));
        document.querySelectorAll("input").forEach((v) => {
            v.addEventListener("input", () => {
                v.classList.remove("invalid");
                this.showUnsaved();
            });
        });
        // $("input[name=city_name]").on("input", () => this.showUnsaved());
        // $("input[name=year]"     ).on("input", () => this.showUnsaved());
        $(".save_options .save").on("click", () => this.attemptSave());
    }
    showUnsaved() {
        this.unsaved = true;
        $(".save_options_wrap").addClass('visible');
    }
    attemptSave() {
        let canSave = true;
        $("input").each((_, v) => {
            if (($(v).hasClass('numeric') || $(v).hasClass('decimal')) && isNaN(parseFloat($(v).val().toString()))) {
                canSave = false;
                $(v).addClass('invalid');
            }
        });
        if (!canSave)
            return false;
        let taxes = [];
        let fees = [];
        let grants = [];
        let ind = 0;
        let curr = null;
        while ((curr = document.getElementById("tax_current_" + ind)) != null) {
            taxes.push({
                name: document.getElementById("tax_name_" + ind).value,
                values: {
                    current: parseFloat(curr.value),
                    previous: parseFloat(document.getElementById("tax_previous_" + ind).value),
                }
            });
            ind++;
        }
        ind = 0;
        curr: HTMLInputElement = null;
        while ((curr = document.getElementById("fee_current_" + ind)) != null) {
            fees.push({
                name: document.getElementById("fee_name_" + ind).value,
                values: {
                    current: parseFloat(curr.value),
                    previous: parseFloat(document.getElementById("fee_previous_" + ind).value),
                }
            });
            ind++;
        }
        ind = 0;
        let name = null;
        while ((name = document.getElementById("grant_name_" + ind)) != null) {
            grants.push({
                name: name.value,
                value: parseFloat(document.getElementById("grant_value_" + ind).value),
            });
            ind++;
        }
        let data = {
            city: document.getElementById("city_name").value,
            year: parseInt(document.getElementById("year").value),
            taxes: taxes,
            fees: fees,
            grants: grants,
            insights: {
                increase: parseFloat(document.getElementById("assessed_value_increase").value),
                currentAvg: parseFloat(document.getElementById("current_avg_assessment").value),
                previousAvg: parseFloat(document.getElementById("previous_avg_assessment").value)
            }
        };
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/admin/config", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => window.location.reload();
        xhr.send(JSON.stringify(data));
    }
    switchTaxes(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        let i = 0;
        let curr = null;
        while ((curr = document.getElementById('tax_current_' + i)) != null) {
            let prev = document.getElementById('tax_previous_' + i++);
            if (isNaN(parseFloat(curr.value)))
                curr.classList.add('invalid');
            else {
                prev.value = curr.value;
                curr.value = "";
            }
        }
        this.showUnsaved();
        this.inputs.forEach((v, n) => v.updateOverlay());
        return false;
    }
    switchFees(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        let i = 0;
        let curr = null;
        while ((curr = document.getElementById('fee_current_' + i)) != null) {
            let prev = document.getElementById('fee_previous_' + i++);
            if (isNaN(parseFloat(curr.value)))
                curr.classList.add('invalid');
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
// (c) Nicole Collings 2019-present, all rights reserved.
class DecimalInput {
    constructor(element, maxDigits = 12) {
        this.decimalPosition = -1;
        this.element = element;
        this.maxDigits = maxDigits;
        this.decimalPosition = element.val().toString().indexOf(".");
        this.element.attr('type', 'text');
        this.element.attr('inputmode', 'numeric');
        this.element.addClass('decimal');
        //Create Overlay for showing Pretty-printed value on.
        this.overlay = $("<div class='decimal_overlay'></div>");
        this.overlay.insertAfter(this.element);
        this.positionOverlay();
        this.updateOverlay();
        $(window).on('resize', () => this.positionOverlay());
        //Set Insertion Point to the End of the Input
        this.element.focus((e) => this.setInsertionPoint(e));
        //Prevent Click Events from Alterring Cursor Position.
        this.element.on("mousedown touchstart click press", (e) => this.preventCursorUpdate(e));
        //Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
        this.element.keydown((e) => this.preventKeyNav(e));
        //Disallow Non-numeric inputs (e, +, -)
        this.element.keypress((e) => this.handleUpdate(e));
        //Update overlay on external change
        this.element.change((e) => this.updateOverlay());
        this.element.on("invalid", () => this.showErrorPlaceholder());
    }
    showErrorPlaceholder() {
        ;
        let error = " <span class='error'>Required</span>";
        this.overlay.html(error);
    }
    reflow() {
        this.positionOverlay();
    }
    positionOverlay() {
        let pos = this.element.position();
        let border_width = parseInt(this.element.css('border-top-width'));
        pos.top += border_width;
        pos.left += border_width;
        let pad = parseInt(this.element.css('padding-left'));
        let size = { width: this.element.innerWidth(), height: this.element.innerHeight() };
        this.overlay.css({
            "top": pos.top + pad - 1.5,
            "left": pos.left + pad,
            "max-width": size.width - pad * 2,
            "height": size.height - pad * 2 + 2
        });
    }
    updateOverlay() {
        let suffix = "";
        // let suffix = "<span class='suffix'>%</span>";
        let pretty = "";
        let num = parseFloat(this.element.val().toString());
        if (!isNaN(num))
            pretty = this.element.val().toString();
        let str = pretty + suffix;
        this.overlay.html(str);
    }
    getDigits() {
        return this.element.val().toString().length;
    }
    setInsertionPoint(e) {
        //Set Insertion Point to the End of the Input
        let len = this.element.val().toString().length;
        this.element[0].setSelectionRange(len, len);
    }
    preventCursorUpdate(e) {
        //Prevent Click Events from Alterring Cursor Position.
        this.element.focus();
        return false;
    }
    handleUpdate(e) {
        //Prevent invalid periods
        if (e.key == "." && this.decimalPosition != -1) {
            e.preventDefault();
            return false;
        }
        if (this.getDigits() == 0 && e.key == ".") {
            e.preventDefault();
            return false;
        }
        setTimeout(() => this.decimalPosition = this.element.val().toString().indexOf("."), 1);
        //Remove leading zero if there is one
        if (this.getDigits() == 1 && this.element.val().toString()[0] == "0" && e.key != ".") {
            this.element.val(this.element.val().toString().substr(1));
        }
        //Prevent Value Getting too Long
        if (this.getDigits() >= this.maxDigits) {
            e.preventDefault();
            return false;
        }
        //Disallow Non-numeric inputs (e, +, -)
        if (!this.allowedInput(e.keyCode)) {
            e.preventDefault();
            return false;
        }
        //Prevent multiple leading zeroes
        if (e.keyCode == 48 && this.getDigits() > 0) {
            if (this.element.val().toString()[0] == "0" && this.decimalPosition == -1) {
                e.preventDefault();
                return false;
            }
        }
    }
    validateInput() {
        let str = this.element.val().toString();
        let sanitized = "";
        for (let i = 0; i < str.length; i++) {
            if (this.allowedInput(str.charCodeAt(i))) {
                sanitized += str[i];
            }
        }
        if (str != sanitized) {
            this.element.val(sanitized);
        }
    }
    preventKeyNav(e) {
        //Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
        if (!this.allowedInput(e.keyCode)) {
            //Android doesn't seem to call KeyPress events on the mobile keyboard always, 
            //so if an invalid key is pressed, set a timeout to validate the contents after it has been added.
            setTimeout(() => this.validateInput(), 1);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        //Update the overlay, this is in this method so that backspace events also update it.
        setTimeout(() => this.updateOverlay(), 1);
        setTimeout(() => this.decimalPosition = this.element.val().toString().indexOf("."), 1);
    }
    allowedInput(k) {
        //Backspace
        if (k == 8)
            return true;
        //Tab
        if (k == 9)
            return true;
        //Period
        if (k == 190 || k == 110 || k == 46)
            return true;
        //Number Row
        if (k >= 48 && k <= 57)
            return true;
        //Number Pad
        if (k >= 96 && k <= 105)
            return true;
        return false;
    }
}
// (c) Nicole Collings 2019-present, all rights reserved.
/// <reference path="../@types/jquery/JQuery.d.ts"/>
/// <reference path="../@types/p5/index.d.ts"/>
let dynamicElements = [];
$(() => {
    $("input[type=numeric]").each((_, v) => { dynamicElements.push(new NumericInput($(v))); });
    $("input[type=decimal]").each((_, v) => { dynamicElements.push(new DecimalInput($(v))); });
    if (window.location.href.split("#")[0].endsWith("config"))
        new Config(dynamicElements);
    if (window.location.href.split("#")[0].endsWith("theme"))
        new Theme(dynamicElements);
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
// (c) Nicole Collings 2019-present, all rights reserved.
class NumericInput {
    constructor(element, max_digits = 12) {
        this.element = element;
        this.max_digits = max_digits;
        this.element.attr('type', 'text');
        this.element.attr('inputmode', 'numeric');
        this.element.addClass('numeric');
        //Create Overlay for showing Pretty-printed value on.
        this.overlay = $("<div class='numeric_overlay'></div>");
        this.overlay.insertAfter(this.element);
        this.positionOverlay();
        this.updateOverlay();
        $(window).on('resize', () => this.positionOverlay());
        //Set Insertion Point to the End of the Input
        this.element.focus((e) => this.setInsertionPoint(e));
        //Prevent Click Events from Alterring Cursor Position.
        this.element.on("mousedown touchstart click press", (e) => this.preventCursorUpdate(e));
        //Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
        this.element.keydown((e) => this.preventKeyNav(e));
        //Disallow Non-numeric inputs (e, +, -)
        this.element.keypress((e) => this.handleUpdate(e));
        //Update overlay on external change
        this.element.change((e) => this.updateOverlay());
        this.element.on("invalid", () => this.showErrorPlaceholder());
    }
    showErrorPlaceholder() {
        let prefix = "<span class='prefix'>$</span>";
        let error = " <span class='error'>Required</span>";
        this.overlay.html(prefix + error);
    }
    reflow() {
        this.positionOverlay();
    }
    positionOverlay() {
        let pos = this.element.position();
        let border_width = parseInt(this.element.css('border-top-width'));
        pos.top += border_width;
        pos.left += border_width;
        let pad = parseInt(this.element.css('padding-left'));
        let size = { width: this.element.innerWidth(), height: this.element.innerHeight() };
        this.overlay.css({
            "top": pos.top + pad - 1.5,
            "left": pos.left + pad,
            "max-width": size.width - pad * 2,
            "height": size.height - pad * 2 + 2
        });
    }
    updateOverlay() {
        let prefix = "<span class='prefix'>$</span>";
        let pretty = "";
        let num = parseInt(this.element.val().toString());
        if (!isNaN(num))
            pretty = parseInt(this.element.val().toString()).toLocaleString('en', { useGrouping: true });
        let str = prefix + pretty;
        this.overlay.html(str);
    }
    getDigits() {
        return this.element.val().toString().length;
    }
    setInsertionPoint(e) {
        //Set Insertion Point to the End of the Input
        let len = this.element.val().toString().length;
        this.element[0].setSelectionRange(len, len);
    }
    preventCursorUpdate(e) {
        //Prevent Click Events from Alterring Cursor Position.
        this.element.focus();
        return false;
    }
    handleUpdate(e) {
        //Remove leading zero if there is one
        if (this.getDigits() > 0 && this.element.val().toString()[0] == "0") {
            this.element.val(this.element.val().toString().substr(1));
        }
        //Prevent Value Getting too Long
        if (this.getDigits() >= this.max_digits) {
            e.preventDefault();
            return false;
        }
        //Disallow Non-numeric inputs (e, +, -)
        if (!this.allowedInput(e.keyCode)) {
            e.preventDefault();
            return false;
        }
        //Prevent multiple leading zeroes
        if (e.keyCode == 48 && this.getDigits() > 0) {
            if (this.element.val().toString()[0] == "0") {
                e.preventDefault();
                return false;
            }
        }
    }
    validateInput() {
        let str = this.element.val().toString();
        let sanitized = "";
        for (let i = 0; i < str.length; i++) {
            if (this.allowedInput(str.charCodeAt(i))) {
                sanitized += str[i];
            }
        }
        if (str != sanitized) {
            this.element.val(sanitized);
        }
    }
    preventKeyNav(e) {
        //Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
        if (!this.allowedInput(e.keyCode)) {
            //Android doesn't seem to call KeyPress events on the mobile keyboard always, 
            //so if an invalid key is pressed, set a timeout to validate the contents after it has been added.
            setTimeout(() => this.validateInput(), 1);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        //Update the overlay, this is in this method so that backspace events also update it.
        setTimeout(() => this.updateOverlay(), 1);
    }
    allowedInput(k) {
        //Backspace
        if (k == 8)
            return true;
        //Tab
        if (k == 9)
            return true;
        //Number Row
        if (k >= 48 && k <= 57)
            return true;
        //Number Pad
        if (k >= 96 && k <= 105)
            return true;
        return false;
    }
}
// (c) Nicole Collings 2019-present, all rights reserved.
class Theme {
    constructor(inputs) {
        this.inputs = inputs;
        this.unsaved = false;
        new ColorPicker("headerTheme", $("#header_theme"), "headerTheme", true);
        if (DATA.theme.backgroundTheme == "dark")
            $("#background_dark").prop('checked', true);
        else if (DATA.theme.backgroundTheme == "light")
            $("#background_light").prop('checked', true);
        else
            $("#background_transparent").prop('checked', true);
        if (DATA.theme.showTitle)
            $("#display_sys_title").prop('checked', true);
        let ctx = this;
        $("input").each(function () { $(this).change(() => ctx.showUnsaved()); });
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
