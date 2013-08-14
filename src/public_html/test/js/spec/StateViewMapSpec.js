$(function() {
	describe("StateViewMapSpec", function() {
		var stateViewMap,
			navigator;

		beforeEach(function() {
//		    applicationRouter =
			navigator = new navigatorjs.Navigator();
			stateViewMap = new navigatorjs.integration.StateViewMap(navigator);

			View = function(className) {
				this.instantiationArguments = arguments;
				this.$el = $('<div id="view">View</div>');
				this.$el.addClass(className)
			};
			View.prototype = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateTransition"],
				$el: null,
				instantiationArguments: [],

				initialize: function() {
					console.log("View -> initialize");
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


			navigator.start("");
		});

		afterEach(function(){
			$('#view').remove();
		});

		describe("Test view", function() {
			it("can be instantiated", function(){
				expect(new View() instanceof View).toBeTruthy();
			});


			it("has responders", function(){
				var testView = new View();
				expect(testView.navigatorBehaviors[0]).toEqual("IHasStateInitialization");
				expect(testView.navigatorBehaviors[1]).toEqual("IHasStateTransition");
			});
		});

		describe("StateViewMap", function() {

			it("can map a state and returns a view recipe", function() {
				var viewRecipe = stateViewMap.mapState("red");
				expect(viewRecipe).toBeDefined();
				expect(viewRecipe).not.toBeNull();
				expect(viewRecipe instanceof navigatorjs.integration.ViewRecipe).toBeTruthy();
			});

			it("returns a mapped recipe containing the converted string state", function() {
				var viewRecipe = stateViewMap.mapState("red");
				expect(viewRecipe.getStates()[0].getPath()).toEqual("/red/");
			});

			it("returns a mapped recipe containing the NavigationState state", function() {
				var redState = new navigatorjs.NavigationState("red");
				var viewRecipe = stateViewMap.mapState(redState);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
			});

			it("returns a mapped recipe containing all states that were passed as an array", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState([redState, blueState, "green"]);
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("returns a mapped recipe containing all states that were passed as multiple arguments", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState(redState, blueState, "green");
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("returns a mapped recipe containing all states that were passed as a single argument and an array", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState(redState, [blueState, "green"]);
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("returns a mapped recipe containing all states that were passed as multiple arrays", function() {
				var redState = new navigatorjs.NavigationState("red");
				var blueState = new navigatorjs.NavigationState("blue");

				var viewRecipe = stateViewMap.mapState([redState], [blueState, "green"]);
				expect(viewRecipe.getStates().length).toEqual(3);
				expect(viewRecipe.getStates()[0]).toEqual(redState);
				expect(viewRecipe.getStates()[1]).toEqual(blueState);
				expect(viewRecipe.getStates()[2].getPath()).toEqual("/green/");
			});

			it("can add a view to a ViewRecipe", function() {
				var viewRecipe = stateViewMap.mapState("red").toView(View);

				expect(viewRecipe.getViewClass()).toEqual(View);
			});

			it("navigates to the red state and instantiates the view recipe's view class", function() {
				var viewRecipe = stateViewMap.mapState("red").toView(View);
				expect(navigator.getCurrentState().getPath()).toEqual("/");
				expect(viewRecipe.isInstantiated()).toBeFalsy();
				navigator.request("red");
				expect( navigator.getCurrentState().getPath()).toEqual("/red/");
				expect(viewRecipe.isInstantiated()).toBeTruthy();
				expect(viewRecipe.getViewInstance() instanceof View).toBeTruthy();
			});

			it("navigates to the red state and instantiates the view recipe's view class with red and circle as the arguments", function() {
				var viewRecipe = stateViewMap.mapState("red")
											 .toView(View)
											 .withArguments("red","circle");

				navigator.request("red");
				expect(viewRecipe.getViewInstance().instantiationArguments[0]).toEqual("red");
				expect(viewRecipe.getViewInstance().instantiationArguments[1]).toEqual("circle");
			});

			it("throws an error when setting more than 5 arguments on a viewRecipe", function() {
				var viewRecipe = stateViewMap.mapState("red").toView(View);

				var callWithFiveArguments = function() {
					viewRecipe.withArguments(1,2,3,4,5);
				};
				var callWithSixArguments = function() {
					viewRecipe.withArguments(1,2,3,4,5,6);
				};

				expect(callWithFiveArguments).not.toThrow();
				expect(callWithSixArguments).toThrow();
			});


			describe("Adding views to the DOM", function() {
				var $container,
					viewRecipe;

				beforeEach(function() {
					viewRecipe = stateViewMap.mapState("red").toView(View);
					$container = $('<div id="container" />');
					$('body').append($container);
				});

				afterEach(function(){
					$container.remove();
				});

				it("adds the $el of the ViewInstance to the DOM", function() {
					expect($('#view').length).toEqual(0);
					navigator.request("red");
					expect($('#view').length).toEqual(1);
				});

				it("adds the $el of the ViewInstance inside the provided inside-selector", function() {
					viewRecipe.inside('#container');
					expect($container.children().length).toEqual(0);
					navigator.request("red");
					expect($container.children().length).toEqual(1);
				});

				it("adds the $el to a parent recipe's $el", function() {
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

				it("adds elements to the DOM in order as they were mapped even though they got instantiated in a different order", function() {
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


//			it("", function() {
//				stateViewMap.mapState("red").toView(RedView);
//				stateViewMap.mapState("blue", "*/blue").toView(BlueView);
//
//				stateViewMap.mapState("green").toView(GreenView).inside('.myContainer');
//
//				var applicationRootRecipe = stateViewMap.mapState(RootApplication).toView(["/"]);
//				stateViewMap.mapState("black")
//					.toView(BlackView)
//					.withParent(applicationRootRecipe)
//					.inside('.myContainer');
//
//				stateViewMap.mapState("yellow")
//					.toView(YellowView)
//					.withArguments(a, b)
//					.withParent(applicationRootRecipe)
//					.inside('.myContainer');
//
//			});

		});
	})
});