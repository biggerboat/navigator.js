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

//	describe("Simple responder", function () {
//
//		beforeEach(function () {
//			// The definition of a responder has to be defined and can differ per implementation. Keeping generic for now
//			responder = {
//				navigatorBehaviors: ["IHasStateInitialization"],
//				initialize: function() {
//
//				}
//			};
//		});
//
//		it("can be added", function () {
//			navigator.add(responder, states.contact);
//			expect(navigator.hasResponder(responder)).toBeTruthy();
//			console.log(navigator);
//		});
//
//		it("can be removed", function () {
//			expect(navigator.hasResponder(responder)).toBeFalsy();
//			navigator.add(responder, states.contact);
//			expect(navigator.hasResponder(responder)).toBeTruthy();
//			navigator.remove(responder, states.contact);
//			expect(navigator.hasResponder(responder)).toBeFalsy();
//		});
//
//		it("throws an error when an invalid responder is added", function () {
//			//expect(navigator.add(null, states.contact)).toThrow(new Error("add: responder is null"));
//			expect(function() {
//				navigator.add(null, states.contact)
//			}).toThrow();
//		});
//
//	});

	describe("Simple navigation", function () {

		beforeEach(function () {
			// The definition of a responder has to be defined and can differ per implementation. Keeping generic for now
			responder = {
				navigatorBehaviors: ["IHasStateInitialization"],
				initialize: function() {
					console.log("initialize");
				}
			};
		});

		it("can trigger the initialize state", function () {
			navigator.add(responder, states.contact);
			navigator.start();
		});

	});
});