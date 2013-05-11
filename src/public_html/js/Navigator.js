this.navigatorjs = this.navigatorjs||{};

(function() {
	var Navigator = function () {
		this._responders = new navigatorjs.ResponderLists();
		this._defaultState = null;
		this._currentState = null;
		this._statusByResponder = {};
		this._$eventDispatcher = $();

		this._modify = function(addition, responder, pathsOrStates, behaviorString) {
			if (this._relayModification(addition, responder, pathsOrStates, behaviorString)) return;

			// Using the path variable as dictionary key to break instance referencing.
			var path = navigatorjs.NavigationState.make(pathsOrStates).getPath(),
				list, matchingInterface;

			// Create, store and retrieve the list that matches the desired behavior.
			switch(behaviorString) {
				case navigatorjs.NavigationBehaviors.SHOW:
					matchingInterface = "IHasStateTransition";
					list = this._responders.showByPath[path] = this._responders.showByPath[path] || [];
					break;
				case navigatorjs.NavigationBehaviors.HIDE:
					matchingInterface = "IHasStateTransition";
					list = this._responders.hideByPath[path] = this._responders.hideByPath[path] || [];
					break;
				case navigatorjs.NavigationBehaviors.VALIDATE:
					matchingInterface = "IHasStateValidation";
					list = this._responders.validateByPath[path] = this._responders.validateByPath[path] || [];
					break;
				case navigatorjs.NavigationBehaviors.UPDATE:
					matchingInterface = "IHasStateUpdate";
					list = this._responders.updateByPath[path] = this._responders.updateByPath[path] || [];
					break;
				case navigatorjs.NavigationBehaviors.SWAP:
					matchingInterface = "IHasStateSwap";
					list = this._responders.swapByPath[path] = this._responders.swapByPath[path] || [];
					break;
				default:
					throw new Error("Unknown behavior: " + behaviorString);
			}

			//TODO: Build in more strict validation?
//			if (!(responder is matchingInterface)) {
//				throw new Error("Responder " + responder + " should implement " + matchingInterface + " to respond to " + behavior);
//			}
			if (addition) {
				// add
				if (list.indexOf(responder) < 0) {
					list.push(responder);

					// If the responder has no status yet, initialize it to UNINITIALIZED:
					this._statusByResponder[responder] = this._statusByResponder[responder] || navigatorjs.transition.TransitionStatus.UNINITIALIZED;
				} else {
					return;
				}
			} else {
				// remove
				var index = list.indexOf(responder);
				if (index >= 0) {
					list.splice(index, 1);

					delete this._statusByResponder[responder];
				} else {
					return;
				}

				if (matchingInterface == "IHasStateSwap" && this._responders.swappedBefore[responder]) {
					// cleanup after the special swap case
					delete this._responders.swappedBefore[responder];
				}
			}

			this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, this._statusByResponder);
		};

		this._relayModification = function(addition, responder, pathsOrStates, behaviorString) {
			if (!responder) {
				throw new Error("add: responder is null");
			}

			var index, length;

			if (pathsOrStates instanceof Array) {
				length = pathsOrStates.length;
				for (index=0;index<length;index++) {
					this._modify(addition, responder, pathsOrStates[index], behaviorString);
				}
				return true;
			}

			behaviorString = behaviorString || navigatorjs.NavigationBehaviors.AUTO;
			if (behaviorString == navigatorjs.NavigationBehaviors.AUTO) {
				length = navigatorjs.NavigationBehaviors.ALL_AUTO.length;
				for (index=0;index<length;index++) {
					try {
						this._modify(addition, responder, pathsOrStates, navigatorjs.NavigationBehaviors.ALL_AUTO[index]);
					} catch(e) {
						// ignore 'should implement xyz' errors
					}
				}
				return true;
			}

			return false;
		};
	};


	//PUBLIC API
	Navigator.prototype = {
		add: function(responder, pathsOrStates, behaviorString) {
			this._modify(true, responder, pathsOrStates, behaviorString);
		},

		remove: function(responder, pathsOrStates, behaviorString) {
			this._modify(false, responder, pathsOrStates, behaviorString);
		},

		start: function(defaultStateOrPath, startStateOrPath) {
			this._defaultState = navigatorjs.NavigationState.make(defaultStateOrPath || "*");

			this.request(startStateOrPath || this._defaultState);
		},

		request: function(pathOrState) {

		},

		getCurrentState: function() {
			if(!this._currentState) {
				if(this._defaultState) {
					return this._defaultState.clone();
				}

				return null;
			}

			return this._currentState.clone();
		},

		hasResponder: function(responder) {
			if (this._statusByResponder[responder]) {return true;}

			var respondersByPath,
				existingResponders,
				i, j;

			for (i=0;i<this._responders.all.length;i++) {
				respondersByPath = this._responders.all[i];
				for (j=0;j<respondersByPath.length;j++) {
					existingResponders = respondersByPath[j];
					if (existingResponders.indexOf(responder) >= 0) {return true;}
				}
			}

			return false;
		},

		on: function() {

		},

		off: function() {

		}
	};

	navigatorjs.Navigator = Navigator;
}());