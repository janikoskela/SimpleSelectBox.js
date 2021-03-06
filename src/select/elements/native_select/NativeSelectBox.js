SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBox = function(Sandbox, el) {
	var that = this;
	var userDefinedSettings = Sandbox.publish("UserDefinedSettings");
	var dataAttrPrefix = "selectjs";
	this.optionItems = [];
	this.observer;
	this.element = el;
	this.usePolling = userDefinedSettings.usePolling || false;
	this.pollingInterval = userDefinedSettings.pollingInterval || 100;
	this.useMutationObserver = (userDefinedSettings.useMutationObserver === undefined) ? true : userDefinedSettings.useMutationObserver;
	this.isElemHidden;
	this.isElemDisabled;
	this.optionsCount;
	this.loadingMode;
	this.mutationObserverReplacement;

	this.attach = function() {
		this.optionItems = [];
		var optionsLength = this.element.options.length;
		this.optionsCount = optionsLength;
		for (var i = 0; i < optionsLength; i++) {
			var option = this.element.options[i];
			var optionItem = new SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBoxItem(Sandbox, option);
			this.optionItems.push(optionItem);
		}
		if (this.usePolling) {
			this.poller = setInterval(this.observeForChanges.bind(this), this.pollingInterval);
			this.isElemHidden = this.isHidden();
			this.isElemDisabled = this.isDisabled();
		}
		else if (MUTATION_OBSERVER !== undefined && this.observer === undefined && this.useMutationObserver) {
			attachDomObserver();
			this.isElemHidden = this.isHidden();
			this.isElemDisabled = this.isDisabled();
		}
		else if (MUTATION_OBSERVER === undefined && this.useMutationObserver) {
			this.mutationObserverReplacement = setInterval(this.observeForOptionMutations.bind(this), this.pollingInterval);
			this.isElemHidden = this.isHidden();
			this.isElemDisabled = this.isDisabled();
		}
		if (Sandbox.publish("Wrapper").responsiveFallback > 0 || Sandbox.publish("Wrapper").responsiveFallback == true)
			this.attachOnChangeEventListener(onChange.bind(this));
		return this.element;
	}

	function onChange(e) {
		Sandbox.publish("ValueContainer:refresh");
	}

	this.open = function() {
        setTimeout(function() {
            var event = document.createEvent("MouseEvents");
            event.initEvent("mousedown", true, true);
            that.element.dispatchEvent(event);
        });
	}

	this.detach = function() {
		this.observer = undefined;
		if (this.poller !== undefined)
			clearInterval(this.poller);
		if (this.mutationObserverReplacement !== undefined)
			clearInterval(this.mutationObserverReplacement);
		var tabIndex = Sandbox.publish("Wrapper:getTabIndex");
		if (!SELECT.UTILS.isEmpty(tabIndex))
			this.element.setAttribute("tabindex", tabIndex);
		if (this.observer)
			this.observer.disconnect();
	}

	this.triggerFocus = function() {
		SELECT.UTILS.triggerEvent("focus", this.element);
	}

	this.setValue = function(value) {
		this.element.value = value;
	}

	this.observeForOptionMutations = function() {
		var optionsCount = this.element.options.length;
		if (optionsCount !== this.optionsCount) {
			this.optionsCount = optionsCount;
			this.attach();
			Sandbox.publish("OptionsMenuList:refresh");
		}
	}

	this.observeForChanges = function() {
		if (SELECT.UTILS.isEmpty(this.element) && !SELECT.UTILS.isElement(this.element))
			Sandbox.publish("Wrapper:remove");
		var isHidden = this.element.isHidden();
		if (isHidden !== this.isElemHidden) {
			this.isElemHidden = isHidden;
			if (isHidden)
				Sandbox.publish("Wrapper:hide");
			else
				Sandbox.publish("Wrapper:show");
		}
		var isDisabled = this.isDisabled();
		if (isDisabled !== this.isElemDisabled) {
			this.isElemDisabled = isDisabled;
			if (isDisabled)
				Sandbox.publish("Wrapper:disable");
			else
				Sandbox.publish("Wrapper:enable");
		}
		this.observeForOptionMutations();
		var theme = this.getPrefixedDataAttribute("theme");
		if (!SELECT.UTILS.isEmpty(theme) && theme != Sandbox.publish("Wrapper:getTheme"))
			Sandbox.publish("Wrapper:setTheme", theme);
		var loading = this.getPrefixedDataAttribute("loading-mode");
		if (!SELECT.UTILS.isEmpty(loading)) {
			loading = (loading == "true");
			if (this.loadingMode != loading) {
				this.loadingMode = loading;
				if (loading) {
					Sandbox.publish("Wrapper:enableLoadingMode");
				}
				else {
					Sandbox.publish("Wrapper:disableLoadingMode");
				}
			}
		}
		if (SELECT.UTILS.isElement(userDefinedSettings.appendOptionMenuTo)) 
			Sandbox.publish("WidgetWrapper:refresh");
		var currentValue = this.getSelectedOptionValue();
		if (currentValue !== this.currentValue) {
			this.currentValue = currentValue;
			Sandbox.publish("ValueContainer:refresh");
		}
	}

	this.getOptions = function() {
		return this.optionItems;
	}

	function attachDomObserver() {
		that.observer = new MUTATION_OBSERVER(function(mutations, observer) {
			if (mutations.length > 0) {
				that.attach();
				that.observeForChanges();
			}
		});
		var config = { 
			attributes: true
		};
		that.observer.observe(that.element, config);
	}

	this.setSelectedOption = function(value) {
		this.element.value = value;
		return this;
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
		return this.element.options[this.element.selectedIndex];
	}

	this.getPrefixedDataAttribute = function(name) {
		return this.element.getDataAttribute(dataAttrPrefix + "-" + name);
	}

};

SELECT.ELEMENTS.NATIVE_SELECT.NativeSelectBox.prototype = Object.create(SELECT.ELEMENTS.Element.prototype);