$(function() {
	describe("StateViewMapSpec", function() {
		var stateViewMap,
			navigator;

		beforeEach(function() {
//		    applicationRouter =
			navigator = new navigatorjs.Navigator();
			stateViewMap = new navigatorjs.integration.StateViewMap(navigator);
			View = function() {
			};
			View.prototype = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateTransition"],
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