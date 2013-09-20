this.navigatorjs = this.navigatorjs || {};

(function() {
	var AsynchResponders = function() {
		this._responders = [];
	};

	//PUBLIC API
	AsynchResponders.prototype = {
		getLength: function() {
			return this._responders.length;
		},

		isBusy: function() {
			return this.getLength() > 0;
		},

		hasResponder: function(responder) {
			return this._responders.indexOf(responder) != -1;
		},

		addResponder: function(responder) {
			this._responders.push(responder);
		},

		addResponders: function(additionalRespondersArray) {
			if (additionalRespondersArray && additionalRespondersArray instanceof Array && additionalRespondersArray.length) {
				this._responders = this._responders.concat(additionalRespondersArray);
			}
		},

		takeOutResponder: function(responder) {
			var index = this._responders.indexOf(responder);
			if (index != -1) {
				this._responders.splice(index, 1);
				return true;
			}

			return false;
		},

		reset: function() {
			if (this._responders.length > 0) {
				//logger.warn("Resetting too early? Still have responders marked for asynchronous tasks");
			}

			this._responders = [];
		}
	};

	navigatorjs.AsynchResponders = AsynchResponders;
}());