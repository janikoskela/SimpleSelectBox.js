SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupList = function(Facade) {
	this.type = "ul";
	this.className = "options-menu-list-item-group-list";
	this.element;

	this.render = function() {
    	this.element = SELEX.UTILS.createElement(this.type, this.className);
    	return this.element;
	}
};

SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupList.prototype = Object.create(SELEX.ELEMENTS.Element.prototype);