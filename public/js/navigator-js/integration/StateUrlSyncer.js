this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.integration = this.navigatorjs.integration || {};

(function() {

	var _usingPushState,
		_rootUrl,
		_navigator,
		_started;

	var StateUrlSyncer = function(navigator) {
		_usingPushState = false;
		_rootUrl = '/';
		_navigator = navigator;
		_started = false;
	};

	var _startListeningForUrlChanges = function() {
		if (_usingPushState) {
			$(window).on('popstate', _onUrlChange);
		} else {
			$(window).on('hashchange', _onUrlChange);
		}
	};

	var _stopListeningForUrlChanges = function() {
		$(window).off('popstate', _onUrlChange);
		$(window).off('hashchange', _onUrlChange);
	};

	var _onUrlChange = function() {

	};

	StateUrlSyncer.prototype = {
		supportsPushState: !!(window && window.history && window.history.pushState),

		usePushState: function(rootUrl) {
			if(_started) {
				throw new Error("Cannot switch to using push states after start was called");
				return;
			}

			_usingPushState = this.supportsPushState;
			_rootUrl = rootUrl;
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
			_startListeningForUrlChanges();
			_onUrlChange();
		},

		setUrl: function(url) {
			if (_usingPushState) {
				console.log(_rootUrl, url);
				window.history.pushState(null, '', _rootUrl + url);
			} else {
				window.location.hash = url;
			}
		},

		getUrl: function() {
			if (_usingPushState) {
				return this.parsePushStateUrl(window.location.pathname);
			} else {
				return this.parseHashUrl(window.location.hash);
			}
		},

		resetUrl: function() {
			this.setUrl('');
		},

		parseHashUrl: function(hashUrl) {
			return hashUrl.replace(/^#|$/g, '');
		},

		parsePushStateUrl: function(pushStateUrl) {
			return pushStateUrl.replace(_rootUrl, '');
		}

	};

	navigatorjs.integration.StateUrlSyncer = StateUrlSyncer;

})();