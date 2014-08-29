(function () {

	Selex = function(userDefinedSettings) {

		var settings = new SELEX.SETTINGS.Settings(userDefinedSettings);
		var mediator = new SELEX.MEDIATOR.Mediator(settings);

		this.render = function() {
			mediator.render();
		}

		this.hide = function() {
			mediator.hide();
		}

		this.show = function() {
			mediator.show();
		}

		this.getSelectedText = function() {
			return mediator.getSelectedText();
		}

		this.getSelectedValue = function() {
			return mediator.getSelectedValue();
		}

		this.disable = function() {
			if (settings.isNativeSelectBoxToBeRendered() === true && settings.isNativeSelectBoxToBeDisplayed() === true)
				mediator.disableNative();
			else
				mediator.disableWidget();
		}

		this.enable = function() {
			if (settings.isNativeSelectBoxToBeRendered() === true && settings.isNativeSelectBoxToBeDisplayed() === true)
				mediator.enableNative();
			else
				mediator.enableWidget();
		}

		this.setOptions = function(options) {
			if (settings.isNativeSelectBoxToBeRendered() === true)
				mediator.createNativeOptionElements(options);
			if (settings.isNativeSelectBoxToBeDisplayed() === false)
				mediator.createOptionElements(options);
		}

	}
	var SEARCH_MODES = {};
	SEARCH_MODES.BY_FIRST_KEY = "firstKey";
	var KEY_CODES = {};
	KEY_CODES.UP = 38;
	KEY_CODES.DOWN = 40;
	KEY_CODES.ENTER = 13;
	var SORT_TYPES = {};
	SORT_TYPES.ASC = "asc";
	SORT_TYPES.DESC = "desc";
	var SELEX = {};
	SELEX.UTILS = {};
	SELEX.SETTINGS = {};
	SELEX.MEDIATOR = {};
	SELEX.ELEMENTS = {};
	SELEX.ELEMENTS.WIDGET = {};
	SELEX.ELEMENTS.WIDGET.VALUE_CONTAINER = {};
	SELEX.ELEMENTS.WIDGET.ARROW_CONTAINER = {};
	SELEX.ELEMENTS.WIDGET.OPTIONS_MENU = {};

	SELEX.MEDIATOR.Mediator = function(settings) {

		this.settings = settings;
		this.selectedValue;
		this.selectedText;
		this.enabled = true;
		this.closeWhenCursorOut = true;

		this.wrapper;
		this.nativeSelectBox;
		this.customGuiWrapper;
		this.customGuiSubWrapper;
		this.valueContainer;
		this.valueContainerText;
		this.arrow;
		this.optionsMenu;
		this.arrowContainer;
		this.arrowContainerContent;

		this.render = function() {
			var ORIENTATION_RIGHT = "right";
			var ORIENTATION_LEFT = "left";
			var self = this;
			var rootElement = this.settings.getRootElement();
			var width = this.settings.getWidth();
			var displayNativeSelectBox = this.settings.isNativeSelectBoxToBeDisplayed();
			var renderNativeSelectBox = this.settings.isNativeSelectBoxToBeRendered();
			var onOptionChange = this.settings.getOnOptionChange();
			var tabIndex = this.settings.getTabIndex();
			var options = this.settings.getOptions();
			var defaultValue = this.settings.getDefaultValue();
			var optionLimit = this.settings.getOptionLimit();
			var wrapperElement;
			var customGuiWrapperElement;
			var customGuiSubWrapperElement;
			var arrowContainerElement;
			var valueContainerElement;
			var defaultOption;
			var valueContainerTextElement;
			var optionsMenuElement;
			var nativeSelectBoxElement;
			var theme = this.settings.getTheme();
			var fontSize = this.settings.getFontSize();
			var fontFamily = this.settings.getFontFamily();
			var orientation = this.settings.getOrientation();
			var placeholder = this.settings.getPlaceholder();
			var sortType = this.settings.getSort();
			var optionsMenuWidth = this.settings.getOptionMenuWidth();
			var closeWhenCursorOut = this.settings.getCloseWhenCursorOut();
			if (typeof closeWhenCursorOut === "boolean")
				this.closeWhenCursorOut = closeWhenCursorOut;

			if (sortType !== undefined) {
				switch(sortType) {
					case SORT_TYPES.DESC:
						options.sort(sortByDesc);
						break;
					case SORT_TYPES.ASC:
						options.sort(sortByAsc);
						break;
					default:
						throw Error("Unsupported sort type \"" + sortType + "\"");
				}		
			}

			rootElement.empty();

			wrapperElement = this.createWrapper(theme, fontSize, fontFamily);
			if (width !== undefined)
				this.wrapper.setWidth(width);
			rootElement.appendChild(wrapperElement);
			if (renderNativeSelectBox === true) {
				nativeSelectBoxElement = this.createNativeSelectBox();
				this.nativeSelectBox.setWidth(width);
				wrapperElement.appendChild(nativeSelectBoxElement);		
				if (defaultValue === undefined && placeholder !== undefined)
					this.nativeSelectBox.setPlaceholder(placeholder);
				else
					this.nativeSelectBox.setOption(defaultValue);
				this.createNativeOptionElements(options);
				this.nativeSelectBox.setFontSize(fontSize);
				if (displayNativeSelectBox === true) {
					this.nativeSelectBox.show();
					this.nativeSelectBox.setTabIndex(tabIndex);
				}
				else
					this.nativeSelectBox.hide();
			}

			if (renderNativeSelectBox === false || (displayNativeSelectBox === false && renderNativeSelectBox === true)) {

				customGuiWrapperElement = this.createCustomGuiWrapper();
				this.customGuiWrapper.setTabIndex(tabIndex);
				wrapperElement.appendChild(customGuiWrapperElement);


				customGuiSubWrapperElement = this.createCustomGuiSubWrapper();
				customGuiWrapperElement.appendChild(customGuiSubWrapperElement);

				arrowContainerElement = this.createArrowElement();
				valueContainerElement = this.createValueContainer();
				valueContainerTextElement = this.createValueContainerText();

				if (placeholder === undefined) {
					defaultOption = this.getDefaultOption(options, defaultValue);
					this.selectedText = defaultOption.text;
					this.selectedValue = defaultOption.value;
					this.valueContainerText.setText(this.selectedText);
					this.valueContainerText.setValue(this.selectedValue);
				}
				else
					this.valueContainerText.setPlaceholder(placeholder);

				switch (orientation) {
					case ORIENTATION_LEFT:
						customGuiSubWrapperElement.appendChild(arrowContainerElement);
						arrowContainerElement.setStyle("float", orientation);
						customGuiSubWrapperElement.appendChild(valueContainerElement);
						break;
					case ORIENTATION_RIGHT:
						customGuiSubWrapperElement.appendChild(valueContainerElement);
						customGuiSubWrapperElement.appendChild(arrowContainerElement);
						arrowContainerElement.setStyle("float", orientation);
						break;
					default:
						throw Error("Invalid orientation value \"" + orientation + "\"");

				}

				valueContainerElement.appendChild(valueContainerTextElement);

				optionsMenuElement = this.createOptionsMenu(optionLimit);
				customGuiWrapperElement.appendChild(optionsMenuElement);
				this.createOptionElements(options, defaultOption);
				if (width === undefined && options.length > 0) {
					width = this.getWidthBasedLongestOption();
					this.wrapper.setWidth(width);
				}
				if (optionsMenuWidth === undefined)
					this.optionsMenu.setWidth(width);
				else
					this.optionsMenu.setWidth(optionsMenuWidth);
			}
		}

		function sortByDesc(optionA, optionB) {
			var a = optionA.text;
			var b = optionB.text;
			if (a > b)
				return 1;
			if (a < b)
				return -1;
			return 0;
		}

		function sortByAsc(optionA, optionB) {
			var a = optionA.text;
			var b = optionB.text;		
			if (a > b)
				return -1;
			if (a < b)
				return 1;
			return 0;
		}

		this.disableWidget = function() {
			this.enabled = false;
			this.wrapper.disable();
		}	

		this.enableWidget = function() {
			this.enabled = true;
			this.wrapper.enable();
		}

		this.disableNative = function() {
			this.nativeSelectBox.disable();
		}

		this.enableNative = function() {
			this.nativeSelectBox.enable();
		}

		this.getSelectedValue = function() {
			return this.selectedValue;
		}

		this.getSelectedText = function() {
			return this.selectedText;
		}

		this.hide = function() {
			this.wrapper.hide();
		}

		this.show = function() {
			this.wrapper.show();
		}

		this.createCustomGuiSubWrapper = function() {
			var self = this;
			this.customGuiSubWrapper = new SELEX.ELEMENTS.WIDGET.SubWrapper(function() {
				if (self.enabled === true) {
					if (self.optionsMenu.hasChildren())
						self.arrowContainerContent.up();
					self.optionsMenu.toggleVisibility();
				}
			});
			return this.customGuiSubWrapper.render();
		}

		this.createCustomGuiWrapper = function() {
			this.customGuiWrapper = new SELEX.ELEMENTS.WIDGET.Wrapper(onFocusOut.bind(this), onKeyDown.bind(this), onKeyUp.bind(this), onKeyEnter.bind(this), onSearch.bind(this));
			return this.customGuiWrapper.render();
		}

		function onSearch(e) {
			var searchMode = this.settings.getSearchMode();
			switch(searchMode) {
				case undefined:
				case SEARCH_MODES.BY_FIRST_KEY:
					var firstChar = String.fromCharCode(e.which)[0].toLowerCase();
					this.searchByFirstChar(firstChar);
					break;
			}
		}

		this.searchByFirstChar = function(query) {
			var optionsMenuElem = this.optionsMenu.getElement();
			var listElements = this.optionsMenu.getListElements();
			var hovered = this.optionsMenu.getHoveredChild();
			if (hovered === undefined) {
				for (var i = 0; i < listElements.length; i++) {
					var li = listElements[i];
					var label = li.children[0].innerHTML.toLowerCase();

					if (label[0] === query) {

						this.optionsMenu.clearChildHovers();
						this.optionsMenu.setChildHovered(li);
						if (this.optionsMenu.isClosed()) 
							this.onOptionItemClick(li);
						else
							optionsMenuElem.scrollTop = li.offsetTop;
						return;
					}
				}
			}
			else {
				var counter = 0;
				var nextSibling = hovered.nextSibling;
				while (counter < listElements.length) {
					if (nextSibling === null)
						nextSibling = listElements[0];
					var nextSiblingText = nextSibling.children[0].innerHTML.toLowerCase();
					if (nextSiblingText[0] === query) {
						this.optionsMenu.clearChildHovers();
						this.optionsMenu.setChildHovered(nextSibling);
						if (this.optionsMenu.isClosed())
							this.onOptionItemClick(nextSibling);
						else
							optionsMenuElem.scrollTop = nextSibling.offsetTop;
						return;
					}
					nextSibling = nextSibling.nextSibling;
					counter++;
				}
			}
		}

		function onKeyEnter(e) {
			if (this.optionsMenu.isClosed() === false) {
				var hovered = this.optionsMenu.getHoveredChild();
				this.onOptionItemClick(hovered);
			}
		}

		function onFocusOut(e) {
			var focusedElem = document.activeElement;
			if (this.closeWhenCursorOut === true || !focusedElem.hasClass(this.customGuiWrapper.getClass())) {
				this.optionsMenu.close();
				this.arrowContainerContent.down();
			}
		}

		function onMouseOut(e) {
			this.optionsMenu.close();
			this.arrowContainerContent.down();			
		}

		function onKeyDown(e) {
			if (this.optionsMenu.isClosed())
				this.optionsMenu.open();
			var hovered = this.optionsMenu.getHoveredChild();
			this.optionsMenu.clearChildHovers();
			var optionsMenuElem = this.optionsMenu.getElement();
			var children = optionsMenuElem.children;
			if (children.length === 0)
				return;
			if (hovered === undefined) {
				hovered = children[0];
				this.optionsMenu.setChildHovered(hovered);
			}
			else {
				var index = parseInt(hovered.getAttribute("data-index"));
				if (children[index + 1] !== undefined) {
					hovered = children[index + 1];
					this.optionsMenu.setChildHovered(hovered);
				}
				else {
					hovered = children[0];
					this.optionsMenu.setChildHovered(hovered);
				}
			}
			optionsMenuElem.scrollTop = hovered.offsetTop;
			this.arrowContainerContent.up();			
		}

		function onKeyUp(e) {
			if (this.optionsMenu.isClosed())
				this.optionsMenu.open();
			var hovered = this.optionsMenu.getHoveredChild();
			this.optionsMenu.clearChildHovers();
			var optionsMenuElem = this.optionsMenu.getElement();
			var children = optionsMenuElem.children;
			if (children.length === 0)
				return;
			if (hovered === undefined) {
				hovered = children[children.length - 1];
				this.optionsMenu.setChildHovered(hovered);
			}
			else {
				var index = parseInt(hovered.getAttribute("data-index"));
				if (children[index - 1] !== undefined) {
					hovered = children[index - 1];
					this.optionsMenu.setChildHovered(hovered);
				}
				else {
					hovered = children[children.length - 1];
					this.optionsMenu.setChildHovered(hovered);
				}
			}
			optionsMenuElem.scrollTop = hovered.offsetTop;
			this.arrowContainerContent.up();			
		}

		this.createWrapper = function(theme, fontSize, fontFamily, tabIndex) {
			this.wrapper = new SELEX.ELEMENTS.Wrapper(theme, fontSize, fontFamily, tabIndex);
			return this.wrapper.render();
		}

		this.createOptionsMenu = function(optionLimit) {
			this.optionsMenu = new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu(optionLimit);
			return this.optionsMenu.render();
		}

		this.createNativeSelectBox = function() {
			this.nativeSelectBox = new SELEX.ELEMENTS.NativeSelectBox(this.onNativeOptionItemClick.bind(this));
			return this.nativeSelectBox.render();
		}

		this.createValueContainerText = function() {
			this.valueContainerText = new SELEX.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerText();
			return this.valueContainerText.render();
		}

		this.createValueContainer = function() {
			this.valueContainer = new SELEX.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainer();
			return this.valueContainer.render();
		}

		this.createArrowElement = function() {
			var arrowContainerElement;
			var arrowContainerContentElement;
			this.arrowContainer = new SELEX.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainer();
			arrowContainerElement = this.arrowContainer.render();
			this.arrowContainerContent = new SELEX.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainerContent();
			arrowContainerContentElement = this.arrowContainerContent.render();
			arrowContainerElement.appendChild(arrowContainerContentElement);
			return arrowContainerElement;
		}

		this.getWidthBasedLongestOption = function() {
			this.optionsMenu.open();
			var children = this.optionsMenu.getElement().children;
			var longest = children[0].offsetWidth;
			for (var i = 1; i < children.length; i++) {
				var l = children[i].offsetWidth;
				if (l > longest)
					longest = l;
			}
			this.optionsMenu.close();
			longest += this.arrowContainer.getElement().offsetWidth;
			return longest + "px";
		}


		this.createOptionElements = function(options, defaultOption) {
			var self = this;
			var optionsMenuElement = this.optionsMenu.getElement();
			var onOptionChange = this.settings.getOnOptionChange();
			var optionLimit = this.settings.getOptionLimit();
			optionsMenuElement.empty();
			for (var i = 0; i < options.length; i++) {
				var value = options[i].value;
				var text = options[i].text;
				var elem = new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItem(value, text, this.onOptionItemClick.bind(this), i).render();
				if (defaultOption !== undefined) {
					if (defaultOption.value == value && defaultOption.text == text)
						elem.setClass("selected", true);
				}
				optionsMenuElement.appendChild(elem);
			}
		}

		this.onNativeOptionItemClick = function(value, text) {
			var onOptionChange = this.settings.getOnOptionChange();
			this.selectedValue = value;
			this.selectedText = text;
			if (typeof onOptionChange === "function")
				onOptionChange(this.selectedValue, this.selectedText);
		}

		this.onOptionItemClick = function(elem) {
			var value = elem.getAttribute("data-value");
			var text = elem.children[0].innerHTML;
			var onOptionChange = this.settings.getOnOptionChange();
			this.valueContainerText.setValue(value);
			this.valueContainerText.setText(text);
			this.optionsMenu.close();
			var previouslySelected = this.optionsMenu.getSelectedChild();
			if (previouslySelected !== undefined)
				previouslySelected.clearClasses();
			this.arrowContainerContent.down();
			this.selectedValue = value;
			this.selectedText = text;
			if (typeof onOptionChange === "function")
				onOptionChange(this.selectedValue, this.selectedText);
			this.optionsMenu.setChildSelected(elem);
		}

		this.createNativeOptionElements = function(options) {
			var nativeSelectBoxElement = this.nativeSelectBox.getElement();
			nativeSelectBoxElement.empty();
			for (var i = 0; i < options.length; i++) {
				var value = options[i].value;
				var text = options[i].text;
				var elem = new SELEX.ELEMENTS.NativeSelectBoxItem(value, text).render();
				nativeSelectBoxElement.appendChild(elem);
			}
		}

		this.getDefaultOption = function(options, defaultValue) {
			for (var i = 0; i < options.length; i++) {
				var option = options[i];
				var value = option.value;
				if (value == defaultValue)
					return option;
			}
			return options[0];
		}

	}

	SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItem = function(value, text, onMenuItemClick, index) {
		this.value = value;
		this.text = text;
		this.onMenuItemClick = onMenuItemClick;
		this.type = "li";
		this.element;
		this.child;
		this.index = index;

		this.render = function() {
			this.child = new SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemValue(this.text);
			var childElem = this.child.render();
	    	this.element = document.createElement(this.type);
	    	this.element.addEventListener("click", onClick.bind(this));
	    	this.element.addEventListener("mouseover", onMouseOver.bind(this));
	    	this.element.addEventListener("keyup", onKeyUp.bind(this));
	    	this.element.setAttribute("data-value", this.value);
	    	this.element.appendChild(childElem);
	    	this.element.setAttribute("data-index", this.index);
	    	return this.element;
		}

		function onKeyUp(e) {
			switch (e.keyCode) {
				case KEY_CODES.ENTER:
					onClick(e);
					break;
			}
		}

		this.getIndex = function() {
			return this.index;
		}

		function onMouseOver(e) {
			var siblings = this.element.parentNode.children;
			for (var i = 0; i < siblings.length; i++) {
				siblings[i].removeClass("hovered");
			}
			this.element.addClass("hovered");
		}

		function onClick(e) {
			if (typeof this.onMenuItemClick === "function")
				this.onMenuItemClick(this.element);
		}
	}

	SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenuItemValue = function(text) {
		this.text = text;
		this.type = "span";
		this.element;
		this.textNode;

		this.render = function() {
	    	this.element = document.createElement(this.type);
	    	this.textNode = document.createTextNode(this.text);
	    	this.element.appendChild(this.textNode);
	    	return this.element;
		}
	}

	SELEX.ELEMENTS.WIDGET.OPTIONS_MENU.OptionsMenu = function(optionLimit) {
		this.type = "ul";
		this.className = "options-container";
		this.element;
		this.width = undefined;
		this.height = undefined;
		this.optionLimit = optionLimit;

		this.render = function() {
	    	this.element = document.createElement(this.type);
	    	this.element.setClass(this.className);
	    	this.close();
	    	return this.element;
		}

		this.hasChildren = function() {
			return (this.element.children > 0);
		}

		this.getListElements = function() {
			return this.element.childNodes;
		}

		this.getSelectedChild = function() {
			var children = this.element.children;
			for (var key in children) {
				var child = children[key];
				if (typeof child === "object") {
					if (child.hasClass("selected"))
						return child;
				}
			}
		}

		this.getHoveredChild = function() {
			var children = this.element.children;
			for (var key in children) {
				var child = children[key];
				if (typeof child === "object") {
					if (child.hasClass("hovered"))
						return child;
				}
			}
		}

		this.clearChildHovers = function() {
			for (var i = 0; i < this.element.children.length; i++) {
				this.element.children[i].removeClass("hovered");
			}
		}

		this.setChildHovered = function(child) {
			child.addClass("hovered");
		}

		this.setChildSelected = function(child) {
			child.addClass("selected");
		}

		this.getElement = function() {
			return this.element;
		}

		this.setWidth = function(width) {
			this.width = width;
			this.element.setStyle("width", this.width);
		}

		this.setHeight = function(height) {
			this.height = height;
			this.element.setStyle("height", this.height);
		}

		this.close = function() {
			this.element.hide();
		}

		this.isClosed = function() {
			return this.element.isHidden();
		}

		this.open = function() {
			var children = this.element.children;
			if (children.length === 0)
				return;
			this.element.show();
			if (children.length > 0) {
				var h = children[0].offsetHeight;
				if (this.optionLimit === undefined || children.length < this.optionLimit)
					h *= children.length;
				else
					h *= this.optionLimit;
				h++; //so that element does not become scrollable in case visible options are not limited
				h += "px";
				if (this.optionLimit !== undefined)
					this.setHeight(h);
			}
		}

		this.toggleVisibility = function() {
			if (this.element.isHidden())
				this.open();
			else
				this.close();
		}
	}

	SELEX.ELEMENTS.WIDGET.SubWrapper = function(callback) {

	    this.type = "div";

	    this.className = "widget-sub-wrapper";

	    this.element;
	    this.callback = callback;

	    this.render = function() {
	    	this.element = document.createElement(this.type);
	    	this.element.setClass(this.className);
	    	this.element.addEventListener("click", onClick.bind(this));
	    	return this.element;
	    }

	    function onClick(e) {
	    	if (typeof this.callback === "function")
	    		this.callback();
	    }

	}


	SELEX.ELEMENTS.WIDGET.Wrapper = function(onMouseLeaveCallback, onKeyDownCallback, onKeyUpCallback, onKeyEnterCallback, onSearchCallback) {

	    this.type = "div";
	    this.onMouseLeaveCallback = onMouseLeaveCallback;

	    this.className = "widget-wrapper";

	    this.element;

	    this.tabIndex;

	    this.onKeyDownCallback = onKeyDownCallback;

	    this.onKeyUpCallback = onKeyUpCallback;

	    this.onKeyEnterCallback = onKeyEnterCallback;

	    this.onSearchCallback = onSearchCallback;

	    this.render = function() {
	    	this.element = document.createElement(this.type);
	    	this.element.setClass(this.className);
	    	this.element.addEventListener("mouseleave", onMouseLeave.bind(this));
	    	this.element.addEventListener("blur", onMouseLeave.bind(this));
	    	this.element.addEventListener("keyup", onKeyUp.bind(this));
	    	this.element.addEventListener("keydown", onKeyDown.bind(this));
	    	return this.element;
	    }

	    this.getClass = function() {
	    	return this.className;
	    }

	    function onKeyDown(e) {
	    	switch(e.keyCode) {
	    		case KEY_CODES.UP:
	    		case KEY_CODES.DOWN:
	    			e.preventDefault();
	    			break;
	    	}
	    	return false;
	    }

	    function onKeyUp(e) {
	    	switch(e.keyCode) {
	    		case KEY_CODES.UP:
	    			if (typeof this.onKeyUpCallback === "function")
	    				this.onKeyUpCallback(e);
	    			break;
	    		case KEY_CODES.DOWN:
	    			if (typeof this.onKeyDownCallback === "function")
	    				this.onKeyDownCallback(e);
	    			break;
	    		case KEY_CODES.ENTER:
	    			if (typeof this.onKeyEnterCallback === "function")
	    				this.onKeyEnterCallback(e);
	    			break;
	    		default:
	    			if (typeof this.onSearchCallback === "function")
	    				this.onSearchCallback(e);
	    	}
	    }

	    function onMouseLeave(e) {
	    	if (typeof this.onMouseLeaveCallback === "function")
	    		this.onMouseLeaveCallback();
	    }

	    this.setTabIndex = function(tabIndex) {
	    	this.tabIndex = tabIndex;
	    	this.element.setAttribute("tabindex", tabIndex);
	    }

	}

	SELEX.ELEMENTS.NativeSelectBox = function(changeCallback) {

		var self = this;
		this.type = "select";
		this.width = undefined;
		this.changeCallback = changeCallback;
		this.element = undefined;
		this.tabIndex = 0;
		this.fontSize = undefined;
		this.placeholder;

		this.setFontSize = function(fontSize) {
			this.fontSize = fontSize;
			this.element.setStyle("font-size", this.fontSize);
		}

		this.setPlaceholder = function(placeholder) {
			this.placeholder = placeholder;
			var placeholderInstance = new SELEX.ELEMENTS.NativeSelectBoxItem();
			var elem = placeholderInstance.render();
			placeholderInstance.setText(placeholder);
			elem.setAttribute("data-selected", true);
			elem.setAttribute("data-disabled", true);
			this.element.appendChild(elem);
		}

		this.render = function() {
			this.element = document.createElement(this.type);
			this.element.onchange = this.onOptionChange;
			return this.element;
		}

		this.enable = function() {
			this.element.removeAttribute("data-disabled");
		}

		this.disable = function() {
			this.element.setAttribute("data-disabled", true);
		}

		this.setTabIndex = function(tabIndex) {
			this.tabIndex = tabIndex;
			this.element.setAttribute("tabindex", this.tabIndex);
		}

		this.onOptionChange = function(e) {
			var value = e.target.selectedOptions[0].value;
			var text = e.target.selectedOptions[0].text;
			if (typeof self.changeCallback === "function") {
				self.changeCallback(value, text);
			}
		}

		this.setOption = function(value) {
			this.element.value = value;
		}

		this.getElement = function() {
			return this.element;
		}

		this.setWidth = function(width) {
			this.width = width;
			this.element.setStyle("width", this.width);
		}

		this.hide = function() {
			this.element.hide();
		}

		this.show = function() {
			this.element.show();
		}

	}

	SELEX.ELEMENTS.NativeSelectBoxItem = function(value, text) {
		this.element;
		this.type = "option";
		this.value = value;
		this.text = text;

		this.render = function() {
			this.element = document.createElement("option");
			if (this.text !== undefined)
				this.element.innerHTML = this.text;
			if (this.value !== undefined)
				this.element.setAttribute("data-value", this.value);
			return this.element;
		}

		this.setValue = function(value) {
			this.value = value;
			this.element.setAttribute("data-value", this.value);
		}

		this.setText = function(text) {
			this.text = text;
			this.element.innerHTML = this.text;
		}
	}

	SELEX.ELEMENTS.Wrapper = function(theme, fontSize, fontFamily) {

	    this.type = "div";

	    this.className = theme || "selex";

	    this.fontSize = fontSize || "12px";

	    this.fontFamily = fontFamily || "verdana";

	    this.width = undefined;

	    this.element;

	    this.render = function() {
	    	this.element = document.createElement(this.type);
	    	this.element.setClass(this.className);
	    	this.element.setStyle("fontSize", this.fontSize);
	    	this.element.setStyle("fontFamily", this.fontFamily);
	    	return this.element;
	    }

	    this.show = function() {
	    	this.element.show();
	    }

	    this.hide = function() {
	    	this.element.hide();
	    }

	    this.enable = function() {
	    	this.element.removeAttribute("data-disabled");
	    }

	    this.disable = function() {
	    	this.element.setAttribute("data-disabled", true);
	    }

	    this.setWidth = function(width) {
	    	this.width = width;
	    	this.element.setStyle("width", this.width);
	    }
	}

	SELEX.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainer = function() {

		this.type = "div";
		this.className = "value-container";
		this.element;

		this.render = function() {
			this.element = document.createElement(this.type);
	    	this.element.setClass(this.className);
			return this.element;
		}
	}

	SELEX.ELEMENTS.WIDGET.VALUE_CONTAINER.ValueContainerText = function() {

		this.value;
		this.text;
		this.type = "span";
		this.className = "value-container-text";
		this.element;
		this.placeholder;

		this.render = function() {
			this.element = document.createElement(this.type);
	    	this.element.setClass(this.className);
	    	this.element.innerHTML = this.text;
	    	this.element.setAttribute("data-value", this.value);
			return this.element;
		}

		this.setPlaceholder = function(placeholder) {
			this.placeholder = placeholder;
			this.element.innerHTML = this.placeholder;
		}

		this.setValue = function(value) {
			this.value = value;
			this.element.setAttribute("data-value", value);
		}

		this.setText = function(text) {
			this.text = text;
			this.element.innerHTML = text;
		}
	}

	SELEX.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainerContent = function() {

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

		this.getElement = function() {
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
	}

	SELEX.ELEMENTS.WIDGET.ARROW_CONTAINER.ArrowContainer = function() {

		this.type = "div";
		this.element;
		this.className = "arrow-container";

		this.render = function() {
			this.element = document.createElement(this.type);
			this.element.setClass(this.className);
			return this.element;
		}

		this.getElement = function() {
			return this.element;
		}
	}

	SELEX.SETTINGS.Settings = function(userDefinedSettings) {
		var options = userDefinedSettings.options || [];
		var rootElement = userDefinedSettings.targetElement;
		var defaultValue = userDefinedSettings.defaultValue;
		var orientation = userDefinedSettings.orientation || "right";
		var onOptionChange = userDefinedSettings.onOptionChange;
		var optionLimit = userDefinedSettings.optionLimit;
		var sort = userDefinedSettings.sort;
		var tabIndex = userDefinedSettings.tabIndex || 0;
		var height = userDefinedSettings.height;
		var width = userDefinedSettings.width;
		var fontSize = userDefinedSettings.fontSize;
		var theme = userDefinedSettings.theme || "default";
		var fontFamily = userDefinedSettings.fontFamily;
		var nativeSelectBoxRender = userDefinedSettings.renderNativeSelectBox || false;
		var nativeSelectBoxDisplay = userDefinedSettings.displayNativeSelectBox || false;
		var placeholder = userDefinedSettings.placeholder;
		var searchMode = userDefinedSettings.searchMode;
		var optionMenuWidth = userDefinedSettings.optionMenuWidth;
		var closeWhenCursorOut = userDefinedSettings.closeWhenCursorOut;

		this.getCloseWhenCursorOut = function() {
			return closeWhenCursorOut;
		}

		this.getOptionMenuWidth = function() {
			return optionMenuWidth;
		}

		this.getSearchMode = function() {
			return searchMode;
		}

		this.isNativeSelectBoxToBeRendered = function() {
			return nativeSelectBoxRender;
		}

		this.isNativeSelectBoxToBeDisplayed = function() {
			return nativeSelectBoxDisplay;
		}

		this.getFontFamily = function() {
			return fontFamily;
		}

		this.getTheme = function() {
			return theme;
		}

		this.getFontSize = function() {
			return fontSize;
		}

		this.getHeight = function() {
			return height;
		}

		this.getWidth = function() {
			return width;
		}

		this.getTabIndex = function() {
			return tabIndex;
		}

		this.getSort = function() {
			return sort;
		}

		this.getOptionLimit = function() {
			return optionLimit;
		}

		this.getOnOptionChange = function() {
			return onOptionChange;
		}

		this.getOrientation = function() {
			return orientation;
		}

		this.setOptions = function(optionsObj) {
			options = optionsObj;
		}

		this.getOptions = function() {
			return options.clone();
		}

		this.getRootElement = function() {
			return rootElement;
		}

		this.getDefaultValue = function() {
			return defaultValue;
		}

		this.getPlaceholder = function() {
			return placeholder;
		}
	}

	Object.prototype.removeClass = function(name) {
		if (this.hasClass(name)) {
            var reg = new RegExp('(\\s|^)'+name+'(\\s|$)');
            this.className = this.className.replace(reg,' ');
		}
	};

	Object.prototype.setStyle = function(name, value) {
		this.style[name] = value;
	};

	Object.prototype.addClass = function(name) {
		this.className += " " + name;
	};

	Object.prototype.clearClasses = function() {
		this.className = "";
	};

	Object.prototype.hasClass = function(name) {
		return this.className.match(new RegExp('(\\s|^)' + name + '(\\s|$)'));
	};

	Object.prototype.isHidden = function() {
		return (this.style.display === "none") ? true : false;
	};

	Object.prototype.show = function() {
		this.style.display = "block";
	};

	Object.prototype.hide = function() {
		this.style.display = "none";
	};

	Object.prototype.empty = function() {
		this.innerHTML = "";
	};

	Object.prototype.setClass = function(name) {
		this.className = name;
	};

	Object.prototype.clone = function() {
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


}());