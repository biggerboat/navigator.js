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

		var index, length = statesOrPaths.length;
		for(index = 0; index<length; index++) {
			recipe.mapState(navigatorjs.NavigationState.make(statesOrPaths[index]));
		}

		_orderedRecipes.push(recipe);

		return recipe;
	}


	//PUBLIC API
	StateViewMap.prototype = {
		mapState: function(statesOrPaths) {
			var allArgumentsAsOneFlatArray = [];
			allArgumentsAsOneFlatArray = allArgumentsAsOneFlatArray.concat.apply(allArgumentsAsOneFlatArray, arguments);
			return _addRecipe(allArgumentsAsOneFlatArray);
		}
	};

	navigatorjs.integration.StateViewMap = StateViewMap;

}());