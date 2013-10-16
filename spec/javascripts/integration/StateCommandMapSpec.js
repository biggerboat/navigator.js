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
		var executeCount;
		var Command;

		beforeEach(function() {
			executeCount = 0;

			Command = Backbone.Command.extend({
				execute: function() {
					executeCount++;
				}
			});

			navigator.start();
		});

		it("executes the command when the mapped state is requested", function() {
			stateCommandMap.mapCommand("/command", Command);
			navigator.request("/command");

			expect(executeCount).toBe(1);
		});

		it("doesn't execute the command when a different state is requested", function() {
			navigator.add({}, "/test");
			stateCommandMap.mapCommand("/command", Command);
			navigator.request("/test");

			expect(executeCount).toBe(0);
		});

		it("executes the command that is mapped with a wildcard state", function() {
			stateCommandMap.mapCommand("*/command", Command);
			navigator.request("/test/command");

			expect(executeCount).toBe(1);
		});

		it("executes the command every time the new state contains the mapped state", function() {
			navigator.add({}, "/*/command/*");
			stateCommandMap.mapCommand("*/command", Command);
			navigator.request("/test/command");
			navigator.request("/test/command/test1");
			navigator.request("/test/command/test2");

			expect(executeCount).toBe(3);
		});

		it("doesn't execute the command when we leave the mapped state", function() {
			navigator.add({}, "/");
			stateCommandMap.mapCommand("/command", Command);
			navigator.request("/command");
			navigator.request("/test");

			expect(executeCount).toBe(1);
		});

		it("can be mapped to exact states and doesn't execute when the current state only contains the mapped state", function() {
			navigator.add({}, "/*/command/*");
			stateCommandMap.mapCommand("*/command", Command, true);
			navigator.request("/test/command");
			navigator.request("/test/command/test1");
			navigator.request("/test/command/test2");

			expect(executeCount).toBe(1);
		});

		it("doesn't execute the command multiple times when the onShot parameter is set to true", function() {
			navigator.add({}, "/*/command/*");
			stateCommandMap.mapCommand("*/command", Command, false, true);
			navigator.request("/test/command");
			navigator.request("/test/command/test1");
			navigator.request("/test/command/test2");

			expect(executeCount).toBe(1);
		});

		describe("injection", function() {
			var fullState,
				truncatedState;

			beforeEach(function() {
				fullState = truncatedState = undefined;

				Command = Backbone.Command.extend({

					fullState: 'inject',
					truncatedState: 'inject',

					execute: function() {
						fullState = this.fullState;
						truncatedState = this.truncatedState;
					}
				});
			});

			it("temporarily injects the full state", function() {
				expect(injectorjs.hasMapping('fullState')).toBe(false);
				expect(fullState).toBeUndefined();

				stateCommandMap.mapCommand("/command", Command);
				navigator.request("/command");

				expect(fullState).not.toBe('inject');
				expect(fullState).not.toBeUndefined();
				expect(injectorjs.hasMapping('fullState')).toBe(false);
			});

			it("temporarily injects the truncated state", function() {
				expect(injectorjs.hasMapping('truncatedState')).toBe(false);
				expect(truncatedState).toBeUndefined();

				stateCommandMap.mapCommand("/command", Command);
				navigator.request("/command");

				expect(fullState).not.toBe('inject');
				expect(truncatedState).not.toBeUndefined();
				expect(injectorjs.hasMapping('truncatedState')).toBe(false);
			});
		});
	});

});