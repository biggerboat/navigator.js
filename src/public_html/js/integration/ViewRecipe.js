this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.integration = this.navigatorjs.integration||{};

(function() {

	var ViewRecipe = function () {
		this._states = [];
		this._viewClass = null;
		this._viewInstance = null;
	};

	//PUBLIC API
	ViewRecipe.prototype = {

		addState: function(navigationState) {
			var index, existingState, length = this._states.length;

			for(index=0; index<length; index++) {
				existingState = this._states[index];

				if(existingState.getPath() == navigationState.getPath()) {
					return;
				}
			}

			this._states.push(navigationState);

			return this;
		},

		getStates: function() {
			return this._states;
		},

		toView: function(viewClass) {
			this._viewClass = viewClass;

			return this;
		},

		getViewClass: function() {
			return this._viewClass;
		},

		getViewInstance: function() {
			if( !this.isInstantiated() ) {
				this._viewInstance = new this._viewClass();
			}
			return this._viewInstance;
		},

		isInstantiated: function() {
			return this._viewInstance != null;
		}
	};

	navigatorjs.integration.ViewRecipe = ViewRecipe;

}());