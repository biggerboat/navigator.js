this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.integration = this.navigatorjs.integration || {};

(function() {
	var _navigator = null;
	var _orderedRecipes = null;
	var _$root = null;


	var StateViewMap = function(navigator, $root) {
		_navigator = navigator;
		_orderedRecipes = [];
		_$root = $root || $('body');

		_navigator.on(navigatorjs.NavigatorEvent.STATE_REQUESTED, _handleStateRequested);
	};

	function _addRecipe(statesOrPaths) {
		var recipe = new navigatorjs.integration.ViewRecipe();

		var i, length = statesOrPaths.length;
		for (i = 0; i < length; i++) {
			recipe.addState(navigatorjs.NavigationState.make(statesOrPaths[i]));
		}

		_orderedRecipes.push(recipe);

		return recipe;
	}

	function _handleStateRequested(e, eventData) {
		var requestedState = eventData.state,
			index, recipe, recipeStates, recipesLength = _orderedRecipes.length,
			j, state, statesLength,
			viewInstance;

		for (index = 0; index < recipesLength; index++) {
			recipe = _orderedRecipes[index];
			recipeStates = recipe.getStates();
			statesLength = recipeStates.length;

			for (j = 0; j < statesLength; j++) {
				state = recipeStates[j];

				if (requestedState.contains(state)) {
					viewInstance = recipe.getViewInstance();

					if (viewInstance.navigatorBehaviors instanceof Array) {
						_addViewElementToDOM(recipe);
						_navigator.add(viewInstance, state);
					}
				}
			}
		}
	}

	function _addViewElementToDOM(recipe) {
		if (recipe.isInstantiated() && $.contains(document.documentElement, recipe.getViewInstance().$el)) {
			return;
		}

		var parentRecipe = recipe.getParentRecipe(),
			$container = _$root,
			$inside,
			insideSelector = recipe.getInsideSelector();

		if (parentRecipe) {
			if (!parentRecipe.isInstantiated()) {
				_addViewElementToDOM(parentRecipe);
			}

			$container = parentRecipe.getViewInstance().$el;
		}

		if (insideSelector != null) {
			$inside = $container.find(insideSelector);
			$container = $inside.length > 0 ? $inside.first() : $container;
		}

		var i = _orderedRecipes.indexOf(recipe) + 1,
			length = _orderedRecipes.length,
			testRecipe;
		for (i; i < length; i++) {
			testRecipe = _orderedRecipes[i];

			if (testRecipe.isInstantiated() && testRecipe.getViewInstance().$el.parent()[0] == $container[0]) {
				testRecipe.getViewInstance().$el.before(recipe.getViewInstance().$el);
				return;
			}
		}

		// otherwise add on top
		$container.append(recipe.getViewInstance().$el);
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