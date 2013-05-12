this.navigatorjs = this.navigatorjs||{};

(function() {
	var Navigator = function () {
		//
		this._$eventDispatcher = $();
		//internal namespaces
		this._flow = {};
		this._transition = {};
		this._validation = {};
		this._hidden = {};
		//
		this._currentState = null;
		this._previousState = null;
		this._defaultState = null;
		this._isTransitioning = false;
		//
		this._responders = new navigatorjs.ResponderLists();
		this._statusByResponder = {};
		this._redirects = null;
		this._disappearingAsynchResponders = null;
		this._appearingAsynchResponders = null;
		this._swappingAsynchResponders = null;
		this._validatingAsynchResponders = null;
		this._inlineRedirectionState = null;
		//
		this._asyncInvalidated = false;
		this._asyncValidated = false;
		this._asyncValidationOccurred = false;

		this._implementsInterface = function(responder, interface) {
			return  responder.navigatorBehaviors &&
					responder.navigatorBehaviors instanceof Array &&
					responder.navigatorBehaviors.indexOf(interface!=-1);
		};

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

		this._performRequestCascade = function(requestedState, startAsyncValidation) {
			if (!this._defaultState) { throw new Error("No default state set. Call start() before the first request!"); }
			// Request cascade starts here.
			//
			if (requestedState.getPath() == this._defaultState.getPath() && !this._defaultState.hasWildcard()) {
				// Exact match on default state bypasses validation.
				this._grantRequest(this._defaultState);
			} else if (this._asyncValidationOccurred && (this._asyncValidated && !this._asyncInvalidated)) {
				// Async operation completed
				this._grantRequest(requestedState);
			} else if (this._validate(requestedState, true, startAsyncValidation)) {
				// Any other state needs to be validated.
				this._grantRequest(requestedState);
			} else if (this._validatingAsynchResponders && this._validatingAsynchResponders.isBusy()) {
				// Waiting for async validation.
				// FIXME: What do we do in the mean time, dispatch an event or sth?
				//logger.notice("waiting for async validation to complete");
			} else if (startAsyncValidation && this._asyncValidationOccurred) {
				// any async prepration happened instantaneuously
			} else if (this._inlineRedirectionState) {
				this.request(this._inlineRedirectionState);
			} else if (this._currentState) {
				// If validation fails, the notifyStateChange() is called with the current state as a parameter,
				// mainly for subclasses to respond to the blocked navigation (e.g. SWFAddress).
				this._notifyStateChange(this._currentState);
			} else if (requestedState.hasWildcard()) {
				// If we get here, after validateWithWildcards has failed, this means there are still
				// wildcards in the requested state that didn't match the previous state. This,
				// unfortunately means your application has a logic error. Go fix it!
				throw new Error("Check wildcard masking: " + requestedState.getPath());
			} else if (this._defaultState) {
				// If all else fails, we'll put up the default state.
				this._grantRequest(this._defaultState);
			} else {
				// If you don't provide a default state, at least make sure your first request makes sense!
				throw new Error("First request is invalid: " + requestedState.getPath());
			}
		};

		this._grantRequest = function(state) {
			this._asyncInvalidated = false;
			this._asyncValidated = false;
			this._previous = this._currentState;
			this._current = state;

			this._notifyStateChange(this._currentState);

			this._flow.startTransition();
		};

		this._notifyStateChange = function(state) {
			//logger.notice(state);

			// Do call the super.notifyStateChange() when overriding.
			if (state != this._previousState) {
				this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.STATE_REQUESTED, {statusByResponder: this._statusByResponder, state:this._currentState});
			}
		};

		// FLOW NAMESPACE START
		this._flow.startTransition = function() {
			this._isTransitioning = true;
			this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STARTED);

			this._disappearingAsynchResponders = new navigatorjs.AsynchResponders();
			this._disappearingAsynchResponders.addResponders(this._flow.transitionOut());

			if (!this._disappearingAsynchResponders.isBusy()) {
				this._flow.performUpdates();
			}
		};

		this._flow.transitionOut = function() {
			var respondersToShow = this._getRespondersToShow(),
				responder,
				waitForResponders = [],
				index;

			// This initialize call is to catch responders that were put on stage to show,
			// yet still need to wait for async out transitions before they actually transition in.
			this._initializeIfNeccessary(respondersToShow);

			for (responder in this._statusByResponder) {
				if (respondersToShow.indexOf(responder) ==-1) {
					// if the responder is not already hidden or disappearing, trigger the transitionOut:
					if (navigatorjs.transition.TransitionStatus.HIDDEN < this._statusByResponder[responder] && this._statusByResponder[responder] < navigatorjs.transition.TransitionStatus.DISAPPEARING) {
						this._statusByResponder[responder] = navigatorjs.transition.TransitionStatus.DISAPPEARING;
						waitForResponders.push(responder);

						//use namespace transition;
						responder.transitionOut(new navigatorjs.TransitionCompleteDelegate(responder, navigatorjs.transition.TransitionStatus.HIDDEN, navigatorjs.NavigationBehaviors.HIDE, this, this._transition).call);
					} else {
						// already hidden or hiding
					}
				}
			}

			// loop backwards so we can splice elements off the array while in the loop.
			for (index = waitForResponders.length; --index >= 0;) {
				if (this._statusByResponder[waitForResponders[index]] == navigatorjs.transition.TransitionStatus.HIDDEN) {
					waitForResponders.splice(index, 1);
				}
			}

			if (waitForResponders.length>0) {
				this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponder:this._statusByResponder});
			}

			return waitForResponders;
		};

		this._flow.performUpdates = function() {
			this._disappearingAsynchResponders.reset();

			var path, state, list, index, responder;

			for (path in this._responders.updateByPath) {
				// create a state object for comparison:
				state = new navigatorjs.NavigationState(path);

				if (this._currentState.contains(state)) {
					// the lookup path is contained by the new state.
					list = this._responders.updateByPath[path];

					this._initializeIfNeccessary(list);

					// check for existing validators.
					for(index=0;index<list.length;index++) {
						responder = list[index];
						responder.updateState(this._currentState.subtract(state), this._currentState);
					}
				}
			}

			this._flow.startTransitionIn();
		};

		this._flow.startTransitionIn = function() {
			this._appearingAsynchResponders = new navigatorjs.AsynchResponders();
			this._appearingAsynchResponders.addResponders(this._flow.transitionIn());

			if (!this._appearingAsynchResponders.isBusy()) {
				this._flow.startSwapOut();
			}
		};

		this._flow.transitionIn = function() {
			var respondersToShow = this._getRespondersToShow(),
				respondersToWaitFor = [],
				responder,
				status,
				index;

			this._initializeIfNeccessary(respondersToShow);

			//for each (var responder : IHasStateTransition in respondersToShow) {
			for(index=0;index<respondersToShow.length;index++) {
				responder = respondersToShow[index];
				status = this._statusByResponder[responder];

				if (status < navigatorjs.transition.TransitionStatus.APPEARING || navigatorjs.transition.TransitionStatus.SHOWN < status) {
					// then continue with the transitionIn() call.
					this._statusByResponder[responder] = navigatorjs.transition.TransitionStatus.APPEARING;
					respondersToWaitFor.push(responder);

					//use namespace transition;
					responder.transitionIn(new navigatorjs.TransitionCompleteDelegate(responder, navigatorjs.transition.TransitionStatus.SHOWN, navigatorjs.transition.NavigationBehaviors.SHOW, this, this._transition).call);
				}
			}

			// loop backwards so we can splice elements off the array while in the loop.
			for (index = respondersToWaitFor.length;--index >= 0;) {
				if (this._statusByResponder[respondersToWaitFor[index]] == navigatorjs.transition.TransitionStatus.SHOWN) {
					respondersToWaitFor.splice(index, 1);
				}
			}

			if (respondersToWaitFor.length>0) {
				this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponder:this._statusByResponder});
			}

			return respondersToWaitFor;
		};

		this._flow.startSwapOut = function() {
			this._swappingAsynchResponders = new navigatorjs.AsynchResponders();
			this._swappingAsynchResponders.addResponders(this._flow.swapOut());

			if (!this._swappingAsynchResponders.isBusy()) {
				this._flow.swapIn();
			}
		};

		this._flow.swapOut = function() {
			this._appearingAsynchResponders.reset();

			var waitForResponders = [],
				path, state,
				swapByPathList,
				responder,
				index,
				truncatedState;

			for (path in this._responders.swapByPath) {
				// create a state object for comparison:
				state = new navigatorjs.NavigationState(path);

				if (this._currentState.contains(state)) {
					// the lookup path is contained by the new state.
					swapByPathList = this._responders.swapByPath[path];

					this._initializeIfNeccessary(swapByPathList);

					// check for existing swaps.
					for(index=0;index<swapByPathList.length;index++) {
						responder = swapByPathList[index];
						if (!this._responders.swappedBefore[responder])
							continue;

						truncatedState = this._currentState.subtract(state);
						if (responder.willSwapToState(truncatedState, this._currentState)) {
							this._statusByResponder[responder] = navigatorjs.transition.TransitionStatus.SWAPPING;
							waitForResponders.push(responder);

							//use namespace transition;
							responder.swapOut(new navigatorjs.TransitionCompleteDelegate(responder, navigatorjs.transition.TransitionStatus.SHOWN, navigatorjs.transition.NavigationBehaviors.SWAP, this, this._transition).call);
						}
					}
				}
			}

			// loop backwards so we can splice elements off the array while in the loop.
			for (index = waitForResponders.length;--index >= 0;) {
				if (this._statusByResponder[waitForResponders[index]] == navigatorjs.transition.TransitionStatus.SHOWN) {
					waitForResponders.splice(index, 1);
				}
			}

			if (waitForResponders.length>0) {
				this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponder:this._statusByResponder});
			}

			return waitForResponders;
		};

		this._flow.swapIn = function() {
			this._swappingAsynchResponders.reset();

			var path,
				state,
				swapByPathList,
				responder,
				truncatedState,
				index;

			for (path in this._responders.swapByPath) {
				// create a state object for comparison:
				state = new navigatorjs.NavigationState(path);

				if (this._currentState.contains(state)) {
					// the lookup path is contained by the new state.
					swapByPathList = this._responders.swapByPath[path];

					this._initializeIfNeccessary(swapByPathList);

					// check for existing swaps.
					//for each (var responder : IHasStateSwap in swapByPathList) {
					for(index=0;index<swapByPathList.length;index++) {
						responder = swapByPathList[index];
						truncatedState = this._currentState.subtract(state);
						if (responder.willSwapToState(truncatedState, this._currentState)) {
							this._responders.swappedBefore[responder] = true;
							responder.swapIn(truncatedState, this._currentState);
						}
					}
				}
			}

			this._flow.finishTransition();
		};

		this._flow.finishTransition = function() {
			this._isTransitioning = false;
			this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_FINISHED);
		};
		// FLOW NAMESPACE END

		// TRANSITION NAMESPACE START
		this._transition.notifyComplete = function(responder, status, behavior) {
			if (this._statusByResponder[responder]) {
				this._statusByResponder[responder] = status;
				this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponder:this._statusByResponder});
			}

			var asynchResponders,
				callbackMethod;

			switch(behavior) {
				case navigatorjs.NavigationBehaviors.HIDE:
					asynchResponders = this._disappearingAsynchResponders;
					callbackMethod = this._flow.performUpdates;
					break;
				case navigatorjs.NavigationBehaviors.SHOW:
					asynchResponders = this._appearingAsynchResponders;
					callbackMethod = this._flow.startSwapOut;
					break;
				case navigatorjs.NavigationBehaviors.SWAP:
					asynchResponders = this._swappingAsynchResponders;
					callbackMethod = this._flow.swapIn;
					break;
				default:
					throw new Error("Don't know how to handle notification of behavior " + behavior);
			}

			// If the notifyComplete is called instantly, the array of asynchronous responders is not yet assigned, and therefore not busy.
			if (asynchResponders.isBusy()) {
				asynchResponders.takeOutResponder(responder);

				// isBusy counts the number of responders, so it might have changed after takeOutResponder().
				if (!asynchResponders.isBusy()) {
					callbackMethod();
				} else {
					//logger.notice("waiting for " + asynch.length + " responders to " + behavior);
				}
			}
		};
		// TRANSITION NAMESPACE END

		// HIDDEN NAMESPACE START
		this._hidden.hasResponder = function(responder) {
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
		};

		this._hidden.getStatusByResponder = function() {
			return this._statusByResponder;
		};

		this._hidden.getStatus = function(responder) {
			return this._statusByResponder[responder];
		};

		this._hidden.getKnownPaths = function() {
			var list = {},
				path,
				knownPaths = [];

			list[this._defaultState.getPath()] = true;

			for (path in this._responders.showByPath) {
				list[new navigatorjs.NavigationState(path).getPath()] = true;
			}

			for (path in list) {
				knownPaths.push(path);
			}

			knownPaths.sort();
			return knownPaths;
		};
		// HIDDEN NAMESPACE END

		// VALIDATION NAMESPACE START
		this._validation.notifyValidationPrepared = function(validatorResponder, truncatedState, fullState) {
			// If the takeOutResponder() method returns false, it was not in the responder list to begin with.
			// This happens if a second navigation state is requested before the async validation preparation of the first completes.
			if (this._validatingAsynchResponders.takeOutResponder(validatorResponder)) {
				if (validatorResponder.validate(truncatedState, fullState)) {
					this._asyncValidated = true;
				} else {
					//logger.warn("Asynchronously invalidated by " + validatorResponder);
					this._asyncInvalidated = true;

					if (this._implementsInterface(validatorResponder, "IHasStateRedirection")) {
						this._inlineRedirection = validatorResponder.redirect(truncatedState, fullState);
					}
				}

				if (!this._validatingAsynchResponders.isBusy()) {
					this._performRequestCascade(fullState, false);
				} else {
					//logger.notice("Waiting for " + _validatingAsynchResponders.length + " validators to prepare");
				}
			} else {
				// ignore async preparations of former requests.
			}
		};
		// VALIDATION NAMESPACE END

		this._validate = function(stateToValidate, allowRedirection, allowAsyncValidation) {
			var allowRedirection = allowRedirection==undefined ? true : allowRedirection,
				allowAsyncValidation = allowAsyncValidation==undefined ? true : allowAsyncValidation,
				unvalidatedState = stateToValidate,
				implicit,
				invalidated = false,
				validated = false,
				path,
				state,
				remainderState,
				validateByPathList,
				index,
				responder,
				validatorResponder;

			// check to see if there are still wildcards left
			if (unvalidatedState.hasWildcard()) {
				// throw new Error("validateState: Requested states may not contain wildcards " + NavigationState.WILDCARD);
				return false;
			}

			if (unvalidatedState.equals(this._defaultState)) {
				return true;
			}

			if (allowAsyncValidation) {
				// This conditional is only true if we enter the validation the first (synchronous) time.
				this._asyncValidationOccurred = false;
				this._asyncInvalidated = false;
				this._asyncValidated = false;

				// reset asynchronous validation for every new state.
				this._validatingAsynchResponders = new navigatorjs.AsynchResponders();
			}

			implicit = this._validateImplicitly(unvalidatedState);

			for (path in this._responders.validateByPath) {
				// create a state object for comparison:
				state = new navigatorjs.NavigationState(path);

				if (unvalidatedState.contains(state)) {
					remainderState = unvalidatedState.subtract(state);

					// the lookup path is contained by the new state.
					validateByPathList = this._responders.validateByPath[path];

					this._initializeIfNeccessary(validateByPathList);

					if (allowAsyncValidation) {
						// check for async validators first. If this does not
						for(index=0;index<validateByPathList.length;index++) {
							responder = validateByPathList[index];

							// check for optional validation
							if (this._implementsInterface(responder, "IHasStateValidationOptional") && !responder.willValidate(remainderState, unvalidatedState)) {
								continue;
							}

							if (this._implementsInterface(responder, "IHasStateValidationAsync")) {
								this._asyncValidationOccurred = true;
								this._validatingAsynchResponders.addResponder(responder);
								//logger.notice("Preparing validation (total of " + this._validatingAsynchResponders.length + ")");

								//use namespace validation;
								responder.prepareValidation(remainderState, unvalidatedState, new navigatorjs.transition.ValidationPreparedDelegate(responder, remainderState, unvalidatedState, this, this._validation).call);
							}
						}

						if (this._asyncValidationOccurred) {
							//						//  If there are active async validators, stop the validation chain and wait for the prepration to finish.
							// if (_validating.isBusy()) return false;
							// if (_asyncValidationOccurred && (_asyncValidated || _asyncInvalidated) {
							// async validation was instantaneous, which means that the validation was approved or denied elsewhere
							// in the stack. this method should return false any which way.
							return false;
						}
					}

					// check regular validators
					//for each (responder in list) {
					for(index=0;index<validateByPathList.length;index++) {
						responder = validateByPathList[index];
						// skip async validators, we handled them a few lines back.
						if (this._implementsInterface(responder, "IHasStateValidationAsync")) continue;

						// check for optional validation
						if (this._implementsInterface(responder, "IHasStateValidationOptional") && !responder.willValidate(remainderState, unvalidatedState)) {
							continue;
						}

						if (responder.validate(remainderState, unvalidatedState)) {
							validated = true;
						} else {
							//logger.warn("Invalidated by validator: " + responder);
							invalidated = true;

							if (allowRedirection && this._implementsInterface(responder, "IHasStateRedirection")) {
								this._inlineRedirection = responder.redirect(remainderState, unvalidatedState);
							}
						}
					}
				}
			}

			if (this._validatingAsynchResponders.isBusy()) {
				// the request cascade will double check the asynch validators and act accordingly.
				return false;
			}

			// invalidation overrules any validation
			if (invalidated || this._asyncInvalidated) {
				return false;
			}

			if (validated || this._asyncValidated) {
				return true;
			}

			if (!implicit) {
				//logger.warn("Validation failed. No validators or transitions matched the requested " + unvalidatedState);
			}

			return implicit;
		};

		this._validateImplicitly = function(state) {
			var path;
			for (path in this._responders.showByPath) {
				if (new navigatorjs.NavigationState(path).equals(state)) {
					// info("Validation passed based on transition responder.");
					return true;
				}
			}

			return false;
		};

		this._getRespondersToShow = function() {
			var respondersToShow = this._getResponderList(this._responders.showByPath, this._currentState),
				respondersToHide = this._getResponderList(this._responders.hideByPath, this._currentState),
				index,
				hideResponder,
				hideIndex;

			// remove elements from the toShow list, if they are in the toHide list.
//			for each (var hide : IHasStateTransition in toHide) {
			for(index=0;index<respondersToHide.length;index++) {
				hideResponder = respondersToHide[index];
				hideIndex = respondersToShow.indexOf(hideResponder);
				if (hideIndex >= 0) {
					respondersToShow.splice(hideIndex, 1);
				}
			}

			return respondersToShow;
		};

		this._initializeIfNeccessary = function(responderList) {
			var index, responder;
//			for each (var responder : INavigationResponder in responderList) {
			for(index=0;index<responderList.length;index++) {
				responder = responderList[index];
				if (this._statusByResponder[responder] == navigatorjs.transition.TransitionStatus.UNINITIALIZED && this._implementsInterface(responder, "IHasStateInitialization")) {
					// first initialize the responder.
					responder.initialize();
					this._statusByResponder[responder] = navigatorjs.transition.TransitionStatus.INITIALIZED;
				}
			}
		};

		this._getResponderList = function(listObj, state) {
			var responders = [],
				path;

			for (path in listObj) {
				if (state.contains(new navigatorjs.NavigationState(path))) {
					responders = responders.concat(listObj[path]);
				}
			}

			return responders;
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

		registerRedirect: function(fromStateOrPath, toStateOrPath) {
			this._redirects = this._redirects || {};
			this._redirects[navigatorjs.NavigationState.make(fromStateOrPath).getPath()] = navigatorjs.NavigationState.make(toStateOrPath);
		},

		start: function(defaultStateOrPath, startStateOrPath) {
			this._defaultState = navigatorjs.NavigationState.make(defaultStateOrPath || "");

			this.request(startStateOrPath || this._defaultState);
		},

		request: function(pathOrState) {
			if (pathOrState == null) {
				//logger.error("Requested a null state. Aborting request.");
				return;
			}

			var requestedState,
				path,
				fromState,
				toState;

			// Store and possibly mask the requested state
			requestedState = navigatorjs.NavigationState.make(pathOrState);
			if (requestedState.hasWildcard()) {
				requestedState = requestedState.mask(this._currentState || this._defaultState);
			}

			// Check for exact match of the requested and the current state
			if (this._currentState && this._currentState.getPath() == requestedState.getPath()) {
				//logger.info("Already at the requested state: " + requested);
				return;
			}

			if (this._redirects) {
				for (path in this._redirects) {
					fromState = new navigatorjs.NavigationState(path);
					if (fromState.equals(requestedState)) {
						toState = navigatorjs.NavigationState(this._redirects[path]);
						//logger.info("Redirecting " + from + " to " + to);
						this.request(toState);
						return;
					}
				}
			}

			// this event makes it possible to add responders just in time to participate in the validation process.
			this._$eventDispatcher.trigger(navigatorjs.NavigatorEvent.STATE_REQUESTED, {state:requestedState});

			// Inline redirection is reset with every request call.
			// It can be changed by a responder implementing the IHasStateRedirection interface.
			this._inlineRedirectionState = null;

			this._performRequestCascade(requestedState);
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

		isTransitioning: function() {
			return this._isTransitioning;
		},

		on: function() {

		},

		off: function() {

		}
	};

	navigatorjs.Navigator = Navigator;
}());