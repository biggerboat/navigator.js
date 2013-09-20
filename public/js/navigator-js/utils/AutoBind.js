this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.utils = this.navigatorjs.utils || {};

this.navigatorjs.utils.AutoBind = function(object, context) {
	var key, method;
	for (key in object) {
		method = object[key];
		if (typeof method === 'function') {
			object[key] = $.proxy(object[key], context);
		}
	}
};