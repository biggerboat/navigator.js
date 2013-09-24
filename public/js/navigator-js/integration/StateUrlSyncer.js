this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.integration = this.navigatorjs.integration || {};

(function() {

	var _usingPushState = false,
		_rootUrl = '/';

	var StateUrlSyncer = function() {
	};

	StateUrlSyncer.prototype = {
		supportsPushState: !!(window && window.history && window.history.pushState),

		usePushState: function(rootUrl) {
			_usingPushState = this.supportsPushState;
			_rootUrl = rootUrl;
		},

		isUsingPushState: function() {
			return _usingPushState;
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