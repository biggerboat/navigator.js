this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.integration = this.navigatorjs.integration || {};

(function() {
	var StateCommandMap = function(navigator, injector) {
		this._navigator = navigator;
		this._injector = injector;
		this._commandsByState = {};
		this._verifiedCommandClasses = {};

		//this._navigator.add(this, "");

		this.initialize();
	};

	StateCommandMap.prototype = {
		navigatorBehaviors: ["IHasStateValidationOptional", "IHasStateUpdate"],

		_navigator: null,
		_injector: null,
		_commandsByState: null, //{}
		_verifiedCommandClasses: null, //{}

		initialize: function() {
		},

		mapCommand: function(stateOrPath, CommandClass, aExactMatch, aOneShot) {
			var exactMatch = aExactMatch == undefined ? false : aExactMatch,
				oneShot = aOneShot == undefined ? false : aOneShot,
				state = navigatorjs.NavigationState.make(stateOrPath),
				commands = this._commandsByState[state.getPath()] || [];

			this._commandsByState[state.getPath()] = commands;
			this._navigator.add(this, state);

			if (this._hasCommand(commands, CommandClass)) {
				throw new Error("Already mapped " + CommandClass + " to state " + state.getPath());
				return;
			}

			this._verifyCommandClass(CommandClass);

			commands.push({CommandClass: CommandClass, state: state, exactMatch: exactMatch, oneShot: oneShot});
		},

		unmapCommand: function(stateOrPath, CommandClass) {
			var state = navigatorjs.NavigationState.make(stateOrPath),
				commands = this._commandsByState[state.getPath()] || [],
				i, wrapper;
			this._commandsByState[state.getPath()] = commands;
			this._navigator.remove(this, state);
			for (i = commands.length; --i >= 0;) {
				wrapper = commands[i];
				if (wrapper.CommandClass == CommandClass) {
					commands.splice(i, 1);
					return;
				}
			}
		},

		willValidate: function(truncatedState, fullState) {
			// will only validate if the state matches a command.
			return this.validate(truncatedState, fullState);
		},

		validate: function(truncatedState, fullState) {
			var path, mappedState, commands, isExact, i, wrapper;

			for (path in this._commandsByState) {
				mappedState = navigatorjs.NavigationState.make(path);

				if (fullState.contains(mappedState)) {
					commands = this._commandsByState[path];
					isExact = fullState.equals(mappedState);

					// reverse loop to accomodate for oneshot removal
					i = commands.length;
					for (i; --i >= 0;) {
						wrapper = commands[i];
						if (!isExact && wrapper.exactMatch) {
							continue;
						}
						return true;
					}
				}
			}

			return false;
		},

		updateState: function(truncatedState, fullState) {
			var path, mappedState, commands, isExact, i, wrapper, command;

			for (path in this._commandsByState) {
				mappedState = navigatorjs.NavigationState.make(path);
				if (fullState.contains(mappedState)) {
					commands = this._commandsByState[path];
					isExact = fullState.equals(mappedState);

					// reverse loop to accomodate for oneshot removal
					i = commands.length;
					for (i; --i >= 0;) {
						wrapper = commands[i];
						if (!isExact && wrapper.exactMatch) {
							continue;
						}

						this._injector.map('fullState').toValue(fullState);
						this._injector.map('truncatedState').toValue(fullState.subtract(wrapper.state));

						command = new wrapper.CommandClass({injector:this._injector});
						command.execute();

						this._injector.unmap('fullState');
						this._injector.unmap('truncatedState');

						if (wrapper.oneShot) {
							this.unmapCommand(wrapper.state, wrapper.CommandClass);
						}
					}
				}
			}
		},

		_hasCommand: function(wrappedCommandsList, testForCommandClass) {
			var i, commandWrapper, length = wrappedCommandsList.length;
			for (i = 0; i < length; i++) {
				commandWrapper = wrappedCommandsList[i];
				if (commandWrapper.CommandClass == testForCommandClass) {
					return true;
				}
			}
			return false;
		},

		_verifyCommandClass: function(CommandClass) {
			if (this._verifiedCommandClasses[CommandClass]) {
				return;
			}
			if (CommandClass.prototype["execute"]===undefined) {
				throw new Error("Command doesn't implement an execute method - " + CommandClass);
			}
			this._verifiedCommandClasses[CommandClass] = true;
		}
	};

	navigatorjs.integration.StateCommandMap = StateCommandMap;

}());