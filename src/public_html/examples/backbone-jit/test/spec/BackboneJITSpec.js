$(function() {
	describe("BackboneJITSpec", function () {
		var applicationRouter = window.router,
			navigatorjs = applicationRouter.navigator,
			$red = $('.red'),
			$green = $('.green'),
			$blue = $('.blue');

		beforeEach(function () {
//		    applicationRouter =
		});

		describe("Just-in-time", function () {

			it("", function() {
							stateViewMap.mapState("red").toView(RedView);
							stateViewMap.mapState("blue","*/blue").toView(BlueView);

							stateViewMap.mapState("green").toView(GreenView).inside('.myContainer');

							var applicationRootRecipe = stateViewMap.mapState(RootApplication).toView(["/"]);
							stateViewMap.mapState("black")
										.toView(BlackView)
										.withParent(applicationRootRecipe)
										.inside('.myContainer');

							stateViewMap.mapState("yellow")
										.toView(YellowView)
										.withArguments(a,b)
										.withParent(applicationRootRecipe)
										.inside('.myContainer');

						});

		});
	})
});