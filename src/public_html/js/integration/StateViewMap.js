this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.integration = this.navigatorjs.integration||{};

(function() {
	var _navigator = null;
	var _orderedRecipes = null;
	var _contextView = null;


	var StateViewMap = function (navigator) {
		_navigator = navigator;
		_orderedRecipes = [];
		_contextView = $('body');


		_navigator.on(navigatorjs.NavigatorEvent.STATE_REQUESTED, _handleStateRequested);

	};

	function _addRecipe(statesOrPaths) {
		var recipe = new navigatorjs.integration.ViewRecipe();

		var index, length = statesOrPaths.length;
		for(index = 0; index<length; index++) {
			recipe.addState(navigatorjs.NavigationState.make(statesOrPaths[index]));
		}

		_orderedRecipes.push(recipe);

		return recipe;
	}

	function _handleStateRequested(e, eventData) {
		var requestedState = eventData.state,
			recipesIndex, recipe, recipeStates, recipesLength = _orderedRecipes.length,
			statesIndex, state, statesLength,
			viewInstance;

		for( recipesIndex = 0; recipesIndex < recipesLength; recipesIndex++ ) {
			recipe = _orderedRecipes[recipesIndex];
			recipeStates = recipe.getStates();
			statesLength = recipeStates.length;

			for( statesIndex= 0; statesIndex < statesLength; statesIndex++ ) {
				state = recipeStates[statesIndex];

				if( requestedState.contains( state ) ) {
					viewInstance = recipe.getViewInstance();

					if( viewInstance.navigatorBehaviors instanceof Array) {
						_addViewElementToDOM(recipe);
						_navigator.add( viewInstance, state);
					}
				}
			}
		}
	}

	function _addViewElementToDOM(recipe) {
		if( recipe.isInstantiated() && $.contains(document.documentElement, recipe.getViewInstance().$el) ) {
			return;
		//} else if( recipe.parent ) { //TODO: do a recursive parent recipe check here
		}

		var $container = _contextView;
		//TODO recursive parent stuff. and possibly render-order checking, like the depths in Flash

		$container.append( recipe.getViewInstance().$el );
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