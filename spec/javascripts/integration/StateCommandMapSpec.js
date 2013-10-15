describe("StateCommandMap", function() {
	var navigator;
	var injectorjs;
	var stateCommandMap;

	beforeEach(function() {
		navigator = new navigatorjs.Navigator();
		injectorjs = new injector.Injector();
		stateCommandMap = new navigatorjs.integration.StateCommandMap(navigator, injectorjs);
	});

	it("Can map a state to a command", function() {
		stateCommandMap.mapCommand("/command", Backbone.Command);
	});
});