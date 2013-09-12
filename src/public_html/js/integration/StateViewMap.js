this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.integration = this.navigatorjs.integration||{};

(function() {
	var _navigator = null;
	var _orderedRecipes = null;
	var _$root = null;


	var StateViewMap = function (navigator, $root) {
		_navigator = navigator;
		_orderedRecipes = [];
		_$root = $root || $('body');

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
		}

		var parentRecipe = recipe.getParentRecipe(),
			$container = _$root,
			$inside,
			insideSelector = recipe.getInsideSelector();

		if(parentRecipe ) {
			if(!parentRecipe.isInstantiated()) {
				_addViewElementToDOM(parentRecipe);
			}

			$container = parentRecipe.getViewInstance().$el;
		}

		if( insideSelector != null) {
			$inside = $container.find(insideSelector);
			$container = $inside.length > 0 ? $inside.first() : $container;
		}

		var index = _orderedRecipes.indexOf(recipe) + 1,
			length = _orderedRecipes.length,
			testRecipe;
		for (index; index < length; index++) {
			testRecipe = _orderedRecipes[index];

			if (testRecipe.isInstantiated() && testRecipe.getViewInstance().$el.parent()[0] == $container[0]) {
				testRecipe.getViewInstance().$el.before( recipe.getViewInstance().$el );
				return;
			}
		}

		// otherwise add on top
		$container.append( recipe.getViewInstance().$el );
	}

	//PUBLIC API
	StateViewMap.prototype = {
		mapState: function(statesOrPaths) {
			var allArgumentsAsOneFlatArray = [];
			allArgumentsAsOneFlatArray = allArgumentsAsOneFlatArray.concat.apply(allArgumentsAsOneFlatArray, arguments);
			return _addRecipe(allArgumentsAsOneFlatArray);
		},

		get$Root: function() {
			return _$root;
		}
	};

	navigatorjs.integration.StateViewMap = StateViewMap;

}());