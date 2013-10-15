describe("StateCommandMap", function() {
	var navigator;
	var injectorjs;
	var stateCommandMap;

	beforeEach(function() {
		navigator = new navigatorjs.Navigator();
		injectorjs = new injector.Injector();
		stateCommandMap = new navigatorjs.integration.StateCommandMap(navigator, injectorjs);
	});


	describe("mapping and unmapping", function() {
		it("can map a state to a command", function() {
			stateCommandMap.mapCommand("/command", Backbone.Command);
		});

		it("can not map a state to the same command twice", function() {
			stateCommandMap.mapCommand("/command", Backbone.Command);
			expect(function() {
				stateCommandMap.mapCommand("/command", Backbone.Command)
			}).toThrow();
		});

		it("can map a different state to the same command twice", function() {
			stateCommandMap.mapCommand("/command", Backbone.Command);
			expect(function() {
				stateCommandMap.mapCommand("/command2", Backbone.Command)
			}).not.toThrow();
		});

		it("can map two different commands to the same state", function() {
			var OtherCommand = Backbone.Command.extend({});
			stateCommandMap.mapCommand("/command", Backbone.Command);
			expect(function() {
				stateCommandMap.mapCommand("/command", OtherCommand)
			}).not.toThrow();
		});

		it("can unmap a command and map it again", function() {
			stateCommandMap.mapCommand("/command", Backbone.Command);
			stateCommandMap.unmapCommand("/command", Backbone.Command);
			expect(function() {
				stateCommandMap.mapCommand("/command", Backbone.Command)
			}).not.toThrow();
		});
	});

	describe("execution", function() {
		var executed;
		var Command;

		beforeEach(function() {
			executed = false;

			Command = Backbone.Command.extend({
				execute: function() {
					executed = true;
				}
			});

			navigator.start();
		});

		it("executes the command when the mapped state is requested", function(){
			stateCommandMap.mapCommand("/command", Command);
			navigator.request("/command");

			expect(executed).toBe(true);
		});

		it("executes the command when a different state is requested", function(){
			navigator.add({}, "/test");
			stateCommandMap.mapCommand("/command", Command);
			navigator.request("/test");

			expect(executed).toBe(false);
		});

//		describe("injection", function(){
//			it("injects the full state");
//			it("injects the truncated state");
//			it("cleans up the mapped states after execution");
//		});
	});

});