(function ($) {
	var SEARCH_MODES = {};
	SEARCH_MODES.BY_FIRST_KEY = "firstKey";
	var KEY_CODES = {};
	KEY_CODES.UP = 38;
	KEY_CODES.DOWN = 40;
	KEY_CODES.ENTER = 13;
	var SORT_TYPES = {};
	SORT_TYPES.ASC = "asc";
	SORT_TYPES.DESC = "desc";
	var SELECT = {};
	SELECT.CONFIG = {};
	SELECT.UTILS = {};
	SELECT.HELPERS = {};
	SELECT.SETTINGS = {};
	SELECT.ELEMENTS = {};
	SELECT.ELEMENTS.WIDGET = {};
	SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER = {};
	SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER = {};
	SELECT.ELEMENTS.WIDGET.OPTIONS_MENU = {};
	SELECT.ELEMENTS.WIDGET.LOADING_OVERLAY = {};
	SELECT.ELEMENTS.NATIVE_SELECT = {};
	SELECT.EXCEPTIONS = {};
	var MUTATION_OBSERVER = window.MutationObserver || window.WebKitMutationObserver;
	var ALLOWED_TARGET_ELEMENT_TAG_NAME_SELECT = "select";

	Select = function(userDefinedSettings) {

		var Facade = new SELECT.Facade();
		var that = this;
		init();

		function init() {
			if (typeof userDefinedSettings !== "object")
				throw new SELECT.EXCEPTIONS.InvalidOptionsErrorException();
			if (userDefinedSettings.el instanceof jQuery)
				userDefinedSettings.el = $(userDefinedSettings.el)[0];
			Facade.subscribe("UserDefinedSettings", userDefinedSettings);
			Facade.subscribe("Wrapper", new SELECT.ELEMENTS.Wrapper(Facade));
		}

		this.attach = function() {
			Facade.publish("Wrapper:render");
			return this;
		}

		this.hide = function() {
			Facade.publish("Wrapper:hide");
			return this;
		}

		this.show = function() {
			Facade.publish("Wrapper:show");
			return this;
		}

		this.detach = function() {
			Facade.publish("Wrapper:detach");
			return this;
		}

		this.disable = function() {
			Facade.publish("Wrapper:disable");
			return this;
		}

		this.enable = function() {
			Facade.publish("Wrapper:enable");
			return this;
		}

		this.toggleLoadingMode = function() {
			Facade.publish("Wrapper:toggleLoadingMode");
			return this;
		}

		this.toggleInputSearch = function() {
			Facade.publish("OptionsMenu:toggleInputSearch");
			return this;
		}
	}

SELECT.CONFIG.CONSTRUCTOR_PARAMS_URL = "https://github.com/janikoskela/Select#constructor-parameters";SELECT.ELEMENTS.Element = function() {};

SELECT.ELEMENTS.Element.prototype.hide = function() {
	this.element.hide();
};

SELECT.ELEMENTS.Element.prototype.show = function() {
	this.element.show();
};

SELECT.ELEMENTS.Element.prototype.getElement = function() {
	return this.element;
};

SELECT.ELEMENTS.Element.prototype.focus = function() {
	return this.element.focus();
};

SELECT.ELEMENTS.Element.prototype.blur = function() {
	return this.element.blur();
};

SELECT.ELEMENTS.Element.prototype.getClass = function() {
	return this.element.className();
};

SELECT.ELEMENTS.Element.prototype.getWidth = function() {
	return this.element.offsetWidth;
};

SELECT.ELEMENTS.Element.prototype.isHidden = function() {
	return this.element.isHidden();
};

SELECT.ELEMENTS.Element.prototype.disable = function() {
	this.element.setAttribute("disabled", true);
};

SELECT.ELEMENTS.Element.prototype.enable = function() {
	this.element.removeAttribute("disabled");
};

SELECT.ELEMENTS.Element.prototype.isDisabled = function() {
	return this.element.isDisabled();
};

SELECT.ELEMENTS.Element.prototype.getTabIndex = function() {
	return this.element.getAttribute("tabindex");
};

SELECT.ELEMENTS.Element.prototype.setSelectedIndex = function(index) {
	this.element.selectedIndex = index;
};

SELECT.ELEMENTS.Element.prototype.empty = function() {
	this.element.removeChildren();
};

SELECT.ELEMENTS.Element.prototype.hasChildren = function() {
	return (this.element.getChildren().length > 0);
};

SELECT.ELEMENTS.Element.prototype.disableTabNavigation = function() {
    this.element.setAttribute("tabindex", "-1");
};SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBox = function(Facade, el) {
	var that = this;
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	this.optionItems = [];
	this.observer;
	this.element = el;
	this.usePolling = userDefinedSettings.usePolling || false;
	this.pollingInterval = userDefinedSettings.pollingInterval || 100;
	this.isElemHidden;
	this.isElemDisabled;
	this.optionsCount;

	this.attach = function() {
		this.optionItems = [];
		var optionsLength = this.element.options.length;
		this.optionsCount = optionsLength;
		for (var i = 0; i < optionsLength; i++) {
			var option = this.element.options[i];
			var optionItem = new SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxItem(Facade, option);
			this.optionItems.push(optionItem);
		}
		//if (MUTATION_OBSERVER !== undefined && this.observer === undefined)
		//	attachDomObserver();
		if (this.usePolling)
			this.poller = setInterval(this.poll.bind(this), this.pollingInterval);
		if (this.usePolling) {
			this.isElemHidden = this.isHidden();
			this.isElemDisabled = this.isDisabled();
		}
		return this.element;
	}

	this.detach = function() {
		this.observer = undefined;
		if (this.poller !== undefined)
			clearInterval(this.poller);
	}

	this.poll = function() {
		var isHidden = this.element.isHidden();
		if (isHidden !== this.isElemHidden) {
			this.isElemHidden = isHidden;
			if (isHidden)
				Facade.publish("Wrapper:hide");
			else
				Facade.publish("Wrapper:show");
		}
		var isDisabled = this.element.isDisabled();
		if (isDisabled !== this.isElemDisabled) {
			this.isElemDisabled = isDisabled;
			if (isDisabled)
				Facade.publish("Wrapper:disable");
			else
				Facade.publish("Wrapper:enable");
		}
		//if (this.observer === undefined) { //mutation observer does not detech attribute changes on <select>
			var optionsCount = this.element.options.length;
			if (optionsCount !== this.optionsCount) {
				this.optionsCount = optionsCount;
				this.attach();
				Facade.publish("OptionsMenuList").refresh();
			}
		//}
	}

	this.getOptions = function() {
		return this.optionItems;
	}

	function attachDomObserver() {
    	that.observer = new MUTATION_OBSERVER(function(mutations, observer) {
    		mutations.forEach(function (mutation) {
    			var addedNodesLength = (mutation.addedNodes === undefined) ? 0 : mutation.addedNodes.length;
    			var removedNodesLength = (mutation.removedNodes === undefined) ? 0 : mutation.removedNodes.length;
    			if (addedNodesLength > 0 || removedNodesLength.length > 0) {
    				that.attach();
    				Facade.publish("OptionsMenuList").refresh();
    			}
      		});
    	});
    	var config = { 
    		attributes: true, 
    		childList: true, 
    		characterData : false,  
    		subtree : false,
    		attributeOldValue: false,
    		attributeFilter: [],
    		characterDataOldValue: false,
    	};
    	that.observer.observe(that.element, config);
	}

	this.setSelectedOption = function(value) {
		for (var i = 0; i < this.optionItems.length; i++) {
			if (this.optionItems[i].getValue() == value) {
				this.optionItems[i].setSelected();
			}
			else
				this.optionItems[i].removeSelected();
		}
	}

	this.getSelectedOptionText = function() {
		var selectedOption = this.getSelectedOption();
		if (selectedOption !== undefined)
			return selectedOption.text;
		return "";
	}

	this.clearSelected = function() {
		var l = this.optionItems.length;
		for (var i = 0; i < l; i++)
			this.optionItems[i].removeSelected();
	}

	this.triggerChange = function() {
		this.clearSelected();
	    SELECT.UTILS.triggerEvent("change", this.element);
	}

	this.getSelectedOptionValue = function() {
		var selectedOption = this.getSelectedOption();
		if (selectedOption !== undefined)
			return selectedOption.value;
		return "";
	}

	this.getSelectedOptionImageUrl = function() {
		var selectedOption = this.getSelectedOption();
		if (selectedOption !== undefined)
			return selectedOption.getDataAttribute("image-url");
	}

	this.getSelectedOption = function() {
		var l = this.element.options.length;
		for (var i = 0; i < l; i++) {
			var option = this.element.options[i];
			var selected = (option.getAttribute("selected") === null) ? false : true;
			if (selected)
				return option;
		}
	}

};

SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBox.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxItem = function(Facade, optionElement) {
	this.element = optionElement;
	this.type = "option";

	this.isSelected = function() {
		return (this.element.getAttribute("selected") === null) ? false : true;
	}

	this.getText = function() {
		return this.element.text;
	}

	this.getOptionGroupLabel = function() {
		return this.element.parentNode.label;
	}

	this.getValue = function() {
		return this.element.value;
	}

	this.setSelected = function() {
		Facade.publish("NativeSelectBox").setSelectedIndex(this.element.index);
		Facade.publish("NativeSelectBox").triggerChange();
		this.element.setSelectedAttribute();
	}

	this.removeSelected = function() {
		this.element.removeAttribute("selected", "selected");
	}

	this.getImageUrl = function() {
		return this.element.getDataAttribute("image-url");
	}

	this.getDescription = function() {
		return this.element.getDataAttribute("description");
	}

	this.getOptionGroup = function() {
		var parentNode = this.element.parentNode;
		var tagName = parentNode.tagName;
		if (tagName !== null && tagName !== undefined) {
			if (tagName.toLowerCase() === "optgroup")
				return parentNode;
		}
	}
};

SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxItem.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxWrapper = function(Facade) {

	this.type = "div";
	this.element;
	this.className = "native-select-wrapper";

	this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type);
		this.element.setClass(this.className);
		this.element.hide();
		return this.element;
	}
};

SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxWrapper.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainer = function(Facade) {

	this.type = "div";
	this.element;
	this.className = "arrow-container";

	this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type);
		this.element.setClass(this.className);
		var arrowContainerContentInstance = Facade.subscribe("ArrowContainerContent", new SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainerContent(Facade));
		var elem = arrowContainerContentInstance.render();
		this.element.appendChild(elem);
		return this.element;
	}
};

SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainer.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainerContent = function(Facade) {

	var CLASS_NAME_ARROW_DOWN = "arrow-down";
	var CLASS_NAME_ARROW_UP = "arrow-up";

	this.type = "div";
	this.element;
	this.className = CLASS_NAME_ARROW_DOWN;

	this.render = function() {
		this.element = document.createElement(this.type);
		this.element.setClass(this.className);
		return this.element;
	}

	this.down = function() {
		this.className = CLASS_NAME_ARROW_DOWN;
		this.element.setClass(CLASS_NAME_ARROW_DOWN);
	}

	this.up = function() {
		this.className = CLASS_NAME_ARROW_UP;
		this.element.setClass(CLASS_NAME_ARROW_UP);
	}

	this.toggleClass = function() {
		if (this.className === CLASS_NAME_ARROW_DOWN) {
			this.up();
		}
		else {
			this.down();
		}
	}
};

SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainerContent.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu = function(Facade) {
	var that = this;
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	this.type = "div";
	this.className = "options-container";
	this.element;
	this.width = userDefinedSettings.optionsMenuWidth;
	this.height = undefined;
	this.locked = false;
	this.useSearchInput = userDefinedSettings.useSearchInput || false;

	this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);
    	var optionsMenuList = Facade.subscribe("OptionsMenuList", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuList(Facade));
    	var optionsMenuListElem = optionsMenuList.render();
        if (this.useSearchInput === true) {
        	renderOptionsMenuSearchWrapper();
        }
    	this.element.appendChild(optionsMenuListElem);
    	if (this.width !== undefined)
			this.setWidth(this.width);
    	return this.element;
	}

	function renderOptionsMenuSearchWrapper() {
    	that.optionsMenuSearchWrapper = Facade.subscribe("OptionsMenuSearchWrapper", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper(Facade));
    	var optionsMenuSearchWrapperElem = that.optionsMenuSearchWrapper.render();
		that.element.appendFirst(optionsMenuSearchWrapperElem);
	}

	this.onNoOptionsFound = function() {
		Facade.publish("OptionsMenuList:hide");
		Facade.publish("OptionsMenuSearchNoResults:show");
	}

	this.onOptionsFound = function() {
		Facade.publish("OptionsMenuList:show");
		Facade.publish("OptionsMenuSearchNoResults:hide");
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
		width += Facade.publish("ArrowContainer").getWidth();
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
		Facade.publish("OptionsMenuSearchInput:clear");
		Facade.publish("OptionsMenuSearchInput:blur");
		Facade.publish("OptionsMenuList:refresh");
		Facade.publish("OptionsMenuSearchNoResults:hide");
		Facade.publish("ArrowContainerContent").down();
	}

	this.show = function() {
		if (this.locked === true || this.isHidden() === false)
			return;
		this.element.show();
		this.element.removeClass("options-container-down");
		this.element.removeClass("options-container-up");
		var top = this.element.getStyle("top") || 0;
		this.element.removeStyle("top");
		var h = this.element.offsetHeight;
		var windowInnerHeight = window.innerHeight;
		var remainingWindowHeight = windowInnerHeight - this.element.getBoundingClientRect().top;
		this.element.hide();
		var widgetWrapper = Facade.publish("WidgetWrapper");
		if (remainingWindowHeight < h && widgetWrapper.getElement().getBoundingClientRect().top > h) {
			this.element.addClass("options-container-up");
			this.element.setStyle("top", h * -1);
		}
		else {
			this.element.addClass("options-container-down");
		}
		this.element.show();
		Facade.publish("ArrowContainerContent").up();
		if (this.useSearchInput === true)
			Facade.publish("OptionsMenuSearchInput:focus");
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
        	Facade.publish("OptionsMenuSearchWrapper:hide");
        }
        else {
        	if (this.optionsMenuSearchWrapper !== undefined)
        		Facade.publish("OptionsMenuSearchWrapper:show");
        	else {
        		renderOptionsMenuSearchWrapper();
        	}
        	this.useSearchInput = true;
        }
    }
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItem = function(Facade, nativeSelectOption, index) {
	var that = this;
	this.nativeSelectOption = nativeSelectOption;
	this.selected = nativeSelectOption.isSelected();
	this.type = "li";
	this.element;
	this.itemValue;
	this.className = "options-container-list-item";
	this.index = index;

	this.render = function() {
		this.itemValue = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemValue(Facade, nativeSelectOption);
		var childElem = this.itemValue.render();
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	this.element.addEventListener("click", onClick.bind(this));
    	this.element.addEventListener("mouseover", onMouseOver.bind(this));
    	this.element.addEventListener("keyup", onKeyUp.bind(this));
    	this.element.setDataAttribute("value", nativeSelectOption.getValue());
    	this.element.setDataAttribute("index", this.index);

		var imageUrl = this.nativeSelectOption.getImageUrl();
		if (imageUrl !== undefined && imageUrl !== null) {
			this.itemImage = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemImage(Facade, imageUrl);
			var elem = this.itemImage.render();
			this.element.appendChild(elem);
		}

    	this.element.appendChild(childElem);

		var description = this.nativeSelectOption.getDescription();
		if (description !== undefined && description !== null) {
			this.optionsMenuItemDescription = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemDescription(Facade, description);
			var optionsMenuItemDescriptionElem = this.optionsMenuItemDescription.render();
			this.element.appendChild(optionsMenuItemDescriptionElem);
		}
    	if (this.selected === true)
    		this.setInitialSelected();
    	return this.element;
	}

	this.getNativeSelectOption = function() {
		return this.nativeSelectOption;
	}

	this.getValue = function() {
		return this.nativeSelectOption.getValue();
	}

	this.getWidth = function() {
		return this.element.offsetWidth;
	}

	this.getText = function() {
		return this.nativeSelectOption.getText();
	}

	this.isHovered = function() {
		return (this.element.hasClass("hovered"));
	}

	this.isSelected = function() {
		return (this.element.hasClass("selected"));
	}

	this.setHovered = function() {
		this.element.addClass("hovered");
	}

	this.setInitialSelected = function() {
		Facade.publish("OptionsMenuList:clearSelected");
		this.element.addClass("selected");
		Facade.publish("ValueContainer:refresh");
	}

	this.setSelected = function() {
		Facade.publish("OptionsMenuList:clearSelected");
		this.nativeSelectOption.setSelected();
		this.element.addClass("selected");
		Facade.publish("ValueContainer:refresh");
	}

	this.getNextSibling = function() {
		return this.element.getNextSibling();
	}

	this.removeSelected = function() {
		this.element.removeClass("selected");
	}

	this.getOptionGroup = function() {
		return this.element.parentNode.parentNode;
	}

	this.getParentElement = function() {
		return this.element.parentNode;
	}

	this.removeHovered = function() {
		this.element.removeClass("hovered");
	}

	function onKeyUp(e) {
		switch (e.keyCode) {
			case KEY_CODES.ENTER:
				//this.setSelected();
				//Facade.publish("OptionsMenu:hide");
				break;
		}
	}

	this.getIndex = function() {
		return parseInt(this.element.getDataAttribute("index"));
	}

	function onMouseOver(e) {
		Facade.publish("OptionsMenuList:clearOptionItemHovers");
		this.element.addClass("hovered");
	}

	function onClick(e) {
		var optionsMenuList = Facade.publish("OptionsMenuList");
		var prevSelected = optionsMenuList.getSelectedOption();
		if (prevSelected === undefined) {
			this.setSelected();
		}
		else if (prevSelected.getIndex() !== this.getIndex()) {
			this.setSelected();
		}
		Facade.publish("OptionsMenu:hide");
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItem.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemDescription = function(Facade, description) {
	this.type = "div";
	this.description = description;
	this.className = "options-container-list-item-description";
	this.element;

	this.render = function() {
    	this.element = new SELECT.UTILS.createElement(this.type, this.className);
    	this.textNode = document.createTextNode(this.description);
    	this.element.appendChild(this.textNode);
    	return this.element;
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemDescription.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemImage = function(Facade, imageUrl) {
	this.type = "img";
	this.imageUrl = imageUrl;
	this.element;

	this.render = function() {
    	this.element = new SELECT.UTILS.createElement(this.type);
    	this.element.setAttribute("src", this.imageUrl);
    	return this.element;
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemImage.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemValue = function(Facade, option) {
	this.option = option;
	this.type = "span";
	this.element;
	this.textNode;

	this.render = function() {
    	this.element = document.createElement(this.type);
    	this.textNode = document.createTextNode(this.option.getText());
    	this.element.appendChild(this.textNode);
    	return this.element;
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemValue.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuList = function(Facade) {
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	var that = this;
	this.type = "ul";
	this.className = "options-container-list";
	this.element;
	this.height = undefined;
	this.optionItems = [];
	this.sortType = userDefinedSettings.sort;
	this.inputSearchEnabled = false;
	this.optionGroups = {};

	this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);
    	this.refresh();
		return this.element;
	}

	this.refresh = function() {
        var options = Facade.publish("NativeSelectBox").getOptions();
		switch(this.sortType) {
    		case "asc":
    			options.sort(sortByAsc);
    			break;
    		case "desc":
    			options.sort(sortByDesc);
    			break;
		}
		renderOptionItems(options);
		Facade.publish("ValueContainer").refresh();
	}

	function renderOptionItems(options) {
        that.optionItems = [];
       	that.optionGroups = {};
       	that.element.removeChildren();
        var l = options.length;
		for (var i = 0; i < l; i++) {
			var option = options[i];
			var item = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItem(Facade, option, i);
			that.optionItems.push(item);
			var elem = item.render();
			var optionGroup = option.getOptionGroup();
			if (optionGroup !== undefined) {
				var optionGroupLabel = optionGroup.label;
				if (that.optionGroups[optionGroupLabel] === undefined) {
					that.optionGroups[optionGroupLabel] = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroup(Facade, optionGroup);
		    		var li = that.optionGroups[optionGroupLabel].render();
		    		that.element.appendChild(li);
				}
				that.optionGroups[optionGroupLabel].getList().getElement().appendChild(elem);
			}
			else
				that.element.appendChild(elem);
		}
	}

    function sortByDesc(optionA, optionB) {
        var a = optionA.getText();
        var b = optionB.getText();
        if (a > b)
            return 1;
        if (a < b)
            return -1;
        return 0;
    }

    function sortByAsc(optionA, optionB) {
        var a = optionA.getText();
        var b = optionB.getText();       
        if (a > b)
            return -1;
        if (a < b)
            return 1;
        return 0;
    }

    function getNextOption(option) {
    	var nextSibling = option.getNextSibling();
    	if (nextSibling !== null && nextSibling !== undefined) {
    		var index = nextSibling.getDataAttribute("index");
    		return getOptionByIndex(index);
    	}
    	var optionGroup = option.getOptionGroup();
    	if (optionGroup !== undefined) {
	    	var nextOptionGroup = optionGroup.nextSibling;
	    	if (nextOptionGroup !== null && nextOptionGroup !== undefined) {
	    		if (nextOptionGroup.hasClass("options-container-list-item")) {
	    			var index = nextOptionGroup.getDataAttribute("index");
	    			return getOptionByIndex(index);
	    		}
	    		else
	    			return getFirstOptionFromOptionGroup(nextOptionGroup);
	    	}
	    }
    }

    function getFirstOptionFromOptionGroup(optionGroup) {
    	var children = optionGroup.getChildren();
    	children = children[1].getChildren();
    	var index = children[0].getDataAttribute("index");
    	return getOptionByIndex(index);
    }

    function getOptionByIndex(index) {
    	var l = that.optionItems.length;
    	for (var i = 0; i < l; i++) {
    		var option = that.optionItems[i];
    		if (option.getIndex() == index)
    			return option;
    	}
    }

    function getPreviousOption(option) {
    	var i = option.getIndex();
    	if (i === 0)
    		return that.optionItems[that.optionItems.length - 1];
    	if (that.optionItems.length - 1 >= i)
    		return that.optionItems[i - 1];
    	return that.optionItems[that.optionItems.length - 1];
    }

    this.hoverPreviousOption = function() {
    	var optionsMenu = Facade.publish("OptionsMenu");
		if (optionsMenu.isLocked())
			return;
    	var hovered = this.getHoveredOption();
    	var option;
    	if (hovered === undefined) {
    		var selected = this.getSelectedOption();
    		if (selected !== undefined)
    			option = getPreviousOption(selected);
    	}
    	else
    		option = getPreviousOption(hovered);
    	if (option === undefined)
    		option = this.optionItems[this.optionItems.length - 1];
    	this.clearOptionItemHovers();
		option.setHovered();
		if (optionsMenu.isHidden())
			option.setSelected();
		else
			this.element.scrollTop = option.getElement().offsetTop;
    }

    this.hoverFirstOption = function() {
    	this.clearOptionItemHovers();
    	var children = this.element.getChildren();
    	var firstChild = children[0];
    	if (firstChild.hasClass("options-container-list-item")) {
    		firstChild.addClass("hovered");
    	}
    	else {
    		var f = firstChild.getChildren();
    		var b = f[1].getChildren();
    		b[0].addClass("hovered");
    	}
		this.element.scrollTop = 0;
		Facade.publish("WidgetWrapper:focus");
	}

    this.hoverNextOption = function() {
		var optionsMenu = Facade.publish("OptionsMenu");
		if (optionsMenu.isLocked())
			return;
    	var hovered = this.getHoveredOption();
    	var option;
    	if (hovered === undefined) {
    		var selected = this.getSelectedOption();
    		if (selected !== undefined)
    			option = getNextOption(selected);
    	}
    	else
    		option = getNextOption(hovered);
    	if (option === undefined)
    		option = this.optionItems[0];
    	this.clearOptionItemHovers();
		option.setHovered();
		if (optionsMenu.isHidden()) {
			option.setSelected();
		}
		else {
			this.element.scrollTop = option.getElement().offsetTop - Facade.publish("OptionsMenuSearchWrapper:getHeight");
		}
    }

    this.selectHoveredOption = function() {
		var optionsMenu = Facade.publish("OptionsMenu");
		if (optionsMenu.isLocked())
			return;
    	var hovered = this.getHoveredOption();
    	if (hovered !== undefined)
    		hovered.setSelected();
		Facade.publish("OptionsMenu:hide");
    }

    function findOptionByFirstCharFromStart(firstChar) {
		var optionsMenu = Facade.publish("OptionsMenu");
    	var optionItemsCount = that.optionItems.length;
    	for (var i = 0; i < optionItemsCount; i++) {
			var itemText = that.optionItems[i].getText();
			if (firstChar === itemText[0].toLowerCase()) {
				that.optionItems[i].setHovered();
				if (optionsMenu.isHidden())
					that.optionItems[i].setSelected();
				else
					that.element.scrollTop = that.optionItems[i].getElement().offsetTop;
				return;
			}
		}
    }

    function isNextOptionFirstCharMatch(optionItem, firstChar) {
    	var optionsMenu = Facade.publish("OptionsMenu");
    	var text = optionItem.getText();
    	if (text[0].toLowerCase() === firstChar) {
    		that.clearOptionItemHovers();
    		optionItem.setHovered();
    		if (optionsMenu.isHidden())
    			optionItem.setSelected();
    		else
				that.element.scrollTop = optionItem.getElement().offsetTop - Facade.publish("OptionsMenuSearchWrapper:getHeight");
			return true;
    	}
    	return false;
    }

    this.isInputSearchEnabled = function() {
    	return this.inputSearchEnabled;
    }

    this.searchByInputString = function(query) {
    	this.inputSearchEnabled = true;
    	var options = Facade.publish("NativeSelectBox:getOptions");
    	var l = options.length;
    	var optionsMenu = Facade.publish("OptionsMenu");
    	var matchedOptions = [];
    	for (var i = 0; i < l; i++) {
    		var option = options[i];
    		var optionText = option.getText().toLowerCase();
    		if (optionText.indexOf(query.toLowerCase()) > -1) {
    			matchedOptions.push(option);
    		}
    	}
    	renderOptionItems(matchedOptions);
    	if (matchedOptions.length === 0)
    		optionsMenu.onNoOptionsFound();
    	else
    		optionsMenu.onOptionsFound();
    }

	this.searchByFirstChar = function(firstChar) {
    	var optionsMenu = Facade.publish("OptionsMenu");
		if (optionsMenu.isLocked())
			return;
		var hovered = this.getHoveredOption();
		var optionItemsCount = this.optionItems.length;
		if (hovered === undefined) {
			findOptionByFirstCharFromStart(firstChar);
		}
		else {
			var hoveredText = hovered.getText().toLowerCase();
			var hoveredIndex = hovered.getIndex();
			for (var i = hoveredIndex + 1; i < optionItemsCount; i++) {
				if (isNextOptionFirstCharMatch(this.optionItems[i], firstChar))
					return;
			}
			for (var j = 0; j < hoveredIndex; j++) {
				if (isNextOptionFirstCharMatch(this.optionItems[j], firstChar))
					return;
			}
		}
	}

	this.getListElements = function() {
		return this.element.getChildren();
	}

	this.getHoveredOption = function() {
		for (var i = 0; i < this.optionItems.length; i++) {
			var item = this.optionItems[i];
			if (item.isHovered())
				return item;
		}
	}

	this.getOptionByValue = function(value) {
		var l = this.optionItems.length;
		for (var i = 0; i < l; i++) {
			if (this.optionItems[i].getValue() === value)
				return this.optionItems[i];
		}
	}

	this.getSelectedOption = function() {
		for (var i = 0; i < this.optionItems.length; i++) {
			var item = this.optionItems[i];
			if (item.isSelected())
				return item;
		}
 	}

	this.clearOptionItemHovers = function() {
		var l = this.optionItems.length;
		for (var i = 0; i < l; i++) {
			this.optionItems[i].removeHovered();
		}
	}

	this.clearSelected = function() {
		var l = this.optionItems.length;
		for (var i = 0; i < l; i++)
			this.optionItems[i].removeSelected();
	}


	this.setWidth = function(width) {
		this.width = width;
		this.element.setStyle("width", this.width);
	}

	this.setHeight = function(height) {
		this.height = height;
		this.element.setStyle("height", this.height);
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuList.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroup = function(Facade, optionGroup) {
	this.type = "li";
	this.className = "options-menu-list-item-group";
	this.element;
	this.optionGroup = optionGroup;
	this.list;
	this.title;

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	this.title = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupTitle(Facade, this.optionGroup.label);
    	var titleElem = this.title.render();
    	this.list = new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupList(Facade);
    	var listElem = this.list.render();
    	this.element.appendChild(titleElem);
    	this.element.appendChild(listElem);
    	return this.element;
	}
	
	this.getList = function() {
		return this.list;
	}

};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroup.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupList = function(Facade) {
	this.type = "ul";
	this.className = "options-menu-list-item-group-list";
	this.element;

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	return this.element;
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupList.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupTitle = function(Facade, text) {
	this.type = "h2";
	this.className = "options-menu-list-item-group-title";
	this.text = text;
	this.element;

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	var textNode = document.createTextNode(this.text);
    	this.element.appendChild(textNode);
    	return this.element;
	}

};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuListItemGroupTitle.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInput = function(Facade) {
	this.type = "input";
	this.className = "options-menu-search-input";
	this.tabIndex = -1;
	this.element;
	this.allowClose = true;

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	this.element.setAttribute("type", "text");
    	this.element.setAttribute("tabindex", this.tabIndex);
    	this.element.addEventListener("blur", this.focusOut);
    	this.element.addEventListener("keyup", onKeyUp.bind(this));
    	return this.element;
	}

	this.clear = function() {
		this.element.value = "";
		this.value = undefined;
	}

	this.focusOut = function(e) {
		if (this.allowClose) {
			Facade.publish("OptionsMenu:hide");
			Facade.publish("WidgetWrapper:blur");
		}
	}

	function onKeyUp(e) {
		e.preventDefault();
		e.stopPropagation();
        switch(e.keyCode) {
        	case KEY_CODES.DOWN:
        		this.allowClose = false;
        		Facade.publish("OptionsMenuList").hoverFirstOption();
        		this.blur();
        		break;
        	default:
        		this.allowClose = true;
				var value = this.element.value;
				if (value.length === 0) {
					Facade.publish("OptionsMenuList:refresh");
					Facade.publish("OptionsMenuList:show");
					Facade.publish("OptionsMenuSearchNoResults:hide");
				}
				else
					Facade.publish("OptionsMenuList:searchByInputString", value);
        }
	}
};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInput.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInputWrapper = function(Facade) {
	this.type = "div";
	this.className = "options-menu-search-input-wrapper";
	this.element;

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	var optionsMenuSearchInput = Facade.subscribe("OptionsMenuSearchInput", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInput(Facade));
    	var optionsMenuSearchInputElem = optionsMenuSearchInput.render();
    	this.element.appendChild(optionsMenuSearchInputElem);
    	return this.element;
	}

};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInputWrapper.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchNoResults = function(Facade) {
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	this.type = "div";
	this.className = "options-menu-search-no-results";
	this.element;
	this.text = userDefinedSettings.noResultsMessage || "No results";

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	var textNode = document.createTextNode(this.text);
    	this.element.appendChild(textNode);
    	this.hide();
    	return this.element;
	}

};

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchNoResults.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper = function(Facade) {
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	this.type = "div";
	this.className = "options-menu-search-wrapper";
	this.element;

	this.render = function() {
    	this.element = SELECT.UTILS.createElement(this.type, this.className);
    	var optionsMenuSearchInputWrapper = Facade.subscribe("OptionsMenuSearchInputWrapper", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchInputWrapper(Facade));
    	var optionsMenuSearchInputWrapperElem = optionsMenuSearchInputWrapper.render();
    	this.element.appendChild(optionsMenuSearchInputWrapperElem);
    	
    	var optionsMenuSearchNoResults = Facade.subscribe("OptionsMenuSearchNoResults", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchNoResults(Facade));
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

SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuSearchWrapper.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainer = function(Facade) {
	var that = this;
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	this.type = "div";
	this.className = "value-container";
	this.element;
	this.loadingText = userDefinedSettings.loadingText || "Loading";

	this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);

        var valueContainerImage = Facade.subscribe("ValueContainerImage", new SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerImage(Facade));
		var valueContainerImageElem = valueContainerImage.render();
		this.element.appendChild(valueContainerImageElem);
		var imageUrl = Facade.publish("NativeSelectBox").getSelectedOptionImageUrl();
		if (imageUrl === undefined || imageUrl === null)
			valueContainerImage.hide();
		else
			valueContainerImage.setImageUrl(imageUrl);

    	var valueContainerText = Facade.subscribe("ValueContainerText", new SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerText(Facade));
    	var valueContainerTextElem = valueContainerText.render();
    	this.element.appendChild(valueContainerTextElem);
		return this.element;
	}

	this.refresh = function() {
		Facade.publish("ValueContainerText").refresh();
		var imageUrl = Facade.publish("NativeSelectBox").getSelectedOptionImageUrl();
		if (imageUrl !== undefined && imageUrl !== null) {
			Facade.publish("ValueContainerImage").setImageUrl(imageUrl);
			Facade.publish("ValueContainerImage").show();
		}
		else
			Facade.publish("ValueContainerImage").hide();	
	}

	this.enableLoadingMode = function() {
		Facade.publish("ValueContainerText").setText(this.loadingText);
		enableDotDotDotInterval();
	}

	function enableDotDotDotInterval() {
		var dots = ".";
		that.timeInterval = setInterval(function() {
			if (dots.length === 3)
				dots = ".";
			else
				dots += ".";
			Facade.publish("ValueContainerText").setText(that.loadingText + dots);
		}, 500);
	}

	this.disableLoadingMode = function() {
		clearInterval(this.timeInterval);
		Facade.publish("ValueContainerText").refresh();
	}
};

SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainer.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerImage = function(Facade) {
	this.type = "img";
	this.imageUrl;
	this.element;

	this.render = function() {
		this.element = SELECT.UTILS.createElement(this.type);
		return this.element;
	}

	this.setImageUrl = function(imageUrl) {
		this.imageUrl = imageUrl;
		this.element.setAttribute("src", this.imageUrl);
	}

	this.show = function() {
		this.element.setStyle("display", "inline-block");
	}
};

SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerImage.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerText = function(Facade) {
	var userDefinedSettings = Facade.publish("UserDefinedSettings");
	var that = this;
	this.type = "span";
	this.className = "value-container-text";
	this.element;
	this.placeholder = userDefinedSettings.placeholder;

	this.render = function() {
		this.element = SELECT.UTILS.createElement(this.type, this.className);
		this.refresh();
		return this.element;
	}

	this.refresh = function() {
		var text = Facade.publish("NativeSelectBox").getSelectedOptionText();
		if (text === undefined || text === null && this.placeholder !== undefined)
			this.setText(this.placeholder);
		else if (text.length  === 0 && this.placeholder !== undefined)
			this.setText(this.placeholder);
		else
			this.setText(text);
	}

	this.setPlaceholder = function(placeholder) {
		this.placeholder = placeholder;
		this.element.innerHTML = this.placeholder;
	}

	this.setText = function(text) {
		this.text = text;
		this.element.innerHTML = text;
	}
};

SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerText.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.SubWrapper = function(Facade) {

    var userDefinedSettings = Facade.publish("UserDefinedSettings");

    var ORIENTATION_LEFT = "left";

    var ORIENTATION_RIGHT = "right";

    this.type = "div";

    this.className = "widget-sub-wrapper";

    this.orientation = userDefinedSettings.orientation || "right";

    this.element;

    this.locked = false;

    this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);
        this.element.addEventListener("click", onClick.bind(this));

        var arrowContainer = Facade.subscribe("ArrowContainer", new SELECT.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainer(Facade));
        var arrowContainerElem = arrowContainer.render();

        var valueContainer = Facade.subscribe("ValueContainer", new SELECT.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainer(Facade));
        var valueContainerElem = valueContainer.render();

        switch (this.orientation) {
            case ORIENTATION_LEFT:
                this.element.appendChild(arrowContainerElem);
                arrowContainerElem.setStyle("float", this.orientation);
                this.element.appendChild(valueContainerElem);
                break;
            case ORIENTATION_RIGHT:
                this.element.appendChild(valueContainerElem);
                this.element.appendChild(arrowContainerElem);
                arrowContainerElem.setStyle("float", this.orientation);
                break;
            default:
                throw Error("Invalid orientation value \"" + this.orientation + "\"");

        }

        return this.element;
    }
    
    this.lock = function() {
        this.locked = true;
    }

    this.unLock = function() {
        this.locked = false;
    }

    function onClick(e) {
        if (this.locked === true)
            return;
        var nativeSelectBox = Facade.publish("NativeSelectBox");
        if (nativeSelectBox.isDisabled() === false)
            Facade.publish("OptionsMenu").toggle();
    }

};

SELECT.ELEMENTS.WIDGET.SubWrapper.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.WIDGET.Wrapper = function(Facade) {

    var userDefinedSettings = Facade.publish("UserDefinedSettings");

    this.type = "div";

    this.className = "widget-wrapper";

    this.element;

    this.tabIndex = Facade.publish("NativeSelectBox").getTabIndex() || 0;

    this.closeWhenCursorOut = userDefinedSettings.closeWhenCursorOut || true;

    this.locked = false;

    this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);
        this.element.setAttribute("tabindex", this.tabIndex);
        if (userDefinedSettings.closeWhenCursorOut === true) {
            this.element.addEventListener("mouseleave", function(e) {
                Facade.publish("OptionsMenu:hide");
            });
        }
        document.addEventListener("click", function(e) {
            Facade.publish("OptionsMenu:hide");
        });
        this.element.addEventListener("click", function(e) {
            e.stopPropagation();
        });
        this.element.addEventListener("keyup", onKeyUp.bind(this));
        this.element.addEventListener("keydown", onKeyDown.bind(this));

        var widgetSubWrapper = Facade.subscribe("WidgetSubWrapper", new SELECT.ELEMENTS.WIDGET.SubWrapper(Facade));
        var widgetSubWrapperElem = widgetSubWrapper.render();
        this.element.appendChild(widgetSubWrapperElem);

        var optionsMenu = Facade.subscribe("OptionsMenu", new SELECT.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu(Facade));
        var optionsMenuElem = optionsMenu.render();
        this.element.appendChild(optionsMenuElem);

        return this.element;
    }

    this.lock = function() {
        this.locked = true;
    }

    this.unLock = function() {
        this.locked = false;
    }

    this.enableTabNavigation = function() {
        this.element.setAttribute("tabindex", this.tabIndex);
    }

    function onKeyDown(e) {
        if (this.locked === true)
            return;
        switch(e.keyCode) {
            case KEY_CODES.UP:
            case KEY_CODES.DOWN:
                e.preventDefault();
                break;
        }
        return false;
    }

    function onKeyUp(e) {
        if (this.locked === true)
            return false;
        switch(e.keyCode) {
            case KEY_CODES.UP:
                Facade.publish("OptionsMenuList").hoverPreviousOption();
                break;
            case KEY_CODES.DOWN:
                Facade.publish("OptionsMenuList").hoverNextOption();
                break;
            case KEY_CODES.ENTER:
                Facade.publish("OptionsMenuList").selectHoveredOption();
                break;
            default:
                var firstChar = String.fromCharCode(e.which)[0].toLowerCase();
                Facade.publish("OptionsMenuList").searchByFirstChar(firstChar);
        }
    }

    function onMouseLeave(e) {
        Facade.publish("OptionsMenu:hide");
    }

    this.setTabIndex = function(tabIndex) {
        this.tabIndex = tabIndex;
        this.element.setAttribute("tabindex", tabIndex);
    }

};

SELECT.ELEMENTS.WIDGET.Wrapper.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.ELEMENTS.Wrapper = function(Facade) {

    var userDefinedSettings = Facade.publish("UserDefinedSettings");

    var that = this;

    this.type = "div";

    this.className = userDefinedSettings.theme || "default";

    this.width = userDefinedSettings.width;

    this.widgetWrapper;

    this.element;

    this.el = userDefinedSettings.el;

    this.loadingMode = false;

    this.render = function() {
        this.element = SELECT.UTILS.createElement(this.type, this.className);
        var tagName = this.el.tagName.toLowerCase();
        switch(tagName) {
            case ALLOWED_TARGET_ELEMENT_TAG_NAME_SELECT:
                var parentsParent = this.el.parentNode;
                var instance = new SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBox(Facade, this.el);
                Facade.subscribe("NativeSelectBox", instance).attach();
                if (instance.isDisabled())
                    this.disable();
                parentsParent.insertBefore(this.element, this.el);
                this.element.appendChild(this.el);
                var nativeSelectBoxWrapper = new SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxWrapper(Facade);
                var nativeSelectBoxWrapperEl = nativeSelectBoxWrapper.render();
                this.el.parentNode.replaceChild(nativeSelectBoxWrapperEl, this.el);
                nativeSelectBoxWrapperEl.appendChild(this.el);
                this.element.appendChild(nativeSelectBoxWrapperEl);
                break;
            default:
                throw new SELECT.EXCEPTIONS.InvalidTargetElementErrorException();
        }
        renderWidget();
        if (this.width !== undefined) {
            this.setWidth(this.width);
            if (userDefinedSettings.optionMenuWidth === undefined)
                Facade.publish("OptionsMenu").setWidth(this.width);
        }
        else {
            var width = Facade.publish("OptionsMenu").getWidth();
            this.setWidth(width);
        }
        return this.element;
    }

    function renderWidget() {
        var widgetWrapperInstance = Facade.subscribe("WidgetWrapper", new SELECT.ELEMENTS.WIDGET.Wrapper(Facade));
        var widgetWrapperElem = widgetWrapperInstance.render();
        that.element.appendChild(widgetWrapperElem);
        Facade.publish("OptionsMenu").hide();
    }

    this.getWidth = function() {
        return this.width;
    }

    this.toggleLoadingMode = function() {
        if (this.loadingMode === false)
            this.enableLoadingMode();
        else
            this.disableLoadingMode();
    }

    this.enableLoadingMode = function() {
        this.loadingMode = true;
        Facade.publish("OptionsMenu:lock");
        Facade.publish("ValueContainer:enableLoadingMode");
        Facade.publish("WidgetWrapper:lock");
        Facade.publish("WidgetSubWrapper:lock");
        Facade.publish("ValueContainerImage:hide");
    }

    this.disableLoadingMode = function() {
        this.loadingMode = false;
        Facade.publish("OptionsMenu:unLock");
        Facade.publish("ValueContainer:disableLoadingMode");
        Facade.publish("WidgetWrapper:unLock");
        Facade.publish("WidgetSubWrapper:unLock");
        Facade.publish("ValueContainerImage:show");
    }

    this.show = function() {
        this.element.show();
    }

    this.hide = function() {
        this.element.hide();
    }

    this.enable = function() {
        this.element.removeAttribute("disabled");
        Facade.publish("WidgetWrapper:unLock");
        Facade.publish("WidgetSubWrapper:unLock");
        Facade.publish("OptionsMenu:unLock");
        Facade.publish("WidgetWrapper:enableTabNavigation");
    }

    this.disable = function() {
        this.element.setAttribute("disabled", true);
        Facade.publish("WidgetWrapper:lock");
        Facade.publish("WidgetSubWrapper:lock");
        Facade.publish("OptionsMenu:lock");
        Facade.publish("WidgetWrapper:disableTabNavigation");
    }

    this.setWidth = function(width) {
        this.width = width;
        this.element.setStyle("width", this.width);
    }

    this.detach = function() {
        Facade.publish("NativeSelectBox:detach");
        var parent = this.element.parentNode;
        parent.insertBefore(this.el, this.element);
        this.element.remove();
    }
};
SELECT.ELEMENTS.Wrapper.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);SELECT.EXCEPTIONS.InvalidOptionsErrorException = function() {
	return {
		name:        "Invalid options object", 
	    level:       "Show Stopper", 
	    message:     "options should be in object form with required key-value pairs. See the required key-value pairs from " + SELECT.CONFIG.CONSTRUCTOR_PARAMS_URL,  
	    htmlMessage: "Error detected",
	    toString:    function(){return this.name + ": " + this.message;} 
	}
};SELECT.EXCEPTIONS.InvalidTargetElementErrorException = function() {
	return {
		name:        "Invalid target element", 
	    level:       "Show Stopper", 
	    message:     "el should be <select> or <input type='select'>",  
	    htmlMessage: "Error detected",
	    toString:    function(){return this.name + ": " + this.message;} 
	}
};SELECT.Facade = function() {
	this.subscribe = function(name, instance) {
		this[name] = instance;
		return instance;
	}

	this.publish = function(name, args) {
		var parts = name.split(":");
		if (parts.length > 1) {
			var instance = this[parts[0]];
			if (instance !== undefined) {
				var func = instance[parts[1]];
				if (typeof func === "function")
					return func.call(instance, args);
			}
		}
		return this[name];
	}
};SELECT.HELPERS.getOptionByValue = function(options, value) {
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		if (option.value == value)
			return option;
	}
};Element.prototype.setStyle = function(name, value) {
  if (typeof value === "number") {
    value += "px";
  }
  if (this !== undefined)
    this.style[name] = value;
};

Element.prototype.getNextSibling = function() {
  return this.nextSibling;
};

Element.prototype.removeChildren = function() {
  this.innerHTML = "";
};

Element.prototype.getChildren = function() {
  return this.childNodes;
};

Element.prototype.setSelectedAttribute = function() {
  this.setAttribute("selected", true);
};

Element.prototype.removeStyle = function(name) {
  this.style[name] = null;
};

Element.prototype.remove = function() {
  var parent = this.parentNode;
  parent.removeChild(this);
};

Element.prototype.getStyle = function(name) {
  return this.style[name];
};

Element.prototype.hasClass = function(name) {
  var result = this.className.match(new RegExp('(\\s|^)' + name + '(\\s|$)'));
  if (result === null)
    return false;
  return result;
};

Element.prototype.addClass = function(name) {
  if (this.hasClass(name) === false)
   this.className += " " + name;
};

Element.prototype.clearClasses = function() {
  this.className = "";
};

Element.prototype.setDataAttribute = function(name, value) {
  this.setAttribute("data-" + name, value);
};

Element.prototype.getDataAttribute = function(name) {
  return this.getAttribute("data-" + name);
};

Element.prototype.removeDataAttribute = function(name) {
  this.removeAttribute("data-" + name);
};

Element.prototype.isHidden = function() {
  return (this.style.display === "none") ? true : false;
};

Element.prototype.show = function() {
  this.style.display = "block";
};

Element.prototype.hide = function() {
  this.style.display = "none";
};

Element.prototype.empty = function() {
  this.innerHTML = "";
};

Element.prototype.setClass = function(name) {
  this.className = name;
};

Element.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
    for (var i in this) {
      if (i == 'clone') 
        continue;
      if (this[i] && typeof this[i] == "object")
          newObj[i] = this[i].clone();
      else 
        newObj[i] = this[i];
    } 
    return newObj;
};

Element.prototype.removeClass = function(className) {
    var newClassName = "";
    var i;
    var classes = this.className.split(" ");
    for(i = 0; i < classes.length; i++) {
        if(classes[i] !== className) {
            newClassName += classes[i] + " ";
        }
    }
    this.className = newClassName;
};
Element.prototype.appendFirst = function(childNode){
    if (this.firstChild)
      this.insertBefore(childNode,this.firstChild);
    else 
      this.appendChild(childNode);
};
Element.prototype.isDisabled = function() {
    return (this.getAttribute("disabled") === null) ? false : true;
};SELECT.UTILS.createElement = function(type, classes) {
	var elem = document.createElement(type);
	if (typeof classes === "string")
		elem.setClass(classes);
	return elem;
};

SELECT.UTILS.isElement = function(o) {
	//Returns true if it is a DOM element    
  	return (
    	typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2 
    	o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
	);
};

SELECT.UTILS.triggerEvent = function(type, targetElem) {
	var e;
	if(typeof(document.createEvent) != 'undefined') {
	    e = document.createEvent('HTMLEvents');
	    e.initEvent(type, true, true);
	    targetElem.dispatchEvent(e);
	} else if(typeof(document.createEventObject) != 'undefined') {
	    try {
	        e = document.createEventObject();
	        targetElem.fireEvent('on' + type.toLowerCase(), e);
	    } catch(err){ }
	}
};

SELECT.UTILS.isEmpty = function(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};}(jQuery || {}));