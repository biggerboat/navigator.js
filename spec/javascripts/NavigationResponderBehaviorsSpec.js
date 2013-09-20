describe("Navigator responder behavior/interface validation", function() {
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
			expect(methods).toEqual(["initialize"]);
		});

		it("Returns a list of unique methods within an advanced inheritance chain", function() {
			var methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(["IHasStateValidationOptionalAsync"]);
			expect(methods).toEqual(["prepareValidation", "validate", "willValidate"]);
		});

		it("Returns a list of unique methods within a list of multiple interfaces and advanced inheritance chain", function() {
			var methods = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(["IHasStateInitialization", "IHasStateValidationOptionalAsync"]);
			expect(methods).toEqual(["initialize", "prepareValidation", "validate", "willValidate"]);
		});
	});

	describe("Validate interface implementation", function() {

		it("Has state initialization but no state transition", function() {
			var object = {
				navigatorBehaviors: ["IHasStateInitialization"],
				initialize: function() {}
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

		it("Has implemented all behaviors", function() {
			var object = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateValidation", "IHasStateValidationAsync", "IHasStateValidationOptional", "IHasStateValidationOptionalAsync", "IHasStateRedirection", "IHasStateSwap", "IHasStateTransition", "IHasStateUpdate"],

				initialize: function() {}, //IHasStateInitialization
				validate: function(truncatedState, fullState) {}, //IHasStateValidation, IHasStateValidationAsync, IHasStateValidationOptional, IHasStateValidationOptionalAsync, IHasStateRedirection
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

});