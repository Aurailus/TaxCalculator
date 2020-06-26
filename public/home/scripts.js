"use strict";
var Header = /** @class */ (function () {
    function Header(elem) {
        var _this = this;
        this.FLOAT_CUTOFF = 32;
        this.nav_floating = false;
        $(document).scroll(function () {
            if ($(document).scrollTop() > _this.FLOAT_CUTOFF && !_this.nav_floating) {
                elem.addClass("floating");
                _this.nav_floating = true;
            }
            else if ($(document).scrollTop() < _this.FLOAT_CUTOFF && _this.nav_floating) {
                elem.removeClass("floating");
                _this.nav_floating = false;
            }
        });
    }
    return Header;
}());
var HeroWrap = /** @class */ (function () {
    function HeroWrap(textElem, image, referrer) {
        var _this = this;
        this.CLEAR_TIME = 32;
        this.WRITE_TIME = 46;
        this.heroes = [];
        this.ind = 0;
        if (!referrer)
            referrer = "default";
        this.heroes = HEROES[referrer];
        setInterval(function () {
            image.removeClass('fade-in').addClass('fade-out');
            _this.clearDynamicText(textElem);
            setTimeout(function () {
                image.removeClass('fade-out').addClass('out');
                setTimeout(function () {
                    _this.ind++;
                    if (_this.ind > _this.heroes.length - 1)
                        _this.ind = 0;
                    image.removeClass('out').addClass('fade-in')
                        .css('background-image', ' linear-gradient(165deg, #5fa7ff, #e98bdd), url(/img/' + _this.heroes[_this.ind].image + ')');
                    _this.setDynamicText(_this.heroes[_this.ind].for + ".", textElem);
                }, 30);
            }, 300);
        }, 5000);
    }
    HeroWrap.prototype.clearDynamicText = function (elem) {
        var text = elem.text();
        var time = this.CLEAR_TIME;
        function eraseChar() {
            text = text.substr(0, text.length - 1);
            elem.text(text);
            if (text.length > 0)
                setTimeout(eraseChar, time);
        }
        eraseChar();
    };
    HeroWrap.prototype.setDynamicText = function (target, elem) {
        var text = "";
        var ind = 0;
        var time = this.WRITE_TIME;
        function addChar() {
            text += target.substr(ind++, 1);
            elem.text(text);
            if (text.length < target.length)
                setTimeout(addChar, time);
        }
        addChar();
    };
    return HeroWrap;
}());
var Perspective = /** @class */ (function () {
    function Perspective(elem) {
        elem.each(function (i, v) {
            var fric = 0.2;
            var currOffsetX = 0;
            var currOffsetY = 0;
            var targetOffsetX = 0;
            var targetOffsetY = 0;
            var me = $(v);
            var parent = me.parent();
            var section = parent.parent().parent();
            parent.css({ 'perspective': '1500px' });
            section.hover(function (e) {
                parent.addClass('hover');
                me.css({ 'will-change': 'transform' });
            }, function () {
                parent.removeClass('hover');
                me.css({ 'will-change': '' });
                targetOffsetX = 0;
                targetOffsetY = 0;
            });
            section.mousemove(function (e) {
                if (parent.hasClass('hover') &&
                    (e.pageY > parent.offset().top && e.pageY < parent.offset().top + parent.outerHeight())) {
                    var offsetX = e.pageX - parent.offset().left - me.offset().left / 2;
                    var offsetY = e.pageY - parent.offset().top;
                    offsetX = Math.max(Math.min(offsetX, me.outerWidth()), 0);
                    offsetY = Math.max(Math.min(offsetY, me.outerHeight()), 0);
                    targetOffsetX = Math.round(((offsetX / me.outerWidth() * 2 - 1) * 7) * 100) / 100;
                    targetOffsetY = Math.round((-(offsetY / me.outerHeight() * 2 - 1) * 7) * 100) / 100;
                }
                else {
                    targetOffsetX = 0;
                    targetOffsetY = 0;
                }
            });
            function updateElem() {
                currOffsetX = Math.round((currOffsetX * (1 - fric) + targetOffsetX * (fric)) * 100) / 100;
                currOffsetY = Math.round((currOffsetY * (1 - fric) + targetOffsetY * (fric)) * 100) / 100;
                me.css({
                    'transform': 'rotateX(' + (currOffsetY) + 'deg) ' +
                        'rotateY(' + (currOffsetX) + 'deg) '
                });
                requestAnimationFrame(updateElem);
            }
            requestAnimationFrame(updateElem);
        });
    }
    return Perspective;
}());
