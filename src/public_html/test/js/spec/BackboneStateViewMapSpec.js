$(function() {
	describe("BackboneStateViewMapSpec", function() {
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
			}

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
				console.log('viewRecipe -> ', viewRecipe);
				expect(viewRecipe).toBeDefined();
				expect(viewRecipe).not.toBeNull();
				expect(viewRecipe instanceof navigatorjs.integration.ViewRecipe).toBeTruthy();

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