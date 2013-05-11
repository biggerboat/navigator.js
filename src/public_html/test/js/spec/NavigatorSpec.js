describe("Navigator", function () {
	var navigator;
	var states;
	var responder;

	beforeEach(function () {
		navigator = new Navigator();
		states = {
			root: new NavigationState("/"),
			gallery: new NavigationState("/gallery/"),
			album: new NavigationState("/gallery/holiday/"),
			image: new NavigationState("/gallery/holiday/1/"),
			contact: new NavigationState("/contact/")
		}
	});

	describe("Simple responder", function () {

		beforeEach(function () {
			// The definition of a responder has to be defined and can differ per implementation. Keeping generic for now
			responder = {};
		});

		it("can be added", function () {
			navigator.add(responder, states.contact);
			expect(navigator.hasResponder(responder)).toBeTruthy();
		});

		it("can be removed", function () {
			navigator.add(responder, states.contact);
			navigator.remove(responder, states.contact);
			expect(navigator.hasResponder(responder)).toBeFalsy();
		});

		it("throws an error when an invalid responder is added", function () {
			expect(navigator.add(null, states.contact)).toThrow(new Error("Invalid responder added to navigator."));
		});

	});

	describe("Navigation", function () {

		beforeEach(function () {
			// The definition of a responder has to be defined and can differ per implementation. Keeping generic for now
			responder = {};
		});

		it("has the root state as the current state before navigation", function () {
			expect(navigator.getCurrentState().getPath()).toEqual(states.root.getPath());
		});

		it("has the /contact/ state as the current after navigation to /contact/ which has a responder", function () {
			navigator.add(responder, states.contact);
			navigator.request(states.contact);
			expect(navigator.getCurrentState().getPath()).toEqual(states.contact.getPath());
		});

		it("has the root state as the current after navigation to /contact/ without a responder", function () {
			navigator.request(states.contact);
			expect(navigator.getCurrentState().getPath()).toEqual(states.root.getPath());
		});

	});

	describe("Responder behavior methods are called", function () {

		beforeEach(function () {
			//How behavior is defined can differ per approach. This has been left out here
			responder = {
				initializedCount: 0,

				transitionInCount: 0,
				transitionOutCount: 0,

				validateCount: 0,
				prepareValidationCount: 0,
				willValidateCount: 0,

				redirectCount: 0,

				willSwapToStateCount: 0,
				swapOutCount: 0,
				swapInCount: 0,

				updateStateCount: 0,

				/**
				 * IHasStateInitialization
				 */
				initialized: function() {
					this.initializedCount++;
				},

				/**
				 * IHasStateTransition
				 */
				transitionIn: function(callOnComplete) {
					callOnComplete();
					this.transitionInCount++;
				},

				/**
				 * IHasStateTransition
				 */
				transitionOut: function(callOnComplete) {
					callOnComplete();
					this.transitionOutCount++;
				},

				/**
				 * IHasStateValidation, IHasStateValidationAsync, IHasStateValidationOptional, IHasStateRedirection
				 */
				validate: function(truncatedState, fullState) {
					this.validateCount++;
					return true;
				},

				/**
				 * IHasStateValidationAsync
				 */
				prepareValidation: function(truncatedState, fullState, callOnPrepared) {
					callOnPrepared();
					this.prepareValidationCount++;
				},

				/**
				 * IHasStateValidationOptional
				 */
				willValidate: function(truncatedState, fullState) {
					this.willValidateCount++;
					return true;
				},

				/**
				 * IHasStateRedirection
				 */
				redirect: function(truncatedState, fullState) {
					this.redirectCount++;
					return fullState;
				},

				/**
				 * IHasStateSwap
				 */
				willSwapToState: function(truncatedState, fullState) {
					this.willSwapToStateCount++;
					return true;
				},

				/**
				 * IHasStateSwap
				 */
				swapOut: function(swapOutComplete) {
					swapOutComplete();
					this.swapOutCount++;
				},

				/**
				 * IHasStateSwap
				 */
				swapIn: function(truncatedState, fullState) {
					this.swapInCount++;
				},

				/**
				 * IHasStateUpdate
				 */
				updateState: function(truncatedState, fullState) {
					this.updateStateCount++;
				}
			};
		});

		it("Calls the initialize method", function () {
			navigator.add(responder, states.contact);
			expect(responder.initializedCount).toEqual(0);
			navigator.request(states.contact);
			expect(responder.initializedCount).toEqual(1);
		});

		it("Calls the transitionIn and transitionOut method", function () {
			navigator.add(responder, states.contact);

			expect(responder.transitionInCount).toEqual(0);
			navigator.request(states.contact);
			expect(responder.transitionInCount).toEqual(1);

			expect(responder.transitionOutCount).toEqual(0);
			navigator.request(states.root);
			expect(responder.transitionOutCount).toEqual(1);
		});

		it("Calls validate method", function () {
			navigator.add(responder, states.contact);

			expect(responder.validateCount).toEqual(0);
			navigator.request(states.contact);
			expect(responder.validateCount).toEqual(1);
		});

		it("Calls async prepareValidation and validate methods", function () {
			navigator.add(responder, states.contact);

			expect(responder.prepareValidationCount).toEqual(0);
			expect(responder.validateCount).toEqual(0);
			navigator.request(states.contact);
			expect(responder.prepareValidationCount).toEqual(1);
			expect(responder.validateCount).toEqual(1);
		});

		it("Calls both validate and redirect methods when the state is not validated", function () {
			//In this test we won't validate.
			responder.validate = function(truncatedState, fullState) {
				this.validateCount++;
				return false;
			}

			navigator.add(responder, states.contact);

			expect(responder.validateCount).toEqual(0);
			expect(responder.redirectCount).toEqual(0);
			navigator.request(states.contact);
			expect(responder.validateCount).toEqual(1);
			expect(responder.redirectCount).toEqual(1);
		});

		it("doesn't call the redirect method when the responder validates", function () {
			navigator.add(responder, states.contact);

			expect(responder.validateCount).toEqual(0);
			expect(responder.redirectCount).toEqual(0);
			navigator.request(states.contact);
			expect(responder.validateCount).toEqual(1);
			expect(responder.redirectCount).toEqual(0);
		});

		it("Calls the willSwap, swapIn and swapOut methods", function () {
			navigator.add(responder, states.album);
			//Register a bogus responder to the image state, so we will be able to navigate to here
			navigator.add({}, states.image);

			expect(responder.willSwapToStateCount).toEqual(0);
			expect(responder.swapInCount).toEqual(0);
			expect(responder.swapOutCount).toEqual(0);
			navigator.request(states.album);
			expect(responder.willSwapToStateCount).toEqual(0);
			expect(responder.swapInCount).toEqual(0);
			expect(responder.swapOutCount).toEqual(0);
			navigator.request(states.image);
			expect(responder.willSwapToStateCount).toEqual(1);
			expect(responder.swapInCount).toEqual(1);
			expect(responder.swapOutCount).toEqual(1);
		});

		it("Calls the updateState when navigating to a child state", function () {
			navigator.add(responder, states.album);
			//Register a bogus responder to the image state, so we will be able to navigate to here
			navigator.add({}, states.image);

			expect(responder.updateStateCount).toEqual(0);
			navigator.request(states.album);
			expect(responder.updateStateCount).toEqual(0);
			navigator.request(states.image);
			expect(responder.updateStateCount).toEqual(1);
		});

	});

});