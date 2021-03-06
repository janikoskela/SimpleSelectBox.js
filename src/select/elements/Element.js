SELECT.ELEMENTS.Element = function() {};

SELECT.ELEMENTS.Element.prototype.attachOnMouseWheelEventListener = function(callback, useCapture) {
    if (SELECT.UTILS.isEventSupported("mousewheel"))
        return this.attachEventListener("mousewheel", callback);
    if (SELECT.UTILS.isEventSupported("onmousewheel"))
        return this.attachEventListener("onmousewheel", callback);
    if (SELECT.UTILS.isEventSupported("DOMMouseScroll"))
        return this.attachEventListener("DOMMouseScroll", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnTransitionEndEventListener = function(callback, useCapture) {
    if (SELECT.UTILS.isEventSupported("webkitTransitionEnd"))
        return this.attachEventListener("webkitTransitionEnd", callback);
    if (SELECT.UTILS.isEventSupported("transitionend"))
        return this.attachEventListener("transitionend", callback);
    if (SELECT.UTILS.isEventSupported("oTransitionEnd"))
        return this.attachEventListener("oTransitionEnd", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnClickEventListener = function(callback, useCapture) {
    return this.attachEventListener("click", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnLoadEventListener = function(callback, useCapture) {
    return this.attachEventListener("load", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnMouseOverEventListener = function(callback, useCapture) {
    return this.attachEventListener("mouseover", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnBlurEventListener = function(callback, useCapture) {
    return this.attachEventListener("blur", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnKeyUpEventListener = function(callback, useCapture) {
    return this.attachEventListener("keyup", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnKeyDownEventListener = function(callback, useCapture) {
    return this.attachEventListener("keydown", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnTouchMoveEventListener = function(callback, useCapture) {
    return this.attachEventListener("touchmove", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnScrollEventListener = function(callback, useCapture) {
    return this.attachEventListener("scroll", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnChangeEventListener = function(callback, useCapture) {
    return this.attachEventListener("change", callback);
};

SELECT.ELEMENTS.Element.prototype.attachOnMouseLeaveEventListener = function(callback, useCapture) {
    return this.attachEventListener("mouseleave", callback);
};

SELECT.ELEMENTS.Element.prototype.attachEventListener = function(eventName, callback, useCapture) {
    return SELECT.UTILS.attachEventListener(this.element, eventName, callback, useCapture);
};

SELECT.ELEMENTS.Element.prototype.callFunction = function(obj, functionName, args) {
    return SELECT.UTILS.callFunc(obj, functionName, args);
};

SELECT.ELEMENTS.Element.prototype.hide = function() {
    return this.callFunction(this.element, "hide");
};

SELECT.ELEMENTS.Element.prototype.show = function() {
    return this.callFunction(this.element, "show");
};

SELECT.ELEMENTS.Element.prototype.getElement = function() {
	return this.element;
};

SELECT.ELEMENTS.Element.prototype.focus = function() {
    return this.callFunction(this.element, "focus");
};

SELECT.ELEMENTS.Element.prototype.blur = function() {
    return this.callFunction(this.element, "blur");
};

SELECT.ELEMENTS.Element.prototype.getOuterWidth = function() {
var style = this.element.currentStyle || window.getComputedStyle(this.element),
    width = this.element.offsetWidth, // or use style.width
    margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight),
    padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
    border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
    return width + margin + padding + border;
};

SELECT.ELEMENTS.Element.prototype.getClass = function() {
	return this.element.className;
};

SELECT.ELEMENTS.Element.prototype.getWidth = function() {
    var style = window.getComputedStyle(this.element);
    var display = style.display;
    var position = style.position;
    var visibility = style.visibility;
    var maxWidth = style.maxWidth.replace('px', '').replace('%', '');
    var wantedWidth = 0;

    // if its not hidden we just return normal height
    if (display !== 'none' && maxWidth !== '0') {
        return this.element.offsetWidth;
    }

    // the element is hidden so:
    // making the el block so we can meassure its height but still be hidden
    this.element.style.position   = 'absolute';
    this.element.style.visibility = 'hidden';
    this.element.style.display    = 'block';

    wantedWidth     = this.element.offsetWidth;

    // reverting to the original values
    this.element.style.display = display;
    this.element.style.position   = position;
    this.element.style.visibility = visibility;
    return wantedWidth;
};

SELECT.ELEMENTS.Element.prototype.getHeight = function() {
    var style = window.getComputedStyle(this.element);
    var display = style.display;
    var position = style.position;
    var visibility = style.visibility;
    var maxHeight = style.maxHeight.replace('px', '').replace('%', '');
    var wantedHeight = 0;

    // if its not hidden we just return normal height
    if (display !== 'none' && maxHeight !== '0') {
        return this.element.offsetHeight;
    }

    // the element is hidden so:
    // making the el block so we can meassure its height but still be hidden
    this.element.style.position   = 'absolute';
    this.element.style.visibility = 'hidden';
    this.element.style.display    = 'block';

    wantedHeight     = this.element.offsetHeight;

    // reverting to the original values
    this.element.style.display = display;
    this.element.style.position   = position;
    this.element.style.visibility = visibility;
    return wantedHeight;
};

SELECT.ELEMENTS.Element.prototype.slideUp = function(speed) {
    var el_max_height = 0;
    var el = this.element;
    speed /= 1000;
    if(el.getAttribute('data-max-height')) {
        this.element.setDataAttribute("slide", "up");
        el.style.overflowY = 'hidden';
        el.style.maxHeight = '0';
    } else {
        el_max_height                  = this.getHeight() + 'px';
        el.style['transition']         = 'max-height ' + speed + 's ease-in-out';
        el.style.overflowY             = 'hidden';
        el.style.maxHeight             = '0';
        el.setAttribute('data-max-height', el_max_height);
        el.style.display               = 'block';

        // we use setTimeout to modify maxHeight later than display (to we have the transition effect)
        setTimeout(function() {
            el.style.maxHeight = el_max_height;
        }, 10);
    }
};

SELECT.ELEMENTS.Element.prototype.slideDown = function(speed) {
    var el_max_height = 0;
    var el = this.element;
    speed /= 1000;
    if(el.getAttribute('data-max-height')) {
        el.style.overflowY = 'visible';
        this.element.setDataAttribute("slide", "down");
        el.style.maxHeight = el.getAttribute('data-max-height');
    } else {
        el_max_height                  = this.getHeight() + 'px';
        el.style['transition']         = 'max-height ' + speed + 's ease-in-out';
        el.style.overflowY             = 'visible';
        el.style.maxHeight             = '0';
        el.setAttribute('data-max-height', el_max_height);
        el.style.display               = 'block';

        // we use setTimeout to modify maxHeight later than display (to we have the transition effect)
        setTimeout(function() {
            el.style.maxHeight = el_max_height;
        }, 10);
    }
};

SELECT.ELEMENTS.Element.prototype.isHidden = function() {
    return this.callFunction(this.element, "isHidden");
};

SELECT.ELEMENTS.Element.prototype.disable = function() {
    return this.callFunction(this.element, "setAttribute", ["setAttribute", true]);
};

SELECT.ELEMENTS.Element.prototype.enable = function() {
    return this.callFunction(this.element, "removeAttribute", "disabled");
};

SELECT.ELEMENTS.Element.prototype.isDisabled = function() {
    var result = this.callFunction(this.element, "isDisabled");
    if (result === undefined)
        return false;
    return result;
};

SELECT.ELEMENTS.Element.prototype.getTabIndex = function() {
    return this.callFunction(this.element, "getAttribute", "tabindex");
};

SELECT.ELEMENTS.Element.prototype.removeTabIndex = function() {
    return this.callFunction(this.element, "removeAttribute", "tabindex");
};

SELECT.ELEMENTS.Element.prototype.setSelectedIndex = function(index) {
	this.element.selectedIndex = index;
};

SELECT.ELEMENTS.Element.prototype.empty = function() {
    return this.callFunction(this.element, "removeChildren");
};

SELECT.ELEMENTS.Element.prototype.hasChildren = function() {
    var children = this.callFunction(this.element, "getChildren");
    if (SELECT.UTILS.isArray(children))
        return children.length > 0;
    return false;
};

SELECT.ELEMENTS.Element.prototype.disableTabNavigation = function() {
    return this.callFunction(this.element, "setAttribute", ["tabindex", "-1"]);
};