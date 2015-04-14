SELECT.UTILS.createElement = function(type, classes) {
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

SELECT.UTILS.isDescendant = function(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent)
             return true;
        node = node.parentNode;
    }
    return false;
}

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
};

SELECT.UTILS.getElementPosition = function(elem) {
	var isIE = navigator.appName.indexOf('Microsoft Internet Explorer') != -1;
    var currentOffsetLeft = 0;
    var currentOffsetTop = 0;
    var currentOffsetTopscroll = 0;
    var currentOffsetLeftscroll = 0;
    var offsetX = isIE ? document.body.scrollLeft : window.pageXOffset;
    var offsetY = isIE ? document.body.scrollTop : window.pageYOffset;

    if (elem.offsetParent) {
        currentOffsetLeft = elem.offsetLeft;
        currentOffsetTop = elem.offsetTop;
        var elScroll = elem;
        while (elScroll = elScroll.parentNode) {
            currentOffsetTopscroll = elScroll.scrollTop ? elScroll.scrollTop : 0;
            currentOffsetLeftscroll = elScroll.scrollLeft ? elScroll.scrollLeft : 0;
            currentOffsetLeft -= currentOffsetLeftscroll;
            currentOffsetTop -= currentOffsetTopscroll;
        }
        while (elem = elem.offsetParent) {
            currentOffsetLeft += elem.offsetLeft;
            currentOffsetTop += elem.offsetTop;
        }
    }
    return { top: currentOffsetTop + offsetY, left: currentOffsetLeft + offsetX };
}

SELECT.UTILS.extractDelta = function(e) {
    if (e.wheelDelta) {
        return e.wheelDelta;
    }
    if (e.detail)
    	return -e.detail * 40;
    if (e.originalEvent !== undefined) {
	    if (e.originalEvent.detail) {
	        return e.originalEvent.detail * -40;
	    }

	    if (e.originalEvent && e.originalEvent.wheelDelta) {
	        return e.originalEvent.wheelDelta;
	    }
	}
	return 0;
};