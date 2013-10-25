describe("Navigator", function() {
	var navigator;
	var states;
	var responder;

	beforeEach(function() {
		navigator = new navigatorjs.Navigator();
		states = {
			root: new navigatorjs.NavigationState("/"),
			gallery: new navigatorjs.NavigationState("/gallery/"),
			album: new navigatorjs.NavigationState("/gallery/holiday/"),
			image: new navigatorjs.NavigationState("/gallery/holiday/1/"),
			contact: new navigatorjs.NavigationState("/contact/")
		}
	});

	describe("Simple navigation", function() {

		beforeEach(function() {
			responder = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateTransition"],
				initializeByNavigator: function() {
					console.log("responder -> initializeByNavigator");
				},

				transitionIn: function(callOnComplete) {
					console.log("responder -> transitionIn");
					callOnComplete();
				},

				transitionOut: function(callOnComplete) {
					console.log("responder -> transitionOut");
					callOnComplete();
				},

				toString: function() {
					return "[object responder]";
				}
			};
		});

		it("Starts at the root state", function() {
			navigator.add(responder, states.contact);
			navigator.start();
			expect(navigator.getCurrentState().getPath()).toEqual(states.root.getPath());
		});

		it("Can request to the contact state", function() {
			navigator.add(responder, states.contact);
			navigator.start();
			navigator.request(states.contact);
			expect(navigator.getCurrentState().getPath()).toEqual(states.contact.getPath());
		});

		it("can trigger the initialize state", function() {
			spyOn(responder, 'initializeByNavigator'); //A spy replaces the method, so the initializeByNavigator log won't occur here

			navigator.add(responder, states.contact);
			navigator.start();
			expect(responder.initializeByNavigator).not.toHaveBeenCalled();

			navigator.request(states.contact);
			expect(responder.initializeByNavigator).toHaveBeenCalled();
		});

		it("Can not request a state that is not mapped", function() {
			navigator.start();
			navigator.request(states.contact);
			expect(navigator.getCurrentState().getPath()).toEqual("/");
		});

		it("Can request a state that is mapped with a wildcard", function() {
			navigator.add({}, "product/*");
			navigator.start();
			navigator.request("product/2");
			expect(navigator.getCurrentState().getPath()).toEqual("/product/2/");
		});

		it("Can not request a substate of a wildcard state when there is no mapping", function() {
			navigator.add({}, "product/*");
			navigator.start();
			navigator.request("product/2/home");
			expect(navigator.getCurrentState().getPath()).toEqual("/");
		});

		it("Can request a state that is mapped with a double wildcard", function() {
			navigator.add({}, "**/overlay");
			navigator.start();
			navigator.request("product/2/overlay");
			expect(navigator.getCurrentState().getPath()).toEqual("/product/2/overlay/");
		});

		it("Can not request a state any state when a responder with double wildcards is added", function() {
			navigator.add({}, "**/overlay");
			navigator.start();
			navigator.request("test");
			expect(navigator.getCurrentState().getPath()).toEqual("/");
			navigator.request("test/overlay/bla");
			expect(navigator.getCurrentState().getPath()).toEqual("/");
		});

	});
});