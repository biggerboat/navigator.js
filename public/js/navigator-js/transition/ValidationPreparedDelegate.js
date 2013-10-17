this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.transition = this.navigatorjs.transition || {};

(function() {
	var ValidationPreparedDelegate = function(validatorResponder, truncatedState, fullState, navigator, validationNamespace) {
		this._validatorResponder = validatorResponder;
		this._truncatedState = truncatedState;
		this._fullState = fullState;
		this._navigator = navigator;
		this._validationNamespace = validationNamespace;
		navigatorjs.utils.AutoBind(this, this);
	};

	//PUBLIC API
	ValidationPreparedDelegate.prototype = {
		call: function() {
			this._validationNamespace.notifyValidationPrepared(this._validatorResponder, this._truncatedState, this._fullState);
			this._validatorResponder = null;
			this._truncatedState = null;
			this._fullState = null;
			this._navigator = null;
			this._validationNamespace = null;
		}
	};

	navigatorjs.transition.ValidationPreparedDelegate = ValidationPreparedDelegate;
}());