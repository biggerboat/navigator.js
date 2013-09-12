describe("Navigator", function () {
	var navigator;
	var states;
	var responder;

	beforeEach(function () {
		navigator = new navigatorjs.Navigator();
		states = {
			root: new navigatorjs.NavigationState("/"),
			gallery: new navigatorjs.NavigationState("/gallery/"),
			album: new navigatorjs.NavigationState("/gallery/holiday/"),
			image: new navigatorjs.NavigationState("/gallery/holiday/1/"),
			contact: new navigatorjs.NavigationState("/contact/")
		}
	});

	describe("Simple navigation", function () {

		beforeEach(function () {
			responder = {
				navigatorBehaviors: ["IHasStateInitialization", "IHasStateTransition"],
				initialize: function() {
					console.log("responder -> initialize");
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

		it("Starts at the root state", function () {
			navigator.add(responder, states.contact);
			navigator.start();
			expect(navigator.getCurrentState().getPath()).toEqual(states.root.getPath());
		});

		it("Can request to the contact state", function () {
			navigator.add(responder, states.contact);
			navigator.start();
			navigator.request(states.contact);
			expect(navigator.getCurrentState().getPath()).toEqual(states.contact.getPath());
		});

		it("can trigger the initialize state", function () {
			spyOn(responder, 'initialize'); //A spy replaces the method, so the initialize log won't occur here

			navigator.add(responder, states.contact);
			navigator.start();
			expect(responder.initialize).not.toHaveBeenCalled();

			navigator.request(states.contact);
			expect(responder.initialize).toHaveBeenCalled();
		});

	});
});