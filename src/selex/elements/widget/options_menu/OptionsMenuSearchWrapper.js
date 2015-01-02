SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper = function(userDefinedSettings, optionsMenu) {
	this.type = "div";
	this.className = "options-menu-search-wrapper";
	this.element;
	this.optionsMenu = optionsMenu;
	this.optionsMenuSearchInput;
	this.optionsMenuSearchNoResults;

	this.render = function() {
    	this.element = SELEX.UTILS.createElement(this.type, this.className);
    	this.optionsMenuSearchInput = new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInput(this.optionsMenu);
    	var optionsMenuSearchInputElem = this.optionsMenuSearchInput.render();
    	this.element.appendChild(optionsMenuSearchInputElem);
    	this.optionsMenuSearchNoResults = new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchNoResults(userDefinedSettings);
    	this.element.appendChild(this.optionsMenuSearchNoResults.render());
    	return this.element;
	}

	this.getOptionsMenuSearchNoResults = function() {
		return this.optionsMenuSearchNoResults;
	}

	this.clear = function() {
		this.optionsMenuSearchInput.clear();
	}

};