SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper = function(Facade) {
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	this.type = "div";
	this.className = "options-menu-search-wrapper";
	this.element;

	this.render = function() {
    	this.element = SELEX.UTILS.createElement(this.type, this.className);
    	var optionsMenuSearchInput = Facade.subscribe("OptionsMenuSearchInput", new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInput(Facade));
    	var optionsMenuSearchInputElem = optionsMenuSearchInput.render();
    	this.element.appendChild(optionsMenuSearchInputElem);
    	
    	var optionsMenuSearchNoResults = Facade.subscribe("OptionsMenuSearchNoResults", new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchNoResults(Facade));
    	this.element.appendChild(optionsMenuSearchNoResults.render());
    	return this.element;
	}

	this.getHeight = function() {
		return this.element.offsetHeight;
	}

	this.setWidth = function(width) {
		this.element.setStyle("width", width);
		this.width = width;
	}

};

SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper.prototype = Object.create(SELEX.ELEMENTS.Element.prototype);