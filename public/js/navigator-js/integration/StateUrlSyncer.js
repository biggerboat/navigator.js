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
			this._addListeners();
//			this._onUrlChange();
		},

		_addListeners: function() {
			if (_usingPushState) {
				console.log('StateUrlSyncer -> _addListeners pushState');
				$(window).on('popstate', this._onUrlChange);
			} else {
				console.log('StateUrlSyncer -> _addListeners hashChange');
				$(window).on('hashchange', this._onUrlChange);
			}

			var STATE_CHANGED = navigatorjs.NavigatorEvent.STATE_CHANGED;

			_navigator.on(STATE_CHANGED, this._onStateChanged);
		},

		_removeListeners: function() {
			console.log('StateUrlSyncer -> _removeListeners');
			$(window).off('popstate', this._onUrlChange);
			$(window).off('hashchange', this._onUrlChange);
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

		_onStateChanged: function() {
			console.log('StateUrlSyncer -> _onStateChanged', _navigator.getCurrentState().getPath());
			this.setUrl(_navigator.getCurrentState().getPath());
		},

		_onUrlChange: function() {
			console.log('StateUrlSyncer -> _onUrlChange', this.getUrl());
			_navigator.request(this.getUrl());
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