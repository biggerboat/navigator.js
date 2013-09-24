this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.utils = this.navigatorjs.utils || {};

this.navigatorjs.utils.Bind = function(functionOrArray, context) {
	var bind = function (method, context) {
		if (typeof method === 'function') {
			$.proxy(method, context);
		}
	}

	if (typeof functionOrArray === 'array') {
		var i, length = functionOrArray.length;
		for (i = 0; i < length; i++) {
			bind(functionOrArray[i], context);
		}

	} else {
		bind(functionOrArray, context);
	}

};