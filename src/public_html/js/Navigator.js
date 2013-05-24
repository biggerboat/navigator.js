this.navigatorjs = this.navigatorjs||{};

(function() {
	//
	var _$eventDispatcher = $({});
	//internal namespaces
	var _flow = {};
	var _transition = {};
	var _validation = {};
	var _hidden = {};
	//
	var _currentState = null;
	var _previousState = null;
	var _defaultState = null;
	var _isTransitioning = false;
	//
	var _responders = new navigatorjs.ResponderLists();
	var _respondersByID = {};
	var _statusByResponderID = {};
	var _redirects = null;
	var _disappearingAsynchResponders = null;
	var _appearingAsynchResponders = null;
	var _swappingAsynchResponders = null;
	var _validatingAsynchResponders = null;
	var _inlineRedirectionState = null;
	//
	var _asyncInvalidated = false;
	var _asyncValidated = false;
	var _asyncValidationOccurred = false;
	var _responderIDCount = 0;

	var _modify = function(addition, responder, pathsOrStates, behaviorString) {
		if (_relayModification(addition, responder, pathsOrStates, behaviorString)) return;

		// Using the path variable as dictionary key to break instance referencing.
		var path = navigatorjs.NavigationState.make(pathsOrStates).getPath(),
			list, matchingInterface;

		// Create, store and retrieve the list that matches the desired behavior.
		switch(behaviorString) {
			case navigatorjs.NavigationBehaviors.SHOW:
				matchingInterface = "IHasStateTransition";
				list = _responders.showByPath[path] = _responders.showByPath[path] || [];
				break;
			case navigatorjs.NavigationBehaviors.HIDE:
				matchingInterface = "IHasStateTransition";
				list = _responders.hideByPath[path] = _responders.hideByPath[path] || [];
				break;
			case navigatorjs.NavigationBehaviors.VALIDATE:
				matchingInterface = "IHasStateValidation";
				list = _responders.validateByPath[path] = _responders.validateByPath[path] || [];
				break;
			case navigatorjs.NavigationBehaviors.UPDATE:
				matchingInterface = "IHasStateUpdate";
				list = _responders.updateByPath[path] = _responders.updateByPath[path] || [];
				break;
			case navigatorjs.NavigationBehaviors.SWAP:
				matchingInterface = "IHasStateSwap";
				list = _responders.swapByPath[path] = _responders.swapByPath[path] || [];
				break;
			default:
				throw new Error("Unknown behavior: " + behaviorString);
		}

		//TODO: Build in more strict validation?
		if (!navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, matchingInterface)) {
			throw new Error("Responder " + responder + " should implement " + matchingInterface + " to respond to " + behaviorString);
		}
		if (addition) {
			// add
			if (list.indexOf(responder) < 0) {
				list.push(responder);

				if(responder.__navigatorjs == undefined ) {
					//Create new hidden navigatorjs data
					_responderIDCount++;
					responder.__navigatorjs = {id:_responderIDCount};
					_respondersByID[responder.__navigatorjs.id] = responder;
				}

				// If the responder has no status yet, initialize it to UNINITIALIZED:
				_statusByResponderID[responder.__navigatorjs.id] = _statusByResponderID[responder.__navigatorjs.id] || navigatorjs.transition.TransitionStatus.UNINITIALIZED;
			} else {
				return;
			}
		} else {
			// remove
			var index = list.indexOf(responder);
			if (index >= 0) {
				list.splice(index, 1);

				delete _statusByResponderID[responder.__navigatorjs.id];
				delete _respondersByID[responder.__navigatorjs.id];
			} else {
				return;
			}

			if (matchingInterface == "IHasStateSwap" && _responders.swappedBefore[responder]) {
				// cleanup after the special swap case
				delete _responders.swappedBefore[responder];
			}
		}

		_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponderID:_statusByResponderID, respondersByID:_respondersByID});
	};

	var _relayModification = function(addition, responder, pathsOrStates, behaviorString) {
		if (!responder) {
			throw new Error("add: responder is null");
		}

		var index, length;

		if (pathsOrStates instanceof Array) {
			length = pathsOrStates.length;
			for (index=0;index<length;index++) {
				_modify(addition, responder, pathsOrStates[index], behaviorString);
			}
			return true;
		}

		behaviorString = behaviorString || navigatorjs.NavigationBehaviors.AUTO;
		if (behaviorString == navigatorjs.NavigationBehaviors.AUTO) {
			length = navigatorjs.NavigationBehaviors.ALL_AUTO.length;
			for (index=0;index<length;index++) {
				try {
					_modify(addition, responder, pathsOrStates, navigatorjs.NavigationBehaviors.ALL_AUTO[index]);
				} catch(e) {
					// ignore 'should implement xyz' errors
				}
			}
			return true;
		}

		return false;
	};

	var _performRequestCascade = function(requestedState, startAsyncValidation) {
		if (!_defaultState) { throw new Error("No default state set. Call start() before the first request!"); }
		// Request cascade starts here.
		//
		if (requestedState.getPath() == _defaultState.getPath() && !_defaultState.hasWildcard()) {
			// Exact match on default state bypasses validation.
			_grantRequest(_defaultState);
		} else if (_asyncValidationOccurred && (_asyncValidated && !_asyncInvalidated)) {
			// Async operation completed
			_grantRequest(requestedState);
		} else if (_validate(requestedState, true, startAsyncValidation)) {
			// Any other state needs to be validated.
			_grantRequest(requestedState);
		} else if (_validatingAsynchResponders && _validatingAsynchResponders.isBusy()) {
			// Waiting for async validation.
			// FIXME: What do we do in the mean time, dispatch an event or sth?
			//logger.notice("waiting for async validation to complete");
		} else if (startAsyncValidation && _asyncValidationOccurred) {
			// any async prepration happened instantaneuously
		} else if (_inlineRedirectionState) {
			this.request(_inlineRedirectionState);
		} else if (_currentState) {
			// If validation fails, the notifyStateChange() is called with the current state as a parameter,
			// mainly for subclasses to respond to the blocked navigation (e.g. SWFAddress).
			_notifyStateChange(_currentState);
		} else if (requestedState.hasWildcard()) {
			// If we get here, after validateWithWildcards has failed, this means there are still
			// wildcards in the requested state that didn't match the previous state. This,
			// unfortunately means your application has a logic error. Go fix it!
			throw new Error("Check wildcard masking: " + requestedState.getPath());
		} else if (_defaultState) {
			// If all else fails, we'll put up the default state.
			_grantRequest(_defaultState);
		} else {
			// If you don't provide a default state, at least make sure your first request makes sense!
			throw new Error("First request is invalid: " + requestedState.getPath());
		}
	};

	var _grantRequest = function(state) {
		_asyncInvalidated = false;
		_asyncValidated = false;
		_previousState = _currentState;
		_currentState = state;

		_notifyStateChange(_currentState);

		_flow.startTransition();
	};

	var _notifyStateChange = function(state) {
		//logger.notice(state);

		// Do call the super.notifyStateChange() when overriding.
		if (state != _previousState) {
			_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.STATE_CHANGED, {statusByResponderID:_statusByResponderID, respondersByID:_respondersByID, state:_currentState});
		}
	};

	// FLOW NAMESPACE START
	_flow.startTransition = function() {
		_isTransitioning = true;
		_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STARTED);

		_disappearingAsynchResponders = new navigatorjs.AsynchResponders();
		_disappearingAsynchResponders.addResponders(_flow.transitionOut());

		if (!_disappearingAsynchResponders.isBusy()) {
			_flow.performUpdates();
		}
	};

	_flow.transitionOut = function() {
		var respondersToShow = _getRespondersToShow(),
			responderID,
			responder,
			waitForResponders = [],
			index;

		// This initialize call is to catch responders that were put on stage to show,
		// yet still need to wait for async out transitions before they actually transition in.
		_initializeIfNeccessary(respondersToShow);

		for (responderID in _statusByResponderID) {
			responder = _respondersByID[responderID];
			if (respondersToShow.indexOf(responder) ==-1) {
				// if the responder is not already hidden or disappearing, trigger the transitionOut:
				if (navigatorjs.transition.TransitionStatus.HIDDEN < _statusByResponderID[responderID] && _statusByResponderID[responderID] < navigatorjs.transition.TransitionStatus.DISAPPEARING) {
					_statusByResponderID[responderID] = navigatorjs.transition.TransitionStatus.DISAPPEARING;
					waitForResponders.push(responder);

					//use namespace transition;
					//console.log('_flow -> transitionOut', responder);
					responder.transitionOut(new navigatorjs.transition.TransitionCompleteDelegate(responder, navigatorjs.transition.TransitionStatus.HIDDEN, navigatorjs.NavigationBehaviors.HIDE, this, _transition).call);
				} else {
					// already hidden or hiding
				}
			}
		}

		// loop backwards so we can splice elements off the array while in the loop.
		for (index = waitForResponders.length; --index >= 0;) {
			if (_statusByResponderID[waitForResponders[index].__navigatorjs.id] == navigatorjs.transition.TransitionStatus.HIDDEN) {
				waitForResponders.splice(index, 1);
			}
		}

		if (waitForResponders.length>0) {
			_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponderID:_statusByResponderID, respondersByID:_respondersByID});
		}

		return waitForResponders;
	};

	_flow.performUpdates = function() {
		_disappearingAsynchResponders.reset();

		var path, state, list, index, responder;

		for (path in _responders.updateByPath) {
			// create a state object for comparison:
			state = new navigatorjs.NavigationState(path);

			if (_currentState.contains(state)) {
				// the lookup path is contained by the new state.
				list = _responders.updateByPath[path];

				_initializeIfNeccessary(list);

				// check for existing validators.
				for(index=0;index<list.length;index++) {
					responder = list[index];
					responder.updateState(_currentState.subtract(state), _currentState);
				}
			}
		}

		_flow.startTransitionIn();
	};

	_flow.startTransitionIn = function() {
		_appearingAsynchResponders = new navigatorjs.AsynchResponders();
		_appearingAsynchResponders.addResponders(_flow.transitionIn());

		if (!_appearingAsynchResponders.isBusy()) {
			_flow.startSwapOut();
		}
	};

	_flow.transitionIn = function() {
		var respondersToShow = _getRespondersToShow(),
			respondersToWaitFor = [],
			responder,
			status,
			index;

		_initializeIfNeccessary(respondersToShow);

		//for each (var responder : IHasStateTransition in respondersToShow) {
		for(index=0;index<respondersToShow.length;index++) {
			responder = respondersToShow[index];
			status = _statusByResponderID[responder.__navigatorjs.id];

			if (status < navigatorjs.transition.TransitionStatus.APPEARING || navigatorjs.transition.TransitionStatus.SHOWN < status) {
				// then continue with the transitionIn() call.
				_statusByResponderID[responder.__navigatorjs.id] = navigatorjs.transition.TransitionStatus.APPEARING;
				respondersToWaitFor.push(responder);

				//use namespace transition;
				responder.transitionIn(new navigatorjs.transition.TransitionCompleteDelegate(responder, navigatorjs.transition.TransitionStatus.SHOWN, navigatorjs.NavigationBehaviors.SHOW, this, _transition).call);
			}
		}

		// loop backwards so we can splice elements off the array while in the loop.
		for (index = respondersToWaitFor.length;--index >= 0;) {
			if (_statusByResponderID[respondersToWaitFor[index].__navigatorjs.id] == navigatorjs.transition.TransitionStatus.SHOWN) {
				respondersToWaitFor.splice(index, 1);
			}
		}

		if (respondersToWaitFor.length>0) {
			_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponderID:_statusByResponderID, respondersByID:_respondersByID});
		}

		return respondersToWaitFor;
	};

	_flow.startSwapOut = function() {
		_swappingAsynchResponders = new navigatorjs.AsynchResponders();
		_swappingAsynchResponders.addResponders(_flow.swapOut());

		if (!_swappingAsynchResponders.isBusy()) {
			_flow.swapIn();
		}
	};

	_flow.swapOut = function() {
		_appearingAsynchResponders.reset();

		var waitForResponders = [],
			path, state,
			swapByPathList,
			responder,
			index,
			truncatedState;

		for (path in _responders.swapByPath) {
			// create a state object for comparison:
			state = new navigatorjs.NavigationState(path);

			if (_currentState.contains(state)) {
				// the lookup path is contained by the new state.
				swapByPathList = _responders.swapByPath[path];

				_initializeIfNeccessary(swapByPathList);

				// check for existing swaps.
				for(index=0;index<swapByPathList.length;index++) {
					responder = swapByPathList[index];
					if (!_responders.swappedBefore[responder])
						continue;

					truncatedState = _currentState.subtract(state);
					if (responder.willSwapToState(truncatedState, _currentState)) {
						_statusByResponderID[responder.__navigatorjs.id] = navigatorjs.transition.TransitionStatus.SWAPPING;
						waitForResponders.push(responder);

						//use namespace transition;
						responder.swapOut(new navigatorjs.TransitionCompleteDelegate(responder, navigatorjs.transition.TransitionStatus.SHOWN, navigatorjs.transition.NavigationBehaviors.SWAP, this, _transition).call);
					}
				}
			}
		}

		// loop backwards so we can splice elements off the array while in the loop.
		for (index = waitForResponders.length;--index >= 0;) {
			if (_statusByResponderID[waitForResponders[index].__navigatorjs.id] == navigatorjs.transition.TransitionStatus.SHOWN) {
				waitForResponders.splice(index, 1);
			}
		}

		if (waitForResponders.length>0) {
			_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponderID:_statusByResponderID, respondersByID:_respondersByID});
		}

		return waitForResponders;
	};

	_flow.swapIn = function() {
		_swappingAsynchResponders.reset();

		var path,
			state,
			swapByPathList,
			responder,
			truncatedState,
			index;

		for (path in _responders.swapByPath) {
			// create a state object for comparison:
			state = new navigatorjs.NavigationState(path);

			if (_currentState.contains(state)) {
				// the lookup path is contained by the new state.
				swapByPathList = _responders.swapByPath[path];

				_initializeIfNeccessary(swapByPathList);

				// check for existing swaps.
				//for each (var responder : IHasStateSwap in swapByPathList) {
				for(index=0;index<swapByPathList.length;index++) {
					responder = swapByPathList[index];
					truncatedState = _currentState.subtract(state);
					if (responder.willSwapToState(truncatedState, _currentState)) {
						_responders.swappedBefore[responder] = true;
						responder.swapIn(truncatedState, _currentState);
					}
				}
			}
		}

		_flow.finishTransition();
	};

	_flow.finishTransition = function() {
		_isTransitioning = false;
		_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_FINISHED);
	};
	// FLOW NAMESPACE END

	// TRANSITION NAMESPACE START
	_transition.notifyComplete = function(responder, status, behavior) {
		if (_statusByResponderID[responder.__navigatorjs.id]) {
			_statusByResponderID[responder.__navigatorjs.id] = status;
			_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, {statusByResponderID:_statusByResponderID, respondersByID:_respondersByID});
		}

		var asynchResponders,
			callbackMethod;

		switch(behavior) {
			case navigatorjs.NavigationBehaviors.HIDE:
				asynchResponders = _disappearingAsynchResponders;
				callbackMethod = _flow.performUpdates;
				break;
			case navigatorjs.NavigationBehaviors.SHOW:
				asynchResponders = _appearingAsynchResponders;
				callbackMethod = _flow.startSwapOut;
				break;
			case navigatorjs.NavigationBehaviors.SWAP:
				asynchResponders = _swappingAsynchResponders;
				callbackMethod = _flow.swapIn;
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
	_hidden.hasResponder = function(responder) {
		if (_statusByResponderID[responder.__navigatorjs.id]) {return true;}

		var respondersByPath,
			existingResponders,
			i, j;

		for (i=0;i<_responders.all.length;i++) {
			respondersByPath = _responders.all[i];
			for (j=0;j<respondersByPath.length;j++) {
				existingResponders = respondersByPath[j];
				if (existingResponders.indexOf(responder) >= 0) {return true;}
			}
		}

		return false;
	};

	_hidden.getStatusByResponderID = function() {
		return _statusByResponderID;
	};

	_hidden.getRespondersByID = function() {
		return _respondersByID;
	};

	_hidden.getStatus = function(responder) {
		return _statusByResponderID[responder.__navigatorjs.id];
	};

	_hidden.getKnownPaths = function() {
		var list = {},
			path,
			knownPaths = [];

		list[_defaultState.getPath()] = true;

		for (path in _responders.showByPath) {
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
	_validation.notifyValidationPrepared = function(validatorResponder, truncatedState, fullState) {
		// If the takeOutResponder() method returns false, it was not in the responder list to begin with.
		// This happens if a second navigation state is requested before the async validation preparation of the first completes.
		if (_validatingAsynchResponders.takeOutResponder(validatorResponder)) {
			if (validatorResponder.validate(truncatedState, fullState)) {
				_asyncValidated = true;
			} else {
				//logger.warn("Asynchronously invalidated by " + validatorResponder);
				_asyncInvalidated = true;

				if (navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(validatorResponder, "IHasStateRedirection")) {
					_inlineRedirectionState = validatorResponder.redirect(truncatedState, fullState);
				}
			}

			if (!_validatingAsynchResponders.isBusy()) {
				_performRequestCascade(fullState, false);
			} else {
				//logger.notice("Waiting for " + _validatingAsynchResponders.length + " validators to prepare");
			}
		} else {
			// ignore async preparations of former requests.
		}
	};
	// VALIDATION NAMESPACE END

	var _validate = function(stateToValidate, allowRedirection, allowAsyncValidation) {
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

		if (unvalidatedState.equals(_defaultState)) {
			return true;
		}

		if (allowAsyncValidation) {
			// This conditional is only true if we enter the validation the first (synchronous) time.
			_asyncValidationOccurred = false;
			_asyncInvalidated = false;
			_asyncValidated = false;

			// reset asynchronous validation for every new state.
			_validatingAsynchResponders = new navigatorjs.AsynchResponders();
		}

		implicit = _validateImplicitly(unvalidatedState);

		for (path in _responders.validateByPath) {
			// create a state object for comparison:
			state = new navigatorjs.NavigationState(path);

			if (unvalidatedState.contains(state)) {
				remainderState = unvalidatedState.subtract(state);

				// the lookup path is contained by the new state.
				validateByPathList = _responders.validateByPath[path];

				_initializeIfNeccessary(validateByPathList);

				if (allowAsyncValidation) {
					// check for async validators first. If this does not
					for(index=0;index<validateByPathList.length;index++) {
						responder = validateByPathList[index];

						// check for optional validation
						if (navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateValidationOptional") && !responder.willValidate(remainderState, unvalidatedState)) {
							continue;
						}

						if (navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateValidationAsync")) {
							_asyncValidationOccurred = true;
							_validatingAsynchResponders.addResponder(responder);
							//logger.notice("Preparing validation (total of " + _validatingAsynchResponders.length + ")");

							//use namespace validation;
							responder.prepareValidation(remainderState, unvalidatedState, new navigatorjs.transition.ValidationPreparedDelegate(responder, remainderState, unvalidatedState, this, _validation).call);
						}
					}

					if (_asyncValidationOccurred) {
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
					if (navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateValidationAsync")) continue;

					// check for optional validation
					if (navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateValidationOptional") && !responder.willValidate(remainderState, unvalidatedState)) {
						continue;
					}

					if (responder.validate(remainderState, unvalidatedState)) {
						validated = true;
					} else {
						//logger.warn("Invalidated by validator: " + responder);
						invalidated = true;

						if (allowRedirection && navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateRedirection")) {
							_inlineRedirectionState = responder.redirect(remainderState, unvalidatedState);
						}
					}
				}
			}
		}

		if (_validatingAsynchResponders.isBusy()) {
			// the request cascade will double check the asynch validators and act accordingly.
			return false;
		}

		// invalidation overrules any validation
		if (invalidated || _asyncInvalidated) {
			return false;
		}

		if (validated || _asyncValidated) {
			return true;
		}

		if (!implicit) {
			//logger.warn("Validation failed. No validators or transitions matched the requested " + unvalidatedState);
		}

		return implicit;
	};

	var _validateImplicitly = function(state) {
		var path;
		for (path in _responders.showByPath) {
			if (new navigatorjs.NavigationState(path).equals(state)) {
				// info("Validation passed based on transition responder.");
				return true;
			}
		}

		return false;
	};

	var _getRespondersToShow = function() {
		var respondersToShow = _getResponderList(_responders.showByPath, _currentState),
			respondersToHide = _getResponderList(_responders.hideByPath, _currentState),
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

	var _initializeIfNeccessary = function(responderList) {
		var index, responder;
//			for each (var responder : INavigationResponder in responderList) {
		for(index=0;index<responderList.length;index++) {
			responder = responderList[index];
			if (_statusByResponderID[responder.__navigatorjs.id] == navigatorjs.transition.TransitionStatus.UNINITIALIZED && navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateInitialization")) {
				// first initialize the responder.
				responder.initialize();
				_statusByResponderID[responder.__navigatorjs.id] = navigatorjs.transition.TransitionStatus.INITIALIZED;
			}
		}
	};

	var _getResponderList = function(listObj, state) {
		var responders = [],
			path;

		for (path in listObj) {
			if (state.contains(new navigatorjs.NavigationState(path))) {
				responders = responders.concat(listObj[path]);
			}
		}

		return responders;
	};

	var Navigator = function () {
		navigatorjs.utils.AutoBind(this, this);
	};


	//PUBLIC API
	Navigator.prototype = {
		add: function(responder, pathsOrStates, behaviorString) {
			_modify(true, responder, pathsOrStates, behaviorString);
		},

		remove: function(responder, pathsOrStates, behaviorString) {
			_modify(false, responder, pathsOrStates, behaviorString);
		},

		registerRedirect: function(fromStateOrPath, toStateOrPath) {
			_redirects = _redirects || {};
			_redirects[navigatorjs.NavigationState.make(fromStateOrPath).getPath()] = navigatorjs.NavigationState.make(toStateOrPath);
		},

		start: function(defaultStateOrPath, startStateOrPath) {
			_defaultState = navigatorjs.NavigationState.make(defaultStateOrPath || "");

			this.request(startStateOrPath || _defaultState);
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
				requestedState = requestedState.mask(_currentState || _defaultState);
			}

			// Check for exact match of the requested and the current state
			if (_currentState && _currentState.getPath() == requestedState.getPath()) {
				//logger.info("Already at the requested state: " + requested);
				return;
			}

			if (_redirects) {
				for (path in _redirects) {
					fromState = new navigatorjs.NavigationState(path);
					if (fromState.equals(requestedState)) {
						toState = navigatorjs.NavigationState(_redirects[path]);
						//logger.info("Redirecting " + from + " to " + to);
						this.request(toState);
						return;
					}
				}
			}

			// this event makes it possible to add responders just in time to participate in the validation process.
			_$eventDispatcher.trigger(navigatorjs.NavigatorEvent.STATE_REQUESTED, {state:requestedState});

			// Inline redirection is reset with every request call.
			// It can be changed by a responder implementing the IHasStateRedirection interface.
			_inlineRedirectionState = null;

			_performRequestCascade(requestedState);
		},

		getCurrentState: function() {
			if(!_currentState) {
				if(_defaultState) {
					return _defaultState.clone();
				}

				return null;
			}

			return _currentState.clone();
		},

		isTransitioning: function() {
			return _isTransitioning;
		},

		on: function(event,handler) {
			_$eventDispatcher.on(event, handler);
			return this;
		},

		off: function(event, handler) {
			_$eventDispatcher.off(event, handler);
			return this;
		}
	};

	navigatorjs.Navigator = Navigator;
}());