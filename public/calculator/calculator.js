"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
// (c) Nicole Collings 2019-present, all rights reserved.
var Calculator = /** @class */ (function () {
    function Calculator(inputs, resultsHandler) {
        var _this = this;
        this.inputs = inputs;
        this.resultsHandler = resultsHandler;
        //Toggle Previous Year Box Visibility
        inputs.previousYearEnabledElem.change(function (e) { return _this.togglePreviousYear(); });
        //Bind Calculate Button
        inputs.calculateButton.click(function (e) { return _this.calcClicked(e); });
    }
    Calculator.prototype.calculate = function () {
        var _this = this;
        var prev = this.inputs.previousYearEnabledElem.prop('checked');
        var calculateAll = prev && this.inputs.prevLotVacancyElem.prop('checked') != this.inputs.currLotVacancyElem.prop('checked');
        var procPrev;
        var procCurr = this.process(true, parseInt(this.inputs.currAssessedValueElem.val().toString()), !this.inputs.currLotVacancyElem.prop('checked'), parseInt(this.inputs.currHomeownerGrantElem.children('.item').attr('val')), parseInt(this.inputs.currTaxPrepaymentsElem.val().toString()), calculateAll);
        if (prev) {
            procPrev = this.process(false, parseInt(this.inputs.prevAssessedValueElem.val().toString()), !this.inputs.prevLotVacancyElem.prop('checked'), parseInt(this.inputs.prevHomeownerGrantElem.children('.item').attr('val')), parseInt(this.inputs.prevTaxPrepaymentsElem.val().toString()), calculateAll);
        }
        //Sort by Value
        procCurr.taxPayout.sort(function (a, b) { return a.value - b.value; });
        procCurr.feePayout.sort(function (a, b) { return a.value - b.value; });
        procCurr.allPayouts.sort(function (a, b) { return a.value - b.value; });
        if (procPrev) {
            var newPayout = [];
            for (var _i = 0, _a = procCurr.taxPayout; _i < _a.length; _i++) {
                var a = _a[_i];
                for (var _b = 0, _c = procPrev.taxPayout; _b < _c.length; _b++) {
                    var b = _c[_b];
                    if (a.name == b.name)
                        newPayout.push(b);
                }
            }
            procPrev.taxPayout = newPayout;
            newPayout = [];
            for (var _d = 0, _e = procCurr.feePayout; _d < _e.length; _d++) {
                var a = _e[_d];
                for (var _f = 0, _g = procPrev.feePayout; _f < _g.length; _f++) {
                    var b = _g[_f];
                    if (a.name == b.name)
                        newPayout.push(b);
                }
            }
            procPrev.feePayout = newPayout;
            newPayout = [];
            for (var _h = 0, _j = procCurr.allPayouts; _h < _j.length; _h++) {
                var a = _j[_h];
                for (var _k = 0, _l = procPrev.allPayouts; _k < _l.length; _k++) {
                    var b = _l[_k];
                    if (a.name == b.name)
                        newPayout.push(b);
                }
            }
            procPrev.allPayouts = newPayout;
        }
        // Render Results
        setTimeout(function () { return _this.resultsHandler.create(procCurr, procPrev); }, 1100);
    };
    Calculator.prototype.togglePreviousYear = function () {
        this.inputs.inputs_wrapper.toggleClass('prev_visible', this.inputs.previousYearEnabledElem.prop('checked'));
        var disabled = !this.inputs.inputs_wrapper.hasClass('prev_visible');
        this.inputs.prevAssessedValueElem.prop('disabled', disabled);
        this.inputs.prevLotVacancyElem.prop('disabled', disabled);
        this.inputs.prevTaxPrepaymentsElem.prop('disabled', disabled);
        this.inputs.prevHomeownerGrantElem.attr('tabindex', disabled ? "-1" : "0");
        if (disabled) {
            this.inputs.prevAssessedValueElem.val("");
            this.inputs.prevAssessedValueElem.trigger('change');
            this.inputs.prevLotVacancyElem.prop('checked', false);
            this.inputs.prevTaxPrepaymentsElem.val("0");
            this.inputs.prevTaxPrepaymentsElem.trigger('change');
        }
    };
    Calculator.prototype.calcClicked = function (e) {
        var problem = false;
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
            var s_1 = new LoadingSpinner(this.resultsHandler.element);
            setTimeout(function () { return s_1.remove(); }, 1100);
        }
        e.preventDefault();
        return false;
    };
    //Return a table of calculated tax values.
    Calculator.prototype.process = function (current, assessed, occupied, grantInd, prepayments, calculateAll) {
        var taxes = [];
        var fees = [];
        var sum = 0;
        for (var _i = 0, _a = DATA.taxes; _i < _a.length; _i++) {
            var tax = _a[_i];
            var value = assessed * (current ? tax.values.current : tax.values.previous) / 1000;
            taxes.push({ name: tax.name, value: value });
            sum += value;
        }
        for (var _b = 0, _c = DATA.fees; _b < _c.length; _b++) {
            var fee = _c[_b];
            var value = void 0;
            if (fee.requiresOccupancyState !== undefined && fee.requiresOccupancyState != occupied) {
                if (!calculateAll)
                    continue;
                value = 0;
            }
            else
                value = (current ? fee.values.current : fee.values.previous);
            fees.push({ name: fee.name, value: value });
            sum += value;
        }
        var results = {
            taxPayout: taxes,
            feePayout: fees,
            allPayouts: __spreadArrays(taxes).concat(fees),
            total: sum,
            assessed: assessed,
            grant: DATA.grants[grantInd],
            prepaid: prepayments,
            final: sum - DATA.grants[grantInd].value - prepayments,
        };
        return results;
    };
    return Calculator;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var LoadingSpinner = /** @class */ (function () {
    function LoadingSpinner(appendTo) {
        var _this = this;
        this.element = $("\n\t\t<div class=\"sk-cube-grid\">\n\t\t  <div class=\"sk-cube sk-cube1\"></div>\n\t\t  <div class=\"sk-cube sk-cube2\"></div>\n\t\t  <div class=\"sk-cube sk-cube3\"></div>\n\t\t  <div class=\"sk-cube sk-cube4\"></div>\n\t\t  <div class=\"sk-cube sk-cube5\"></div>\n\t\t  <div class=\"sk-cube sk-cube6\"></div>\n\t\t  <div class=\"sk-cube sk-cube7\"></div>\n\t\t  <div class=\"sk-cube sk-cube8\"></div>\n\t\t  <div class=\"sk-cube sk-cube9\"></div>\n\t\t</div>");
        this.element.appendTo(appendTo);
        setTimeout(function () {
            _this.element.addClass('visible');
        }, 16);
    }
    LoadingSpinner.prototype.remove = function () {
        var _this = this;
        this.element.removeClass('visible');
        setTimeout(function () {
            _this.element.remove();
        }, 200);
    };
    return LoadingSpinner;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
/// <reference path="../@types/jquery/JQuery.d.ts"/>
/// <reference path="../@types/p5/index.d.ts"/>
var dynamicElements = [];
$(function () {
    //Create Numeric Input Objects
    $("input[type=numeric]").each(function (_, v) {
        dynamicElements.push(new NumericInput($(v)));
    });
    //Create Selection Objects
    $(".input_select").each(function (_, v) {
        dynamicElements.push(new SelectInput($(v)));
    });
    //Relflow any Elements that may have moved
    setTimeout(function () { return dynamicElements.forEach(function (v, n) { return v.reflow(); }); }, 150);
    var results = new Results($(".results_wrap"));
    $("#admin").click(function () { return window.open("/admin", '_blank'); });
    var calculator = new Calculator({
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
$(window).on("load", function () {
    //Reflow any elements that may have moved
    dynamicElements.forEach(function (v, n) { return v.reflow(); });
    console.log("%cInterested in this web application?", 'display: block; text-align: center; font-size: 18px; color: #fff; background-color: #222;');
    console.log("%cFind out more at tax-calculator.ca", 'display: block; text-align: center; font-size: 14px; color: #fff; background-color: #222;');
    var prevHeight = 0;
    setTimeout(heightChange, 200);
    function heightChange() {
        if ($("#frame_wrap").outerHeight() != prevHeight) {
            prevHeight = $("#frame_wrap").outerHeight();
            window.parent.postMessage(prevHeight, "*");
        }
        setTimeout(heightChange, 200);
    }
});
function formatNum(num, decimals, prefix) {
    if (decimals === void 0) { decimals = 2; }
    if (prefix === void 0) { prefix = ''; }
    var opts = { useGrouping: true, minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    var str = (num < 0 ? "-" : "") + prefix + Math.abs(num).toLocaleString('en', opts);
    return str;
}
function mod(a, n) {
    return ((a % n) + n) % n;
}
;
// (c) Nicole Collings 2019-present, all rights reserved.
var NumericInput = /** @class */ (function () {
    function NumericInput(element, max_digits) {
        var _this = this;
        if (max_digits === void 0) { max_digits = 12; }
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
        $(window).on('resize', function () { return _this.positionOverlay(); });
        //Set Insertion Point to the End of the Input
        this.element.focus(function (e) { return _this.setInsertionPoint(e); });
        //Prevent Click Events from Alterring Cursor Position.
        this.element.on("mousedown touchstart click press", function (e) { return _this.preventCursorUpdate(e); });
        //Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
        this.element.keydown(function (e) { return _this.preventKeyNav(e); });
        //Disallow Non-numeric inputs (e, +, -)
        this.element.keypress(function (e) { return _this.handleUpdate(e); });
        //Update overlay on external change
        this.element.change(function (e) { return _this.updateOverlay(); });
        this.element.on("invalid", function () { return _this.showErrorPlaceholder(); });
    }
    NumericInput.prototype.showErrorPlaceholder = function () {
        var prefix = "<span class='prefix'>$</span>";
        var error = " <span class='error'>Required</span>";
        this.overlay.html(prefix + error);
    };
    NumericInput.prototype.reflow = function () {
        this.positionOverlay();
    };
    NumericInput.prototype.positionOverlay = function () {
        var pos = this.element.position();
        var border_width = parseInt(this.element.css('border-top-width'));
        pos.top += border_width;
        pos.left += border_width;
        var pad = parseInt(this.element.css('padding-left'));
        var size = { width: this.element.innerWidth(), height: this.element.innerHeight() };
        this.overlay.css({
            "top": pos.top + pad - 1.5,
            "left": pos.left + pad,
            "max-width": size.width - pad * 2,
            "height": size.height - pad * 2 + 2
        });
    };
    NumericInput.prototype.updateOverlay = function () {
        var prefix = "<span class='prefix'>$</span>";
        var pretty = "";
        var num = parseInt(this.element.val().toString());
        if (!isNaN(num))
            pretty = parseInt(this.element.val().toString()).toLocaleString('en', { useGrouping: true });
        var str = prefix + pretty;
        this.overlay.html(str);
    };
    NumericInput.prototype.getDigits = function () {
        return this.element.val().toString().length;
    };
    NumericInput.prototype.setInsertionPoint = function (e) {
        //Set Insertion Point to the End of the Input
        var len = this.element.val().toString().length;
        this.element[0].setSelectionRange(len, len);
    };
    NumericInput.prototype.preventCursorUpdate = function (e) {
        //Prevent Click Events from Alterring Cursor Position.
        this.element.focus();
        return false;
    };
    NumericInput.prototype.handleUpdate = function (e) {
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
    };
    NumericInput.prototype.validateInput = function () {
        var str = this.element.val().toString();
        var sanitized = "";
        for (var i = 0; i < str.length; i++) {
            if (this.allowedInput(str.charCodeAt(i))) {
                sanitized += str[i];
            }
        }
        if (str != sanitized) {
            this.element.val(sanitized);
        }
    };
    NumericInput.prototype.preventKeyNav = function (e) {
        var _this = this;
        //Disallow any "strange" key commands. (Up, down, left, right arrows, Control+A, etc.)
        if (!this.allowedInput(e.keyCode)) {
            //Android doesn't seem to call KeyPress events on the mobile keyboard always, 
            //so if an invalid key is pressed, set a timeout to validate the contents after it has been added.
            setTimeout(function () { return _this.validateInput(); }, 1);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        //Update the overlay, this is in this method so that backspace events also update it.
        setTimeout(function () { return _this.updateOverlay(); }, 1);
    };
    NumericInput.prototype.allowedInput = function (k) {
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
    };
    return NumericInput;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var Results = /** @class */ (function () {
    function Results(element) {
        this.colLeft = 0;
        this.colRight = 0;
        this.element = element;
        this.colLeftElem = element.children(".col.left");
        this.colRightElem = element.children(".col.right");
    }
    Results.prototype.empty = function () {
        var _this = this;
        this.element.find(".result_pane").removeClass('visible');
        setTimeout(function () { return _this.element.find(".result_pane").remove(); }, 200);
        this.colLeft = 0;
        this.colRight = 0;
    };
    Results.prototype.create = function (procCurr, procPrev) {
        var finals = new ResultFinalNumbers(procCurr, procPrev);
        this.appendElem(finals.elem);
        var insights = new ResultInsights(procCurr, procPrev);
        this.appendElem(insights.elem);
        var piechart = new ResultPieChart();
        this.appendElem(piechart.elem);
        piechart.createSketch(procCurr, procPrev);
        var barchart = new ResultBarChart();
        this.appendElem(barchart.elem);
        barchart.createSketch(procCurr, procPrev);
        var timeout = 16;
        this.element.find(".result_pane").each(function (_, v) {
            setTimeout(function () {
                $(v).addClass('visible');
            }, timeout);
            timeout += 100;
        });
    };
    Results.prototype.appendElem = function (elem) {
        if ($(window).width() >= 1210) {
            if (this.colLeft > this.colRight) {
                this.colRightElem.append(elem);
                this.colRight += elem.outerHeight();
            }
            else {
                this.colLeftElem.append(elem);
                this.colLeft += elem.outerHeight();
            }
        }
        else {
            this.colLeftElem.append(elem);
        }
    };
    return Results;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var SelectInput = /** @class */ (function () {
    function SelectInput(element) {
        var _this = this;
        this.element = element;
        this.options = element.children().clone();
        this.list = null;
        this.options.attr('tabindex', '0');
        element.children().each(function (i, v) {
            if (!$(v).hasClass('selected')) {
                $(v).detach();
            }
        });
        this.element.click(function () { return _this.interact(); });
        $(document).keypress(function (e) {
            if ($(':focus').is(_this.element)) {
                _this.interact();
            }
            if (_this.list != null) {
                _this.list.children().each(function (i, v) {
                    if ($(":focus").is($(v))) {
                        _this.selectElement($(v));
                    }
                });
            }
        });
    }
    SelectInput.prototype.reflow = function () {
        //stub
    };
    SelectInput.prototype.selectElement = function (elem) {
        var _this = this;
        this.options.removeClass('selected');
        elem.addClass('selected');
        this.element.children('.item').remove();
        this.element.append(elem.clone());
        this.element.children('.item').removeAttr('tabindex');
        $(document).off('click', this.bind);
        this.list.removeClass('open');
        setTimeout(function () {
            _this.list.remove();
            _this.list = null;
        }, 100);
        this.element.focus();
    };
    SelectInput.prototype.closeOut = function () {
        var _this = this;
        //Close the popup without setting a new child
        setTimeout(function () {
            if (_this.list != null) {
                $(document).off('click', _this.bind);
                _this.list.removeClass('open');
                setTimeout(function () {
                    _this.list.remove();
                    _this.list = null;
                }, 100);
            }
        }, 150);
    };
    SelectInput.prototype.interact = function () {
        var _this = this;
        if (this.list == null) {
            this.list = $("<div class='select_list'></div>");
            this.options.appendTo(this.list);
            this.element.append(this.list);
            setTimeout(function () {
                _this.list.addClass('open');
                _this.list.find('.selected').focus();
            }, 16);
            var ctx_1 = this;
            this.options.click(function () {
                ctx_1.selectElement.call(ctx_1, $(this));
            });
            this.bind = function () { return _this.closeOut(); };
            setTimeout(function () { return $(document).click(_this.bind); }, 100);
        }
    };
    return SelectInput;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var ResultBarChart = /** @class */ (function () {
    function ResultBarChart() {
        this.maxNameWidth = 0;
        this.elem = $("\n\t\t\t<div class='result_pane final_numbers'>\n\t\t\t\t<h2 class=\"title\"><i class=\"material-icons\">equalizer</i> Tax Rates Comparison</h2>\n\t\t\t\t<div id=\"barChartSketchWrap\"></div>\n\t\t\t</div>\n\t\t");
    }
    ResultBarChart.prototype.getData = function (table) {
        function norm(val, min, max) { return (val - min) / (max - min); }
        var max = table.total;
        var values = [];
        for (var _i = 0, _a = table.allPayouts; _i < _a.length; _i++) {
            var payout = _a[_i];
            values.push({
                name: payout.name,
                amount: payout.value,
                percent: norm(payout.value, 0, max)
            });
        }
        //Expand small slices
        var total = 0;
        for (var _b = 0, values_1 = values; _b < values_1.length; _b++) {
            var value = values_1[_b];
            value.disp = (value.percent < 0.0005) ? 0 : value.percent + Math.max(0.005 - (value.percent / 2), 0);
            total += value.disp;
        }
        //Normalize Slices
        for (var _c = 0, values_2 = values; _c < values_2.length; _c++) {
            var value = values_2[_c];
            value.disp /= total;
        }
        return values;
    };
    ResultBarChart.prototype.createSketch = function (procCurr, procPrev) {
        var _this = this;
        this.procCurr = procCurr;
        this.procPrev = procPrev;
        this.dataCurr = this.getData(procCurr);
        if (procPrev)
            this.dataPrev = this.getData(procPrev);
        var realScale = this.elem.find("#barChartSketchWrap").outerWidth();
        var size = Math.max(realScale, 450);
        var w = size;
        var h = 50 + (!this.procPrev ? 50 * procCurr.allPayouts.length : 72 * procPrev.allPayouts.length);
        var factor = realScale / size;
        this.sketch = new p5(function (p) {
            p.setup = function () { return _this.setup(p, w, h); };
            p.draw = function () { return _this.draw(p, w, h); };
            // p.mouseMoved = () => this.mouseMoved(p);
        });
        setTimeout(function () {
            $("#barChartSketchWrap canvas").css({
                "width": realScale,
                "height": h * factor
            });
        }, 16);
    };
    ResultBarChart.prototype.setup = function (p, w, h) {
        this.canvas = p.createCanvas(w, h);
        this.canvas.parent('barChartSketchWrap');
        p.noLoop();
        p.frameRate(60);
        p.textSize(18);
        p.textFont("Roboto");
        for (var _i = 0, _a = this.dataCurr; _i < _a.length; _i++) {
            var val = _a[_i];
            this.maxNameWidth = Math.max(this.maxNameWidth, p.textWidth(val.name));
        }
    };
    ResultBarChart.prototype.mouseMoved = function (p) {
        // if (p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height) p.redraw();
    };
    ResultBarChart.prototype.draw = function (p, w, h) {
        var colorsLight = ["#c73044", "#c73092", "#b12bba", "#8139c0", "#5239c0", "#3447bd", "#296cdb", "#1c91f7", "#00b8d0", "#00a091"];
        var colorsDark = ["#ad2335", "#9c196d", "#911f99", "#6b2aa3", "#3d289a", "#273a9e", "#224ac2", "#0b6fdf", "#009dab", "#008377"];
        p.background($("body").hasClass('light') ? "#fff" : "#333");
        var maxPercent = 0;
        for (var s = (this.procPrev ? 1 : 0); s >= 0; s--) {
            var table = (s == 0 ? this.dataCurr : this.dataPrev);
            for (var i = 0; i < table.length; i++) {
                maxPercent = Math.max(maxPercent, table[i].amount);
            }
        }
        var barHeight = (!this.procPrev ? 40 : 28);
        var betweenBarSpacing = 4;
        var barPadding = 12;
        var barLeft = this.maxNameWidth + 20;
        var y = 24;
        for (var i = 0; i < this.dataCurr.length; i++) {
            for (var s = 0; s <= (this.procPrev ? 1 : 0); s++) {
                var table = (s == 0 ? this.dataCurr : this.dataPrev);
                var color = ((s == 0) ? colorsLight : colorsDark)[9 - (i % 10)];
                var data = table[table.length - 1 - i];
                var barWidth = Math.max((w - barLeft - 20) * (data.amount / maxPercent), 3);
                var barPos = y + (s == 1 ? barHeight + betweenBarSpacing : 0);
                p.noStroke();
                p.fill($("body").hasClass('light') ? "#ddd" : "#292929");
                p.rect(barLeft + 4, barPos + 6, barWidth, barHeight);
                p.fill(color);
                p.rect(barLeft, barPos, barWidth, barHeight);
                p.textSize(18);
                if (!this.dataPrev)
                    barPos += 5;
                if (s == 0) {
                    p.textAlign(p.RIGHT);
                    p.textFont("Roboto");
                    p.fill($("body").hasClass('light') ? "#222" : "#ccc");
                    p.text(data.name, barLeft - 8, barPos + 21);
                    p.fill($("body").hasClass('light') ? "#000" : "#fff");
                }
                if (s == 1) {
                    var change = (this.dataCurr[table.length - 1 - i].amount - data.amount) / data.amount * 100;
                    p.textAlign(p.RIGHT);
                    p.textFont("Roboto Slab");
                    p.fill($("body").hasClass('light') ? "#000" : "#fff");
                    p.text(formatNum(change, 0) + "%", barLeft - 24, barPos + 21);
                    p.textSize(32);
                    p.textFont("Material Icons");
                    p.text(change > 0 ? 'arrow_drop_up' : 'arrow_drop_down', barLeft + 3, barPos + 31);
                    p.textSize(18);
                }
                p.textAlign(p.LEFT);
                p.textFont("Roboto Slab");
                var text = formatNum(data.amount, 2, "$");
                if (p.textWidth(text) < barWidth - 24) {
                    p.fill("#fff");
                    p.textAlign(p.RIGHT);
                    p.text(text, barWidth + barLeft - 8, barPos + 21);
                    p.textAlign(p.LEFT);
                    p.fill($("body").hasClass('light') ? "#000" : "#fff");
                }
                else {
                    p.text(text, barWidth + barLeft + 8, barPos + 21);
                }
                if (!this.dataPrev)
                    barPos -= 5;
            }
            y += barHeight * (this.procPrev ? 2 : 1) + (this.procPrev ? betweenBarSpacing : 0) + barPadding;
        }
        //Draw Info
        if (this.procPrev) {
            p.textFont("Roboto");
            p.textSize(16);
            p.textAlign(p.CENTER);
            p.fill($("body").hasClass('light') ? "#333" : "#aaa");
            p.text("Darker bars are a comparison to the previous year.", w / 2, h - 4);
            p.textAlign(p.LEFT);
        }
    };
    return ResultBarChart;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var ResultFinalNumbers = /** @class */ (function () {
    function ResultFinalNumbers(procCurr, procPrev) {
        this.increase = "trending_up";
        this.decrease = "trending_down";
        this.level = "trending_flat";
        var curr = this.formatHTML(procCurr, (procPrev ? DATA.year : -1));
        var prev = (procPrev ? this.formatHTML(procPrev, DATA.year - 1) : null);
        var incr = "";
        if (prev) {
            var taxChangeNumber = procCurr.total - procPrev.total;
            var taxChangePercent = taxChangeNumber / procPrev.total * 100;
            if (Math.round(taxChangeNumber) != 0) {
                var icon = (taxChangeNumber > 0) ? this.increase : this.decrease;
                incr = "<p class=\"change\"><i class='material-icons'>" + icon + "</i> <strong>\n\t\t\t\t\t\t\t\t\t" + (taxChangeNumber > 0 ? "Increased" : "Decreased") + "</strong> \n\t\t\t\t\t\t\t\t\t<span class='slab'>" + formatNum(taxChangeNumber, 2, "$") + "</span> \n\t\t\t\t\t\t\t\t\t<span class='slab'>(" + formatNum(taxChangePercent, 1) + "%)</span></p>";
            }
        }
        this.elem = $("\n\t\t\t<div class='result_pane final_numbers'>\n\t\t\t\t<h2 class=\"title\"><i class=\"material-icons\">account_balance_wallet</i> Total Estimated Property Tax</h2>\n\t\t\t\t<div class=\"flex_wrap\">\n\t\t\t\t\t" + curr + "\n\t\t\t\t\t" + (prev || "") + "\n\t\t\t\t</div>\n\t\t\t\t" + (incr || "") + "\n\t\t\t</div>");
    }
    ResultFinalNumbers.prototype.formatHTML = function (table, year) {
        var taxes = formatNum(table.total, 0, "$");
        var grant = formatNum(-table.grant.value, 0, "$");
        var prepaid = formatNum(-table.prepaid, 0, "$");
        var final = formatNum(table.final, 0, "$");
        var yearString = (year == -1 ? "" : "<h3>" + year + "</h3>");
        return "\n\t\t<div class=\"calc_box\">\n\t\t\t" + yearString + "\n\t\t\t<div class='line'><p class=\"title\">Taxes:</p> <p class='val'>" + taxes + "</p></div>\n\t\t\t<div class='line'><p class=\"title\">Grant:</p> <p class='val'>" + grant + "</p></div>\n\t\t\t<div class='line'><p class=\"title\">Prepaid:</p> <p class='val'>" + prepaid + "</p></div>\n\t\t\t<div class='line final'><p class=\"title\">Final:</p> <p class='val'>" + final + "</p></div>\n\t\t</div>\n\t\t";
    };
    return ResultFinalNumbers;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var ResultInsights = /** @class */ (function () {
    function ResultInsights(procCurr, procPrev) {
        this.increase = "trending_up";
        this.decrease = "trending_down";
        this.level = "trending_flat";
        this.info = "fiber_manual_record";
        var lines = "";
        if (procPrev) {
            var taxChangeNumber = procCurr.total - procPrev.total;
            var taxChangePercent = taxChangeNumber / procPrev.total * 100;
            if (Math.round(taxChangeNumber) != 0) {
                var icon = (taxChangeNumber > 0) ? this.increase : this.decrease;
                lines += "<p><i class='material-icons'>" + icon + "</i> Your estimated property tax has <strong>\n\t\t\t\t\t\t\t\t\t" + (taxChangeNumber > 0 ? "increased" : "decreased") + "</strong> by \n\t\t\t\t\t\t\t\t\t<span class='slab'>" + formatNum(taxChangeNumber, 2, "$") + "</span> \n\t\t\t\t\t\t\t\t\t<span class='slab'>(" + formatNum(taxChangePercent, 1) + "%)</span> since last year.</p>";
            }
            else {
                lines += "<p><i class=\"material-icons\">" + this.level + "</i> Your estimated property tax has not changed since last year.</p>";
            }
            var assessedChangeNumber = procCurr.assessed - procPrev.assessed;
            console.log(procCurr.assessed, procPrev.assessed);
            var assessedChangePercent = assessedChangeNumber / procPrev.assessed * 100;
            if (Math.round(assessedChangeNumber) != 0) {
                var icon = (assessedChangeNumber > 0) ? this.increase : this.decrease;
                lines += "<p><i class='material-icons'>" + icon + "</i> Your assessed value has <strong>\n\t\t\t\t\t\t\t\t " + (assessedChangeNumber > 0 ? "increased" : "decreased") + "</strong> by\n\t\t\t\t\t\t\t\t <span class='slab'>" + formatNum(assessedChangeNumber, 0, "$") + "</span> \n\t\t\t\t\t\t\t\t <span class='slab'>(" + formatNum(assessedChangePercent, 1) + "%)</span> since last year.</p>";
            }
            else {
                lines += "<p><i class=\"material-icons\">" + this.level + "</i> Your assessed value has not changed since last year.</p>";
            }
            var changeOffAvg = assessedChangePercent - DATA.insights.increase;
            if (Math.round(changeOffAvg) != 0) {
                var icon = (changeOffAvg > 0) ? this.increase : this.decrease;
                lines += "<p><i class=\"material-icons\">" + icon + "</i> Your assessed value change is \n\t\t\t\t\t\t\t\t <span class='slab'>" + formatNum(changeOffAvg, 1) + "%</span> " + ((changeOffAvg) > 0 ? "above" : "below") + " average.";
            }
            else {
                lines += "<p><i class=\"material-icons\">" + this.level + "</i> Your assessed value change is average.</p>";
            }
        }
        lines += "<p><i class=\"material-icons\">" + this.level + "</i> The average \n\t\t\tresidential property assessed value increase in " + DATA.city + " is <span class='slab'>" + DATA.insights.increase + "%</slab></p>";
        lines += "<p><i class=\"material-icons\">" + this.info + "</i> The average Single Family Dwelling assessment in " + DATA.year + " was <span class='slab'><span class='slab'>" + formatNum(DATA.insights.currentAvg, 0, "$") + "</slab></span>.</p>";
        lines += "<p><i class=\"material-icons\">" + this.info + "</i> The average Single Family Dwelling assessment in " + (DATA.year - 1) + " was <span class='slab'><span class='slab'>" + formatNum(DATA.insights.previousAvg, 0, "$") + "</slab></span>.</p>";
        this.elem = $("\n\t\t\t<div class='result_pane insights'>\n\t\t\t\t<h2 class=\"title\"><i class=\"material-icons\">bubble_chart</i> Tax Insights</h2>\n\t\t\t\t<div class=\"inner\">\n\t\t\t\t\t" + lines + "\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t");
    }
    return ResultInsights;
}());
// (c) Nicole Collings 2019-present, all rights reserved.
var ResultPieChart = /** @class */ (function () {
    function ResultPieChart() {
        this.elem = $("\n\t\t\t<div class='result_pane final_numbers'>\n\t\t\t\t<h2 class=\"title\"><i class=\"material-icons\">donut_small</i> Tax Breakdown</h2>\n\t\t\t\t<div id=\"pieChartSketchWrap\"></div>\n\t\t\t</div>\n\t\t");
    }
    ResultPieChart.prototype.getData = function (table, order) {
        function norm(val, min, max) { return (val - min) / (max - min); }
        var max = table.total;
        var values = [];
        var count = 0;
        var maxCount = 10;
        for (var i = table.allPayouts.length - 1; i >= 0; i--) {
            var payout = table.allPayouts[i];
            if (++count < maxCount || table.allPayouts.length == maxCount) {
                values.push({
                    name: payout.name,
                    amount: payout.value,
                    percent: norm(payout.value, 0, max)
                });
            }
            else if (values.length == maxCount - 1) {
                values.push({
                    name: "Other",
                    amount: payout.value,
                    percent: norm(payout.value, 0, max)
                });
            }
            else {
                values[maxCount - 1].amount += payout.value;
                values[maxCount - 1].percent = norm(values[maxCount - 1].amount, 0, max);
            }
        }
        values.reverse();
        //Expand small slices
        var total = 0;
        for (var _i = 0, values_3 = values; _i < values_3.length; _i++) {
            var value = values_3[_i];
            value.disp = (value.percent < 0.0005) ? 0 : value.percent + Math.max(0.005 - (value.percent / 2), 0);
            total += value.disp;
        }
        //Normalize Slices
        for (var _a = 0, values_4 = values; _a < values_4.length; _a++) {
            var value = values_4[_a];
            value.disp /= total;
        }
        return values;
    };
    ResultPieChart.prototype.createSketch = function (procCurr, procPrev) {
        var _this = this;
        this.dataCurr = this.getData(procCurr);
        if (procPrev)
            this.dataPrev = this.getData(procPrev, this.dataCurr);
        this.totalCurr = procCurr.total;
        this.totalPrev = (procPrev) ? procPrev.total : 0;
        var realScale = this.elem.find("#pieChartSketchWrap").outerWidth();
        var size = Math.max(realScale, 550);
        var w = size;
        var h = size + 21 * (procCurr.allPayouts.length - 1);
        if (procPrev)
            h += 60;
        var factor = realScale / size;
        this.sketch = new p5(function (p) {
            p.setup = function () { return _this.setup(p, w, h); };
            p.draw = function () { return _this.draw(p, w, h); };
            p.mouseMoved = function () { return _this.mouseMoved(p); };
        });
        setTimeout(function () {
            $("#pieChartSketchWrap canvas").css({
                "width": realScale,
                "height": h * factor
            });
        }, 16);
    };
    ResultPieChart.prototype.setup = function (p, w, h) {
        this.canvas = p.createCanvas(w, h);
        this.canvas.parent('pieChartSketchWrap');
        p.angleMode(p.RADIANS);
        p.noLoop();
        p.frameRate(30);
    };
    ResultPieChart.prototype.convertAng = function (ang) {
        if (ang < 0)
            return Math.PI * 2 + ang;
        return ang;
    };
    ResultPieChart.prototype.mouseMoved = function (p) {
        if (p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height)
            p.redraw();
    };
    ResultPieChart.prototype.drawSegments = function (table, p, x, y, start, end, shadow, colorsFill, colorsActive, sx, sy) {
        if (sx === void 0) { sx = 0; }
        if (sy === void 0) { sy = 0; }
        //Draw Pie Segments
        p.fill(255);
        p.noStroke();
        var mouseAng = this.convertAng(p.atan2(p.mouseY - y, p.mouseX - x));
        var distance = p.sqrt(p.sq(p.mouseY - y) + p.sq(p.mouseX - x));
        var inDistance = distance >= start / 2 && distance <= end / 2;
        var ang;
        ang = -p.PI / 2;
        var activeNum = -1;
        for (var s = 1; s >= (shadow ? 0 : 1); s--) {
            for (var i = 0; i < table.length; i++) {
                if (table[i].disp == 0)
                    continue;
                var rad = table[i].disp * p.TAU;
                var active = false;
                p.strokeWeight(3);
                if (!s) {
                    //Clip to -PI to PI
                    ang = (ang + p.PI + p.TAU) % p.TAU - p.PI;
                    var angleRefS = this.convertAng(ang);
                    var angleRefE = this.convertAng(ang - rad);
                    if ((((angleRefS > angleRefE) && (mouseAng < angleRefS && mouseAng > angleRefE)) ||
                        ((angleRefS < angleRefE) && (mouseAng < angleRefS && mouseAng < angleRefE)) ||
                        ((angleRefS < angleRefE) && (mouseAng > angleRefS && mouseAng > angleRefE)))
                        && inDistance) {
                        active = true;
                        activeNum = i;
                    }
                    var colorInd = mod(i - table.length + 10, 10);
                    p.fill((active ? colorsActive[colorInd] : colorsFill[colorInd]));
                    p.stroke($("body").hasClass('light') ? (active ? colorsActive[colorInd] : colorsFill[colorInd]) : (active ? "#fff" : colorsFill[colorInd]));
                }
                else {
                    p.noStroke();
                    p.fill("#0003");
                }
                p.arc(x + (s ? sx : 0), y + (s ? sy : 0), end, end, ang - rad, ang);
                ang -= rad;
            }
        }
        //Draw Divider Lines
        p.strokeWeight(3);
        p.stroke($("body").hasClass('light') ? (shadow ? "#ccc" : "#ddd") : (shadow ? "#292929" : "#333"));
        ang = -p.PI / 2;
        for (var i = 0; i < table.length; i++) {
            var rad = table[i].disp * p.TAU;
            var xDir = p.cos(ang - rad);
            var yDir = p.sin(ang - rad);
            p.line(x + xDir, y + yDir, x + xDir * (end + 2) / 2, y + yDir * (end + 2) / 2);
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
    };
    ResultPieChart.prototype.draw = function (p, w, h) {
        var colorsLightActive = ["#de3e53", "#e838aa", "#c93bd4", "#964ad9", "#5239c0", "#4b5dcd", "#3f7bdf", "#3ca2f8", "#37d7e5", "#4ac6bc"];
        var colorsLight = ["#c73044", "#c73092", "#b12bba", "#8139c0", "#5239c0", "#3447bd", "#296cdb", "#1c91f7", "#00b8d0", "#00a091"];
        var colorsDarkActive = ["#bd283b", "#b52281", "#a224ab", "#752eb3", "#422ca4", "#3447bd", "#296cdb", "#2a98f7", "#19c6d9", "#21b1a4"];
        var colorsDark = ["#ad2335", "#9c196d", "#911f99", "#6b2aa3", "#3d289a", "#273a9e", "#224ac2", "#0b6fdf", "#009dab", "#008377"];
        p.background($("body").hasClass('light') ? "#fff" : "#333");
        var circleSize = (w - 32);
        var x = w / 2;
        var y = h - circleSize / 2;
        var end;
        var start;
        var active = -1;
        //Draw Prev Segment (If Exists)
        if (this.dataPrev) {
            end = (w - 32) - w / 8;
            start = end - w / 6;
            var active1 = this.drawSegments(this.dataPrev, p, x, y, start, end, true, colorsDark, colorsDarkActive, 4, 6);
            if (active1 >= 0)
                active = active1 + this.dataCurr.length;
        }
        //Draw main Segment
        end = (w - 32) * 2 / (this.dataPrev ? 3 : 2.5);
        start = end - w / 4;
        var active2 = this.drawSegments(this.dataCurr, p, x, y, start, end, true, colorsLight, colorsLightActive, 4, 6);
        if (active2 >= 0)
            active = active2;
        //Draw Info
        var mw = w / 2 - 140;
        if (this.dataPrev)
            mw -= 120;
        if (this.dataPrev) {
            p.fill("#fff");
            p.textFont("Roboto Slab");
            p.textAlign(p.RIGHT);
            p.textSize(32);
            p.fill($("body").hasClass('light') ? "#000" : "#fff");
            p.text(DATA.year.toString(), mw + 290, 40);
            p.text((DATA.year - 1).toString(), mw + 290 + 240, 40);
        }
        var off = 0;
        for (var i = this.dataCurr.length * (this.dataPrev ? 2 : 1) - 1; i >= 0; i--) {
            var ind = i % this.dataCurr.length;
            var prev = i >= this.dataCurr.length;
            var imActive = active == i;
            var dataPiece = (prev ? this.dataPrev : this.dataCurr)[ind];
            var mh = (this.dataPrev ? 70 : 20) + 22 * off;
            var x_1 = 0;
            if (prev)
                x_1 += 240;
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
                p.text(dataPiece.name + " ", mw + 16, mh);
            }
            p.textAlign(p.LEFT);
            p.fill($("body").hasClass('light') ? "#222" : "#ccc");
            p.noStroke();
            p.textSize(18);
            p.textFont("Roboto Slab");
            p.textAlign(p.RIGHT);
            if (imActive) {
                p.fill($("body").hasClass('light') ? "#333" : "#fff");
                var w_1 = p.textWidth(formatNum(dataPiece.amount, 0, "$"));
                p.ellipse(mw + 220 + x_1 + 65, mh - 6, 24);
                p.ellipse(mw + 220 + x_1 - w_1 + 3, mh - 6, 24);
                p.rect(mw + 220 + x_1 - w_1 + 1, mh - 18, w_1 + 65, 24);
                p.fill($("body").hasClass('light') ? "#eee" : "#333");
            }
            p.text("" + formatNum(dataPiece.amount, 0, "$"), mw + 220 + x_1, mh);
            if (!imActive)
                p.fill($("body").hasClass('light') ? "#000" : "#fff");
            p.text(formatNum(dataPiece.percent * 100, 1) + "%", mw + 290 + x_1, mh);
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
    };
    return ResultPieChart;
}());
