this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.integration = this.navigatorjs.integration || {};

(function() {
	var _usingPushState,
		_rootUrl,
		_navigator,
		_started;

	var StateUrlSyncer = function(navigator) {
		navigatorjs.utils.AutoBind(this, this);

		_usingPushState = false;
		_rootUrl = '/';
		_navigator = navigator;
		_started = false;
	};


	StateUrlSyncer.prototype = {
		supportsPushState: !!(window && window.history && window.history.pushState),

		usePushState: function(rootUrl) {
			if(_started) {
				throw new Error("Cannot switch to using push states after start was called");
				return;
			}

			_usingPushState = this.supportsPushState;
			_rootUrl = rootUrl || _rootUrl;
		},

		isUsingPushState: function() {
			return _usingPushState;
		},

		start: function() {
			if(_started) {
				throw new Error("Already started");
				return;
			}

			_started = true;
			this._addListeners();
		},

		_addListeners: function() {
			if (_usingPushState) {
				$(window).on('popstate', this._onUrlChange);
			} else {
				$(window).on('hashchange', this._onUrlChange);
			}

			var STATE_CHANGED = navigatorjs.NavigatorEvent.STATE_CHANGED;

			_navigator.on(STATE_CHANGED, this._onStateChanged);
		},

		_removeListeners: function() {
			$(window).off('popstate', this._onUrlChange);
			$(window).off('hashchange', this._onUrlChange);
		},

		setUrl: function(url) {
			var newState,
				urlState = this.getUrlState();
			if (_usingPushState) {
				newState = new navigatorjs.NavigationState(_rootUrl + url);
				if(newState.equals(urlState)) {
					window.history.replaceState(null, '', newState.getPath());
				} else {
					window.history.pushState(null, '', newState.getPath());
				}
			} else {
				newState = new navigatorjs.NavigationState(url);
				if(!newState.equals(urlState)) {
					window.location.hash = newState.getPath();
				}
			}
		},

		getRawUrl: function() {
			if (_usingPushState) {
				return this.parsePushStateUrl(window.location.pathname);
			} else {
				return this.parseHashUrl(window.location.hash);
			}
		},

		getUrlState: function() {
			return new navigatorjs.NavigationState(this.getRawUrl());
		},

		_onStateChanged: function() {
			this.setUrl(_navigator.getCurrentState().getPath());
		},

		_onUrlChange: function() {
			_navigator.request(this.getUrlState());
		},

		resetUrl: function() {
			this.setUrl('');
		},

		parseHashUrl: function(hashUrl) {
			return hashUrl.replace(/^#|$/g, '');
		},

		parsePushStateUrl: function(pushStateUrl) {
			return pushStateUrl.replace(_rootUrl, '');
		},

		dispose: function() {
			this._removeListeners();
		}


	};

	navigatorjs.integration.StateUrlSyncer = StateUrlSyncer;

})();