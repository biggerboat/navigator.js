this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.integration = this.navigatorjs.integration||{};

(function() {

	var ViewRecipe = function () {
		this._states = [];
	};

	//PUBLIC API
	ViewRecipe.prototype = {



		toView: function(View) {

		},

		mapState: function(navigationState) {
//			console.log('ViewRecipe -> mapState', navigationState.getPath());
			
			var index, existingState, length = this._states.length;

			for(index=0; index<length; index++) {
				existingState = this._states[index];

				if(existingState.getPath() == navigationState.getPath()) {
					return;
				}
			}

//			console.log('ViewRecipe -> mapState states', this._states);
			this._states.push(navigationState);
		},

		getStates: function() {
			return this._states;
		}
	};

	navigatorjs.integration.ViewRecipe = ViewRecipe;

}());