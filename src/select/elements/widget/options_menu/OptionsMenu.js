SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu = function(Sandbox) {
	var that = this;
	var userDefinedSettings = Sandbox.publish("UserDefinedSettings");
	this.type = "div";
	this.commonClassName = "options-container";
	this.className = this.commonClassName + " " + Sandbox.publish("Wrapper:getTheme");
	this.element;
	this.width = userDefinedSettings.optionsMenuWidth;
	this.height = undefined;
	this.locked = false;
	this.useSearchInput = userDefinedSettings.useSearchInput || false;
	this.closeWhenCursorOut = userDefinedSettings.closeWhenCursorOut || false;

	this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);
    	var optionsMenuList = Sandbox.subscribe("OptionsMenuList", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuList(Sandbox));
    	var optionsMenuListElem = optionsMenuList.render();
        if (this.useSearchInput === true) {
        	renderOptionsMenuSearchWrapper();
        }
    	this.element.appendChild(optionsMenuListElem);
    	if (this.width !== undefined)
			this.setWidth(this.width);

        if (userDefinedSettings.closeWhenCursorOut === true) {
            this.element.addEventListener("mouseleave", function(e) {
                var toElem = e.toElement || e.relatedTarget;
                var widgetWrapperElem = Sandbox.publish("WidgetWrapper:getElement");
                if ((!SELECT.UTILS.isElement(toElem)) || (!SELECT.UTILS.isDescendant(widgetWrapperElem, toElem) && toElem != widgetWrapperElem))
                    Sandbox.publish("OptionsMenu:hide");
            });
        }
    	return this.element;
	}

	this.remove = function() {
		this.element.remove();
	}

	this.setTheme = function(className) {
		this.className = this.commonClassName + " " + className;
		this.element.setClass(this.className);
	}

	function renderOptionsMenuSearchWrapper() {
    	that.optionsMenuSearchWrapper = Sandbox.subscribe("OptionsMenuSearchWrapper", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper(Sandbox));
    	var optionsMenuSearchWrapperElem = that.optionsMenuSearchWrapper.render();
		that.element.appendFirst(optionsMenuSearchWrapperElem);
	}

	this.onNoOptionsFound = function() {
		Sandbox.publish("OptionsMenuList:hide");
		Sandbox.publish("OptionsMenuSearchNoResults:show");
	}

	this.onOptionsFound = function() {
		Sandbox.publish("OptionsMenuList:show");
		Sandbox.publish("OptionsMenuSearchNoResults:hide");
	}

	this.isLocked = function() {
		return this.locked;
	}

	this.unLock = function() {
		this.locked = false;
	}

	this.lock = function() {
		this.hide();
		this.locked = true;
	}

	this.setWidth = function(width) {
		this.width = width;
		this.element.setStyle("width", this.width);
	}

	this.getWidth = function() {
		var width = this.element.offsetWidth;
		if (this.element.isHidden()) {
			this.element.show();
			width = this.element.offsetWidth;
			this.element.hide();
		}
		width += Sandbox.publish("ArrowContainer").getWidth();
		this.setWidth(width);
		return width;
	}

	this.setHeight = function(height) {
		this.height = height;
		this.element.setStyle("height", this.height);
	}

	this.hide = function() {
		if (this.element.isHidden())
			return;
		this.element.hide();
		Sandbox.publish("OptionsMenuSearchInput:clear");
		Sandbox.publish("OptionsMenuSearchInput:blur");
		Sandbox.publish("OptionsMenuSearchNoResults:hide");
		Sandbox.publish("OptionsMenuList:refresh");
		Sandbox.publish("ArrowContainerContent").down();
	}

	this.show = function() {
		if (this.locked === true || this.isHidden() === false)
			return;
		Sandbox.publish("NativeSelectBox:triggerFocus");
		this.element.show();
		Sandbox.publish("OptionsMenuList:show");
		/*this.element.removeClass("options-container-down");
		this.element.removeClass("options-container-up");
		var top = this.element.getStyle("top") || 0;
		this.element.removeStyle("top");
		var h = this.element.offsetHeight;
		var windowInnerHeight = window.innerHeight;
		var remainingWindowHeight = windowInnerHeight - this.element.getBoundingClientRect().top;
		this.element.hide();
		var widgetWrapper = Sandbox.publish("WidgetWrapper");
		if (remainingWindowHeight < h && widgetWrapper.getElement().getBoundingClientRect().top > h) {
			this.element.addClass("options-container-up");
			this.element.setStyle("top", h * -1);
		}
		else {
			this.element.addClass("options-container-down");
		}
		this.element.show();
		Sandbox.publish("ArrowContainerContent").up();*/
		if (this.useSearchInput === true)
			Sandbox.publish("OptionsMenuSearchInput:focus");
		var pos = Sandbox.publish("WidgetWrapper:getPosition");
		this.setPosition(pos.left, pos.top);
		var elem = Sandbox.publish("Wrapper:getElement");
		this.setWidth(elem.offsetWidth);
	}

	this.setPosition = function(left, top) {
		this.element.setStyle("top", top);
		this.element.setStyle("left", left);
	}

	this.toggle = function() {
		if (this.element.isHidden())
			this.show();
		else
			this.hide();
	}

	this.toggleInputSearch = function() {
        if (this.useSearchInput === true) {
        	this.useSearchInput = false;
        	Sandbox.publish("OptionsMenuSearchWrapper:hide");
        }
        else {
        	if (this.optionsMenuSearchWrapper !== undefined)
        		Sandbox.publish("OptionsMenuSearchWrapper:show");
        	else {
        		renderOptionsMenuSearchWrapper();
        	}
        	this.useSearchInput = true;
        }
    }
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);