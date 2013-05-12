this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.transition = this.navigatorjs.transition||{};

(function() {
	var TransitionCompleteDelegate = function (responder, status, behavior, navigator, transitionNamespace) {
		this._responder = responder;
		this._status = status;
		this._behavior = behavior;
		this._navigator = navigator;
		this._transitionNamespace = transitionNamespace;
		this._called = false;
	};

	//PUBLIC API
	TransitionCompleteDelegate.prototype = {
		call: function() {
			if (this._called) { throw new Error("Illegal second call to transition complete. This instance is already prepared for garbage collection!"); }

			this._called = true;
			this._transitionNamespace.notifyComplete(_responder, this._status, this._behavior);
			this._responder = null;
			this._navigator = null;
			this._transitionNamespace = null;
		}
	};

	navigatorjs.transition.TransitionCompleteDelegate = TransitionCompleteDelegate;
}());