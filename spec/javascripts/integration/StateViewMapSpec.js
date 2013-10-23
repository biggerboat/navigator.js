$(function() {
	var View = function(className) {
		this.instantiationArguments = arguments;
		this.$el = $('<div class="view">View</div>');
		this.$el.addClass(className)
	};

	View.prototype = {
		navigatorBehaviors: ["IHasStateInitialization", "IHasStateTransition"],
		$el: null,
		instantiationArguments: [],

		initializeByNavigator: function() {
			console.log("View -> initializeByNavigator");
		},

		transitionIn: function(callOnComplete) {
			console.log("View -> transitionIn");
			callOnComplete();
		},

		transitionOut: function(callOnComplete) {
			console.log("View -> transitionOut");
			callOnComplete();
		},

		toString: function() {
			return "[object View]";
		}
	};

	describe("StateViewMapSpec", function() {
		var stateViewMap,
			navigator;

		describe("Test view", function() {
			it("can be instantiated", function() {
				expect(new View() instanceof View).toBeTruthy();
			});

			it("has responders", function() {
				var testView = new View();
				expect(testView.navigatorBehaviors[0]).toEqual("IHasStateInitialization");
				expect(testView.navigatorBehaviors[1]).toEqual("IHasStateTransition");
			});
		});

		describe("ViewRecipe", function() {
			//TODO: Write the specs for a recipe...

			it("can add a view", function() {
				var viewRecipe = new navigatorjs.integration.ViewRecipe().toView(View);

				expect(viewRecipe.getViewClass()).toEqual(View);
			});

			it("can instantiate a view", function() {
				var viewRecipe = new navigatorjs.integration.ViewRecipe().toView(View);

				expect(viewRecipe.isInstantiated()).toBeFalsy();

				var viewInstance = viewRecipe.getViewInstance();

				expect(viewInstance instanceof View).toBeTruthy();
				expect(viewRecipe.isInstantiated()).toBeTruthy();
			});

			it("always returns the exact same view instance once the view is instantiated", function() {
				var viewRecipe = new navigatorjs.integration.ViewRecipe().toView(View);

				var viewInstance1 = viewRecipe.getViewInstance();
				var viewInstance2 = viewRecipe.getViewInstance();

				expect(viewInstance1).toEqual(viewInstance2);
			});

			it("instantiates the view with the arguments that were provided", function() {
				var viewRecipe = new navigatorjs.integration.ViewRecipe()
					.toView(View)
					.withArguments("red", "circle");

				expect(viewRecipe.getViewInstance().instantiationArguments[0]).toEqual("red");
				expect(viewRecipe.getViewInstance().instantiationArguments[1]).toEqual("circle");
			});

			it("throws an error when using more than 5 view arguments", function() {
				var viewRecipe = new navigatorjs.integration.ViewRecipe();

				var callWithFiveArguments = function() {
					viewRecipe.withArguments(1, 2, 3, 4, 5);
				};
				var callWithSixArguments = function() {
					viewRecipe.withArguments(1, 2, 3, 4, 5, 6);
				};

				expect(callWithFiveArguments).not.toThrow();
				expect(callWithSixArguments).toThrow();
			});

			it("can have a parent recipe", function() {
				var parentViewRecipe = new navigatorjs.integration.ViewRecipe().toView(View);
				var childViewRecipe = new navigatorjs.integration.ViewRecipe().toView(View).withParent(parentViewRecipe);
				expect(childViewRecipe.getParentRecipe()).toEqual(parentViewRecipe);
			});
		});

		describe("StateViewMap", function() {
			var navigator,
				stateViewMap;

			beforeEach(function() {
				navigator = new navigatorjs.Navigator();
				stateViewMap = new navigatorjs.integration.StateViewMap(navigator);

				navigator.start("");
			});

			it("can map a state, which returns an instance of view recipe", function() {
				var viewRecipe = stateViewMap.mapState("red");
				expect(viewRecipe).toBeDefined();
				expect(viewRecipe).not.toBeNull();
				expect(viewRecipe instanceof navigatorjs.integration.ViewRecipe).toBeTruthy();
			});

			it("can map a string state and return a recipe holding a reference to a NavigationState, of which the path is equal to the input state", function() {
				var viewRecipe = stateViewMap.mapState("red");
				expect(viewRecipe.getStates()[0].getPath()).toEqual("/red/");
			});

			it("can map a NavigationState and return a recipe holding a reference to the NavigationState that was given as the input state", function() {
				var redState = new navigatorjs.NavigationState("red");
				var viewRecipe = stateViewMap.mapState(redState);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
			});

			it("maps multiple states that are passed as an array and register them as states within the returned recipe", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState([redState, blueState, "green"]);
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("maps multiple states that were passed as multiple arguments and register them as states within the returned recipe", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState(redState, blueState, "green");
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("maps multiple states that were passed as a combination of multiple arguments and an array and register them as states within the returned recipe", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState(redState, [blueState, "green"]);
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("maps multiple states that were passed as multiple array arguments and register them as states within the returned recipe", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState([redState], [blueState, "green"]);
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			describe("Integration with navigation flow and adding views to the DOM", function() {
				var $container,
					viewRecipe;

				beforeEach(function() {
					viewRecipe = stateViewMap.mapState("red").toView(View);
					$container = $('<div id="container" />');
					$('body').append($container);
				});

				afterEach(function() {
					$('.view').remove();
					$container.remove();
				});

				it("automatically instantiates the matching view recipe's view class once the navigator enters the mapped state", function() {
					expect(viewRecipe.isInstantiated()).toBeFalsy();

					navigator.request("red");

					expect(viewRecipe.isInstantiated()).toBeTruthy();
					expect(viewRecipe.getViewInstance() instanceof View).toBeTruthy();
				});

				it("automatically adds the $el of the ViewInstance to the DOM when we enter the mapped state", function() {
					expect($('.view').length).toEqual(0);
					navigator.request("red");
					expect($('.view').length).toEqual(1);
				});

				it("automatically adds the $el of the ViewInstance to the DOM as a direct child StateView map's $root ", function() {
					navigator.request("red");
					var viewInstance = viewRecipe.getViewInstance();

					expect(viewInstance.$el.parent()[0]).toEqual(stateViewMap.get$Root()[0]);
				});

				it("adds elements to the DOM in the order they were mapped", function() {
					stateViewMap.mapState("red/blue").toView(View).withArguments('blue');
					expect($('.view').length).toEqual(0);

					navigator.request("red/blue");

					expect($('.view').length).toEqual(2);
					expect($($('.view')[1]).hasClass('blue')).toBe(true);
				});

				it("adds elements to the DOM in the order they were mapped when we start at a deeplink state right away", function() {
					navigator = new navigatorjs.Navigator();
					stateViewMap = new navigatorjs.integration.StateViewMap(navigator);

					stateViewMap.mapState(["/"]).toView(View);
					stateViewMap.mapState(["/game"]).toView(View).withArguments('game');

					navigator.start("/game");

					expect($('.view').length).toEqual(2);
					expect($($('.view')[1]).hasClass('game')).toBe(true);
				});

				it("automatically adds the $el of the ViewInstance inside the provided inside-selector when we enter the mapped state", function() {
					viewRecipe.inside('#container');
					expect($container.children().length).toEqual(0);
					navigator.request("red");
					expect($container.children().length).toEqual(1);
				});

				it("automatically adds the $el to a parent recipe's $el when we navigate to the state of the nested view", function() {
					viewRecipe.withArguments("red");

					var blueRecipe = stateViewMap.mapState("red/blue").toView(View).withArguments('blue');
					blueRecipe.withParent(viewRecipe);

					expect($(".red").length).toEqual(0);
					expect($(".blue").length).toEqual(0);

					navigator.request("red");

					expect($(".red").length).toEqual(1);
					expect($(".blue").length).toEqual(0);

					navigator.request("red/blue");

					expect($(".red").length).toEqual(1);
					expect($(".blue").length).toEqual(1);
					expect($(".blue").parent()[0]).toEqual($('.red')[0]);
				});

				it("recursively adds the $el to a parent recipe's $el", function() {
					viewRecipe.withArguments("red");

					var blueRecipe = stateViewMap.mapState("red/blue").toView(View).withArguments('blue');
					blueRecipe.withParent(viewRecipe);

					var greenRecipe = stateViewMap.mapState("red/blue/green").toView(View).withArguments('green');
					greenRecipe.withParent(blueRecipe);

					var blackRecipe = stateViewMap.mapState("*/*/green/black").toView(View).withArguments('black');
					blackRecipe.withParent(greenRecipe);

					navigator.request("red/blue/green/black");

					expect($(".black").parent()[0]).toEqual($('.green')[0]);
					expect($(".green").parent()[0]).toEqual($('.blue')[0]);
					expect($(".blue").parent()[0]).toEqual($('.red')[0]);
				});

				it("automatically adds elements to the DOM in order as they were mapped even though they got instantiated in a different order", function() {
					viewRecipe.withArguments("red");

					var blueRecipe = stateViewMap.mapState("red/blue").toView(View).withArguments('blue');
					blueRecipe.withParent(viewRecipe);

					var greenRecipe = stateViewMap.mapState("red/green").toView(View).withArguments('green');
					greenRecipe.withParent(viewRecipe);

					var blackRecipe = stateViewMap.mapState("red/black").toView(View).withArguments('black');
					blackRecipe.withParent(viewRecipe);

					navigator.request("red/black");
					expect(blackRecipe.getViewInstance().$el.index()).toEqual(0);

					navigator.request("red/blue");
					expect(blueRecipe.getViewInstance().$el.index()).toEqual(0);
					expect(blackRecipe.getViewInstance().$el.index()).toEqual(1);

					navigator.request("red/green");
					expect(blueRecipe.getViewInstance().$el.index()).toEqual(0);
					expect(greenRecipe.getViewInstance().$el.index()).toEqual(1);
					expect(blackRecipe.getViewInstance().$el.index()).toEqual(2);
				});
			});

		});
	})
});