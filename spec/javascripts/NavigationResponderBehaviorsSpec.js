describe("Navigator responder behavior/interface validation", function() {

	function delayedExpect(testRunner,delay) {
		delay = delay || 1;
		var delayReached = false;
		setTimeout(function() {
			delayReached = true;
		}, delay);

		waitsFor(function() {
			return delayReached;
		}, "Waiting for delay", delay * 2);//Travis CI hack? Else it will complain about giving a timeout

		runs(testRunner);
	}

	beforeEach(function() {
	});

	describe("Retrieving interface inheritance chain", function() {
		it("Returns an empty array when no interface argument is supplied", function() {
			var interfaces = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain();
			expect(interfaces).toEqual([]);
		});

		it("Returns an array of one element that is equal to the input when just a toplevel (IHasStateInitialization) interface is defined", function() {
			var interfaces = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain("IHasStateInitialization");
			expect(interfaces).toEqual(["IHasStateInitialization"]);
		});

		it("Returns an empty array when an invalid interface argument is supplied", function() {
			var interfaces = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain("IHasInvalidStateInitialization");
			expect(interfaces).toEqual([]);
		});

		it("Returns an empty array when a method (getInterfaceInheritanceChain) as the interface argument is supplied", function() {
			var interfaces = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain("getInterfaceInheritanceChain");
			expect(interfaces).toEqual([]);
		});

		it("Returns simple inheritance chain", function() {
			var interfaces = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain("IHasStateValidationOptional");
			expect(interfaces).toEqual(["IHasStateValidationOptional", "IHasStateValidation"]);
		});

		it("Returns an advanced inheritance chain and filters out duplicate interfaces", function() {
			var interfaces = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain("IHasStateValidationOptionalAsync");
			expect(interfaces).toEqual(["IHasStateValidationOptionalAsync", "IHasStateValidationAsync", "IHasStateValidation", "IHasStateValidationOptional"]);
		});
	});

	describe("Retrieving methods by interface", function() {
		it("Returns no methods for an invalid interface", function() {
			var methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods([]);
			expect(methods).toEqual([]);

			methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods();
			expect(methods).toEqual([]);

			methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(["NonExistingInterface"]);
			expect(methods).toEqual([]);
		});

		it("Returns a list of unique methods within a simple inheritance chain", function() {
			var methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(["IHasStateInitialization"]);
			expect(methods).toEqual(["initializeByNavigator"]);
		});

		it("Returns a list of unique methods within an advanced inheritance chain", function() {
			var methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(["IHasStateValidationOptionalAsync"]);
			expect(methods).toEqual(["prepareValidation", "validate", "willValidate"]);
		});

		it("Returns a list of unique methods within a list of multiple interfaces and advanced inheritance chain", function() {
			var methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(["IHasStateInitialization", "IHasStateValidationOptionalAsync"]);
			expect(methods).toEqual(["initializeByNavigator", "prepareValidation", "validate", "willValidate"]);
		});
	});

	describe("Validate interface implementation", function() {

		it("Has state initialization but no state transition", function() {
			var object = {
				navigatorBehaviors: ["IHasStateInitialization"],
				initializeByNavigator: function() {}
			};

			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateInitialization")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateTransition")).toBeFalsy();
		});

		it("Has state transition but no state initialization", function() {
			var object = {
				navigatorBehaviors: ["IHasStateTransition"],
				transitionIn: function(callOnComplete) {},
				transitionOut: function(callOnComplete) {}
			};
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateTransition")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateInitialization")).toBeFalsy();
		});

		it("Checks inherited behaviours", function() {
			var object = {
				navigatorBehaviors: ["IHasStateValidationOptional"],
				validate: function(truncatedState, fullState) {}, //IHasStateValidation, IHasStateValidationAsync, IHasStateValidationOptional, IHasStateValidationOptionalAsync, IHasStateRedirection
				willValidate: function(truncatedState, fullState) {/*return bool*/} //IHasStateValidationOptional, IHasStateValidationOptionalAsync
			};

			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationOptional")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidation")).toBeTruthy();
		});

		it("Has implemented all behaviors", function() {
			var object = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateValidation", "IHasStateValidationAsync", "IHasStateValidationOptional", "IHasStateValidationOptionalAsync", "IHasStateRedirection", "IHasStateSwap", "IHasStateTransition", "IHasStateUpdate"],

				initializeByNavigator: function() {}, //IHasStateInitialization
				validate: function(truncatedState, fullState) {/*return bool*/}, //IHasStateValidation, IHasStateValidationAsync, IHasStateValidationOptional, IHasStateValidationOptionalAsync, IHasStateRedirection
				prepareValidation: function(truncatedState, fullState, callOnPrepared) {}, //IHasStateValidationAsync, IHasStateValidationOptionalAsync
				willValidate: function(truncatedState, fullState) {/*return bool*/}, //IHasStateValidationOptional, IHasStateValidationOptionalAsync
				redirect: function(truncatedState, fullState) {/*return NavigationState*/}, //IHasStateRedirection
				willSwapToState: function(truncatedState, fullState) {/*return bool*/}, //IHasStateSwap
				swapOut: function(callOnSwapOutComplete) {}, //IHasStateSwap
				swapIn: function(truncatedState, fullState) {}, //IHasStateSwap
				transitionIn: function(callOnComplete) {}, //IHasStateTransition
				transitionOut: function(callOnComplete) {}, //IHasStateTransition
				updateState: function(truncatedState, fullState) {} //IHasStateUpdate
			};

			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateInitialization")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidation")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationAsync")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationOptional")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationOptionalAsync")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateRedirection")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateSwap")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateTransition")).toBeTruthy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateUpdate")).toBeTruthy();
		});

		it("Doesn't validate when a behavior has a missing method", function() {
			var object = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateValidation", "IHasStateValidationAsync", "IHasStateValidationOptional", "IHasStateValidationOptionalAsync", "IHasStateRedirection", "IHasStateSwap", "IHasStateTransition", "IHasStateUpdate"]
			};

			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateInitialization")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidation")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationAsync")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationOptional")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateValidationOptionalAsync")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateRedirection")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateSwap")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateTransition")).toBeFalsy();
			expect(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(object, "IHasStateUpdate")).toBeFalsy();
		});

	});

	describe("navigator state flow integration", function() {

		var njs,
			Responder,
			responder;

		beforeEach(function() {
			njs = new navigatorjs.Navigator();
		});

		describe("initialization", function() {
			//TODO write tests for how this works. In current implementation IHasStateInitialization will only be called when it also implements one of the other interfaces
		});

		describe("transitions", function() {
			beforeEach(function() {
				Responder = function() {};
				Responder.prototype = {
					navigatorBehaviors: ["IHasStateTransition"],
					inCallComplete: null,
					outCallComplete: null,
					transitionIn: function(callOnComplete) {
						this.inCallComplete = callOnComplete;
					},

					transitionOut: function(callOnComplete) {
						this.outCallComplete = callOnComplete;
					}
				};

				responder = new Responder();

				spyOn(responder, 'transitionIn').andCallThrough();
				spyOn(responder, 'transitionOut').andCallThrough();

				njs.add({}, "/");
				njs.add(responder, "home");
			});

			it("calls the transitionIn method when entering the state", function() {
				njs.start("/");
				expect(responder.transitionIn).not.toHaveBeenCalled();
				njs.request("home");
				expect(responder.transitionIn).toHaveBeenCalled();
			});

			it("calls the transitionOut once we leave the mapped state", function() {
				njs.start("/");
				expect(responder.transitionOut).not.toHaveBeenCalled();
				njs.request("home");
				expect(responder.transitionOut).not.toHaveBeenCalled();
				njs.request("/");
				expect(responder.transitionOut).toHaveBeenCalled();
			});

			it("calls the transitionOut method despite of the transitionIn call to be completed", function() {
				njs.start("/");
				expect(responder.transitionOut).not.toHaveBeenCalled();
				njs.request("home");
				njs.request("/");
				expect(responder.transitionOut).toHaveBeenCalled();
			});

			it("doesn't call the transitionIn of a new state before the previous state has transitioned out", function() {
				var contact = new Responder();
				spyOn(contact, 'transitionIn').andCallThrough();
				spyOn(contact, 'transitionOut').andCallThrough();
				
				njs.add(contact, "contact");
				njs.start("/");
				njs.request("home");
				njs.request("contact");
				expect(contact.transitionIn).not.toHaveBeenCalled();
				responder.outCallComplete();
				expect(contact.transitionIn).toHaveBeenCalled();
			});

			it("it updates the currentState immediately, even though transitions are running", function() {
				njs.start("/");
				njs.request("home");
				expect(njs.getCurrentState().getPath()).toEqual('/home/');
				njs.request("/");
				expect(njs.getCurrentState().getPath()).toEqual('/');
			});
		});

		describe("redirection", function() {
			beforeEach(function() {
				Responder = function() {};
				Responder.prototype = {
					navigatorBehaviors: ["IHasStateRedirection"],

					validate: function(truncatedState, fullState) {
						return false;
					},

					redirect: function(truncatedState, fullState) {
						return new navigatorjs.NavigationState("contact");
					}
				};

				responder = new Responder();

				njs.add({}, "/");
			});

			it("redirects to another state", function() {
				njs.add({}, "contact");
				njs.add(responder, "home");
				njs.start("/");
				njs.request("home");
				expect(njs.getCurrentState().getPath()).toEqual('/contact/');
			});

			it("doesn't redirect when there is no responder for the state it redirects to", function() {
				njs.add(responder, "home");
				njs.start("/");
				njs.request("home");
				expect(njs.getCurrentState().getPath()).toEqual('/');
			});

			it("throws an error when it redirects to itself", function() {
				njs.add(responder, "contact");
				njs.start("/");

				expect(function() {njs.request("contact");}).toThrow();
			});

			it("doens't throw an error when we redirect to a substate, as long as the validate doesn't return false for the substate", function() {
				responder.validate = function(truncatedState, fullState) { return !fullState.equals('home')};
				responder.redirect = function(truncatedState, fullState) {return new navigatorjs.NavigationState("home/test")};
				njs.add(responder, "home");
				njs.add({}, "home/test");
				njs.start("/");
				expect(function() {njs.request("home");}).not.toThrow();
				expect(njs.getCurrentState().getPath()).toEqual('/home/test/');
			});

			it("is ignored when a native navigatorjs redirect is known", function() {
				njs.add({}, "contact");
				njs.add({}, "about");
				njs.add(responder, "home");
				njs.registerRedirect("home", "about");
				njs.start("/");
				njs.request("home");
				expect(njs.getCurrentState().getPath()).toEqual('/about/');
			});

			it("can chain redirects", function() {
				var contact = new Responder();
				contact.redirect = function(truncatedState, fullState) {return new navigatorjs.NavigationState("about")};

				njs.add(contact, "contact");
				njs.add({}, "about");
				njs.add(responder, "home");
				njs.start("/");
				njs.request("home");
				expect(njs.getCurrentState().getPath()).toEqual('/about/');
			});

			it("can chain with native redirects", function() {
				njs.add({}, "about");
				njs.add(responder, "home");
				njs.registerRedirect("contact", "about");
				njs.start("/");
				njs.request("home");
				expect(njs.getCurrentState().getPath()).toEqual('/about/');
			});
		});

		describe("swapping", function() {
			beforeEach(function() {
				Responder = function() {};
				Responder.prototype = {
					navigatorBehaviors: ["IHasStateSwap"],
					callOnSwapOutComplete: null,
					willSwapToStateReturnValue: true,

					willSwapToStateCount: 0,
					swapInCount: 0,
					swapOutCount: 0,

					willSwapToState: function(truncatedState, fullState) {
						this.willSwapToStateCount++;
						return this.willSwapToStateReturnValue;
					},

					swapIn: function(truncatedState, fullState) {
						this.swapInCount++;
					},

					swapOut: function(callOnSwapOutComplete) {
						this.swapOutCount++;
						this.callOnSwapOutComplete = callOnSwapOutComplete;
					}

				};

				responder = new Responder();
				spyOn(responder, 'willSwapToState').andCallThrough();
				spyOn(responder, 'swapOut').andCallThrough();
				spyOn(responder, 'swapIn').andCallThrough();

				njs.add({}, "/");
			});

			it("Swaps swap in when we arrive at the mapped state when willSwapToState returns true", function() {
				njs.add(responder, "swapper");
				njs.start("/");
				njs.request("swapper");

				expect(responder.willSwapToState).toHaveBeenCalled();
				expect(responder.swapIn).toHaveBeenCalled();
				expect(responder.swapOut).not.toHaveBeenCalled();
			});

			it("Won't swap in when we arrive at the mapped state when willSwapToState returns false", function() {
				responder.willSwapToStateReturnValue = false;
				njs.add(responder, "swapper");
				njs.start("/");
				njs.request("swapper");

				expect(responder.willSwapToState).toHaveBeenCalled();
				expect(responder.swapIn).not.toHaveBeenCalled();
				expect(responder.swapOut).not.toHaveBeenCalled();
			});

			it("Calls the swapout when we swap to a child state", function() {
				njs.add(responder, "swapper");
				njs.add({}, "swapper/*");
				njs.start("/");
				njs.request("swapper");
				njs.request("swapper/test1");

				expect(responder.willSwapToState).toHaveBeenCalled();
				expect(responder.swapIn).toHaveBeenCalled();
				expect(responder.swapOut).toHaveBeenCalled();
			});

			it("Won't swap in till the previous swap out has completed", function() {
				njs.add(responder, "swapper");
				njs.add({}, "swapper/*");
				njs.start("/");
				njs.request("swapper");
				njs.request("swapper/test1");
				expect(responder.swapInCount).toEqual(1);
				responder.callOnSwapOutComplete();
				expect(responder.swapInCount).toEqual(2);
			});

		});

		describe("updating", function() {
			beforeEach(function() {
				Responder = function() {};
				Responder.prototype = {
					navigatorBehaviors: ["IHasStateUpdate"],

					updateStateCount: 0,

					updateState: function(truncatedState, fullState) {
						this.updateStateCount++;
					}

				};

				responder = new Responder();

				njs.add({}, "/");
			});

			it("calls the update state method when we enter the state that is mapped to the responder", function() {
				njs.add(responder, "update");
				njs.start("/");
				expect(responder.updateStateCount).toEqual(0);
				njs.request("update");
				expect(responder.updateStateCount).toEqual(1);
			});

			it("calls the update state method when we enter a child state", function() {
				njs.add(responder, "update");
				njs.add({}, ["update/*","update/*/*"]);
				njs.start("/");
				njs.request("update");
				njs.request("update/test");
				njs.request("update/test/test");
				expect(responder.updateStateCount).toEqual(3);
			});

			it("doesn't call the update state for state changes that are no children of the mapped state", function() {
				njs.add(responder, "update");
				njs.add({}, "other");
				njs.start("/");
				njs.request("update");
				njs.request("/");
				njs.request("other");
				expect(responder.updateStateCount).toEqual(1);
			});
		});

		describe("validation", function() {

			describe("synchronous", function() {

				describe("IHasStateValidation", function() {
					beforeEach(function() {
						Responder = function() {};
						Responder.prototype = {
							navigatorBehaviors: ["IHasStateValidation"],

							validateCount:0,

							validate: function(truncatedState, fullState) {
								this.validateCount++;
								return true;
							}
						};

						responder = new Responder();

						njs.add({}, "/");
					});

					it("requests the responder if the state we want to visit is valid", function() {
						njs.add(responder, "validation");
						njs.start("/");
						expect(responder.validateCount).toEqual(0);
						njs.request("validation");
						expect(responder.validateCount).toEqual(1);
					});

					it("updates to the requested state when the state is validated", function() {
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation");
						expect(njs.getCurrentState().getPath()).toEqual("/validation/");
					});

					it("doesn't change to the requested state when the state did not validate", function() {
						responder.validate = function() {return false;};
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation");
						expect(njs.getCurrentState().getPath()).toEqual("/");
					});

					it("doesn't call the validate method when we visit a different state", function() {
						njs.add(responder, "validation");
						njs.add({}, "test");
						njs.start("/");
						njs.request("validation");
						expect(responder.validateCount).toEqual(1);
						njs.request("test");
						expect(responder.validateCount).toEqual(1);
					});

					it("doesn't allow to visit child states when there is no mapping. Even though the responder says it is a valid state", function() {
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation/test");
						expect(njs.getCurrentState().getPath()).toEqual("/");
					});

					it("does allow to visit child states when is a mapping", function() {
						njs.add(responder, "validation");
						njs.add({}, "validation/test");
						njs.start("/");
						njs.request("validation/test");
						expect(njs.getCurrentState().getPath()).toEqual("/validation/test/");
					});

					it("doesn't allow to visit child states when the state did not validate", function() {
						responder.validate = function() {return false;};
						njs.add(responder, "validation");
						njs.add({}, "validation/test");
						njs.start("/");
						njs.request("validation/test");
						expect(njs.getCurrentState().getPath()).toEqual("/");
					});

					it("first validates both the parent and child states", function() {
						var childResponder = new Responder();
						njs.add(responder, "validation");
						njs.add(childResponder, "validation/test");
						njs.start("/");
						njs.request("validation/test");
						expect(responder.validateCount).toEqual(1);
						expect(childResponder.validateCount).toEqual(1);
					});

					it("doesn't validate the child state if the parent state did not validate", function() {
						responder.validate = function() {this.validateCount++; return false;};

						var childResponder = new Responder("child");
						njs.add(responder, "validation");
						njs.add(childResponder, "validation/test");
						njs.start("/");
						njs.request("validation/test");

						expect(responder.validateCount).toEqual(1);
						expect(childResponder.validateCount).toEqual(0);
					});

					it("Mapping a validating child state before a invalidating parent state will validate the state", function() {
						//TODO this is probably an issue. Should we order the states we loop through internally?

						responder.validate = function() {this.validateCount++; return false;};

						var childResponder = new Responder("child");
						njs.add(childResponder, "validation/test");
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation/test");

						expect(responder.validateCount).toEqual(1);
						expect(childResponder.validateCount).toEqual(1);
					});
				});

				describe("IHasStateValidationOptional", function() {
					beforeEach(function() {
						Responder = function() {};
						Responder.prototype = {
							navigatorBehaviors: ["IHasStateValidationOptional"],

							willValidateCount:0,
							validateCount:0,

							willValidate: function(truncatedState, fullState) {
								this.willValidateCount++;
								return true;
							},

							validate: function(truncatedState, fullState) {
								this.validateCount++;
								return true;
							}
						};

						responder = new Responder();

						njs.add({}, "/");
					});

					it("calls willValidate on the responder to request if we should execute validation for this state", function() {
						njs.add(responder, "validation");
						njs.start("/");
						expect(responder.willValidateCount).toEqual(0);
						njs.request("validation");
						expect(responder.willValidateCount).toEqual(1);
					});

					it("does not execute the validate method if the responder returns that we don't need to run custom validation", function() {
						responder.willValidate = function() { return false; };
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation");
						expect(responder.validateCount).toEqual(0);
					});

					it("allows us to visit a state when the willValidate method returns false, as long as there is a responder bound to the given state", function() {
						responder.willValidate = function() { return false; };
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation");
						expect(njs.getCurrentState().getPath()).toEqual("/validation/");
					});

				});
			});

			describe("asynchronous", function() {

				describe("IHasStateValidationAsync", function() {
					beforeEach(function() {
						Responder = function() {};
						Responder.prototype = {
							navigatorBehaviors: ["IHasStateValidationAsync"],

							prepareValidationCount:0,
							callOnPrepared: null,
							validateCount:0,

							prepareValidation: function(truncatedState, fullState, callOnPrepared) {
								this.callOnPrepared = callOnPrepared;
								this.prepareValidationCount++;
							},

							validate: function(truncatedState, fullState) {
								this.validateCount++;
								return true;
							}

						};

						responder = new Responder();

						njs.add({}, "/");
					});

					it("doesn't call the validate method until the prepareValidation callback has been called", function() {
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation");
						expect(responder.prepareValidationCount).toEqual(1);
						expect(responder.validateCount).toEqual(0);
						responder.callOnPrepared();
						expect(responder.validateCount).toEqual(1);
					});

					it("doesn't update the currentState until the state validation is prepared", function() {
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation");
						expect(njs.getCurrentState().getPath()).toEqual("/");
						responder.callOnPrepared();
						expect(njs.getCurrentState().getPath()).toEqual("/validation/");
					});

					it("can navigate away while the validation is still running and skips validation once the validation is prepared", function() {
						njs.add(responder, "validation");
						njs.add({}, "test");
						njs.start("/");
						njs.request("validation");
						expect(njs.getCurrentState().getPath()).toEqual("/");
						njs.request("test");
						expect(njs.getCurrentState().getPath()).toEqual("/test/");
						responder.callOnPrepared();
						expect(njs.getCurrentState().getPath()).toEqual("/test/");
						expect(responder.validateCount).toEqual(0);
					});

					it("won't validate substates of the responder's state when there is no mapping", function() {
						njs.add(responder, "validation");
						njs.start("/");
						njs.request("validation/test");
						expect(responder.prepareValidationCount).toEqual(0);
						expect(njs.getCurrentState().getPath()).toEqual("/");
					});

					it("will validate substates of the responder's state when there is a mapping", function() {
						njs.add(responder, "validation");
						njs.add({}, "validation/test");
						njs.start("/");
						njs.request("validation/test");

						expect(responder.prepareValidationCount).toEqual(1);
						expect(njs.getCurrentState().getPath()).toEqual("/");

						responder.callOnPrepared();

						expect(njs.getCurrentState().getPath()).toEqual("/validation/test/");
					});

					it("stacks validation calls of substates that has to be validated", function() {
						var childValidateResponder = new Responder();
						njs.add(responder, "validation");
						njs.add(childValidateResponder, "validation/test");
						njs.start("/");
						njs.request("validation/test");

						expect(responder.prepareValidationCount).toEqual(1);
						expect(childValidateResponder.prepareValidationCount).toEqual(0);

						responder.callOnPrepared();

						expect(responder.validateCount).toEqual(1);
						expect(childValidateResponder.prepareValidationCount).toEqual(1);
						expect(childValidateResponder.validateCount).toEqual(0);

						childValidateResponder.callOnPrepared();
					});

					it("allows to navigate when the child responder's validate method returns true", function() {
						var childValidateResponder = new Responder();
						njs.add(responder, "validation");
						njs.add(childValidateResponder, "validation/test");
						njs.start("/");
						njs.request("validation/test");

						responder.callOnPrepared();
						childValidateResponder.callOnPrepared();

						expect(njs.getCurrentState().getPath()).toEqual("/validation/test/");
					});

					it("Doesn't allow to navigate when the child responder's validate method returns false", function() {
						var childValidateResponder = new Responder();
						childValidateResponder.validate = function() { return false; };
						njs.add(responder, "validation");
						njs.add(childValidateResponder, "validation/test");
						njs.start("/");
						njs.request("validation/test");

						responder.callOnPrepared();
						childValidateResponder.callOnPrepared();

						expect(njs.getCurrentState().getPath()).toEqual("/");
					});

					it("doesn't try to validate a childState when the parent responder already invalidated the state", function() {
						responder.validate = function() { return false; };

						var childValidateResponder = new Responder();
						njs.add(responder, "validation");
						njs.add(childValidateResponder, "validation/test");
						njs.start("/");
						njs.request("validation/test");

						responder.callOnPrepared();

						expect(childValidateResponder.prepareValidationCount).toEqual(0);
						expect(njs.getCurrentState().getPath()).toEqual("/");
					});
				});

//				var Responder1, Responder2,
//					responder1ValidateCalls,
//					responder2ValidateCalls;
//
//				beforeEach(function() {
//					responder1ValidateCalls = responder2ValidateCalls = 0;
//
//					Responder1 = function() {};
//					Responder1.prototype = {
//						navigatorBehaviors: ["IHasStateValidationOptionalAsync"],
//						willValidate: function(truncatedState, fullState) {
//							return true;
//						},
//
//						prepareValidation: function(truncatedState, fullState, callOnPrepared) {
//							callOnPrepared();
//						},
//
//						validate: function(truncatedState, fullState) {
//							responder1ValidateCalls++;
//							return true;
//						}
//					};
//
//					Responder2 = function() {};
//					Responder2.prototype = {
//						navigatorBehaviors: ["IHasStateValidationOptionalAsync"],
//						willValidate: function(truncatedState, fullState) {
//							return true;
//						},
//
//						prepareValidation: function(truncatedState, fullState, callOnPrepared) {
//							callOnPrepared();
//						},
//
//						validate: function(truncatedState, fullState) {
//							responder2ValidateCalls++;
//							return true;
//						}
//					};
//
//					njs.add(new Responder1(), "/*/");
////				njs.add({}, "/*/");
//					njs.add(new Responder2(), "/*/test/*/");
//					njs.start("/");
//				});
//
//				it("allows us to visit the /hello/ state", function() {
//					njs.request("hello");
//
//					expect(njs.getCurrentState().getPath()).toEqual("/hello/");
//				});
//
//				it("doesn't allow us to visit the /hello/world/ state", function() {
//					njs.request("hello/world");
//
//					expect(njs.getCurrentState().getPath()).toEqual("/");
//				});
//
//				it("allows us to visit the /hello/test/world/ state", function() {
//					njs.request("hello/test/world");
//
//					expect(njs.getCurrentState().getPath()).toEqual("/hello/test/world/");
//				});
//
//				it("doesn't allow us to visit the /hello/test/world/and/space/ state", function() {
//					njs.request("hello/test/world/and/space");
//
//					expect(njs.getCurrentState().getPath()).toEqual("/");
//				});
//
//				it("validates the any of the first segment changes with Responder1", function() {
//					njs.request("hello");
//
//					expect(responder1ValidateCalls).toEqual(1);
//					expect(responder2ValidateCalls).toEqual(0);
//				});
//
//				it("first validates responder 1 and on success responder 2", function() {
//					njs.request("hello/test/world");
//
//					expect(responder1ValidateCalls).toEqual(1);
//					expect(responder2ValidateCalls).toEqual(1);
//				});

			})
		});

		describe("implementing all behaviors", function() {

		});
	});

});