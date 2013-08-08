this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.integration = this.navigatorjs.integration||{};

(function() {
	var _navigator = null;
	var _orderedRecipes = null;


	var StateViewMap = function (navigator) {
		_navigator = navigator;
		_orderedRecipes = [];
	};


	function _addRecipe(statesOrPaths) {
		var recipe = new navigatorjs.integration.ViewRecipe();
		_orderedRecipes.push(recipe);

		return recipe;
	}


	//PUBLIC API
	StateViewMap.prototype = {
		mapState: function(statesOrPaths) {
			console.log(this);
			return _addRecipe(statesOrPaths);
		}
	};

	navigatorjs.integration.StateViewMap = StateViewMap;

}());