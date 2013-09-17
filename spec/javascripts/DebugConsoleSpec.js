describe("DebugConsole", function () {

	var navigator,
		debugConsole,
		$debugConsole,
		responder;

	beforeEach(function () {
		navigator = new navigatorjs.Navigator(),
		debugConsole = new navigatorjs.features.DebugConsole(navigator),
		$debugConsole = debugConsole.get$El();
		$debugConsole.css({position:'fixed', left:10, bottom:10});
		$('body').append($debugConsole);

		responder = {
			navigatorBehaviors: ["IHasStateInitialization", "IHasStateTransition"],
			initialize: function() {
				console.log("responder -> initialize");
			},

			transitionIn: function(callOnComplete) {
				console.log("responder -> transitionIn");
				callOnComplete();
			},

			transitionOut: function(callOnComplete) {
				console.log("responder -> transitionOut");
				callOnComplete();
			},

			toString: function() {
				return "[object responder]";
			}
		};
	});

	afterEach(function() {
		//$debugConsole.remove();
	});

	it("Automatically adjusts the width based on its content", function () {
		var wideStatePath = "/this/is/a/relatively/long/state/causing/the/console/to/be/very/wide/";

		navigator.add(responder, wideStatePath);
		var $input = $debugConsole.find('input'),
			startInputWidth = $input.width();

		navigator.start("");
		navigator.request(wideStatePath);

		expect($input.width()).toBeGreaterThan(startInputWidth);
	});

});