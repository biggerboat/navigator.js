describe("StateUrlSyncer", function() {

	var navigator,
		stateUrlSyncer,
		root = window.location.pathname,
		search = window.location.search,
		resetUrl = root + search;

	function delayedExpect(testRunner,delay) {
		delay = delay || 1;
		var delayReached = false;
		setTimeout(function() {
			delayReached = true;
		}, delay);

		waitsFor(function() {
			return delayReached;
		}, "Waiting for delay", delay);

		runs(testRunner);
	}

	beforeEach(function(){
		navigator = new navigatorjs.Navigator();
		stateUrlSyncer = new navigatorjs.integration.StateUrlSyncer(navigator);
	});

	afterEach(function() {
		if (stateUrlSyncer.isUsingPushState()) {
			window.history.pushState(null, '', resetUrl);
		} else {
			stateUrlSyncer.resetUrl();
		}

		stateUrlSyncer.dispose();
	});

	it("Detects if the browser supports push states", function() {
		expect(typeof stateUrlSyncer.supportsPushState).toEqual('boolean'); 
	});

	describe("Use hashes in url", function() {

		it("Can set a URL", function() {
			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/test/');
		});

		it("Can read the url when the hash changes from outside", function() {
			window.location.hash = 'test';
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/test/');
		});

		it("The parameters in the URL can be reset", function() {
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/');

			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/test/');

			stateUrlSyncer.resetUrl();
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/');
		});

		it("Doesn't change the URL when a leading or trailing slash is missing", function() {
			window.location.hash = 'test';
			expect(stateUrlSyncer.getRawUrl()).toEqual('test');
			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getRawUrl()).not.toEqual('/test/');
		});

	});

	describe("Use push states in url", function() {

		beforeEach(function(){
			stateUrlSyncer.usePushState(root);
		});

		it("Can set a URL", function() {
			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/test/');
		});

		it("The parameters in the URL can be reset", function() {
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/');

			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/test/');

			stateUrlSyncer.resetUrl();
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/');
		});

		it("Allows the push root state to end with a slash", function() {
			stateUrlSyncer.usePushState("/");
			stateUrlSyncer.start();
			expect(navigator.start).not.toThrow();
		});

		it("Does change the URL when a leading or trailing slash is missing, but doesn't create a history entry", function() {
			navigator.add({}, "*");
			stateUrlSyncer.start();
			navigator.start();

			expect(stateUrlSyncer.getRawUrl()).toEqual('');

			//Browsers are strange. We got to do a few tricks to get the popstate event triggered
			window.history.pushState(null, '', 'test'); //The push state we would like to trigger, though this doesn't call the popstate event
			window.history.pushState(null, '', 'force-popstate-event'); //A temporary push state
			history.go(-1); //Navigate away from the temp state to enforce a trigger of the popstate event

			delayedExpect(function(){
				//It takes a while before the event is processed...
				expect(stateUrlSyncer.getRawUrl()).toEqual('test/');
				history.go(-1);
				delayedExpect(function(){
					expect(stateUrlSyncer.getRawUrl()).not.toEqual('test/');
					expect(stateUrlSyncer.getRawUrl()).toEqual('');
				},10000);
			},10000);
		});

	});

	describe("Initialization", function() {

		it("Cannot start twice", function() {
			expect(stateUrlSyncer.start).not.toThrow();
			expect(stateUrlSyncer.start).toThrow();
		});

		it("Cannot call usePushState once started", function() {
			expect(stateUrlSyncer.usePushState).not.toThrow();
			stateUrlSyncer.start();
			expect(stateUrlSyncer.usePushState).toThrow();
		});
	});

	describe("Event binding", function() {
		//Note that changing the hash is asynchronous, hence the delayed expects.

		beforeEach(function() {
			navigator.add({}, "bigger");
			navigator.add({}, "bigger/boat");
			navigator.start();
			stateUrlSyncer.start();
		});

		it("Updates the URL when the current navigator state changes", function() {
			navigator.request('bigger');
			expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/bigger/');
		});

		it("Updates the current navigator state when the URL changes", function() {
			window.location.hash = 'bigger';

			delayedExpect(function() {
				expect(navigator.getCurrentState().getPath()).toEqual('/bigger/');
				expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/bigger/');

			});
		});

		it("Refuses invalid states when the URL changes", function() {
			window.location.hash = 'bigger/goat';

			delayedExpect(function() {
				expect(navigator.getCurrentState().getPath()).toEqual('/');
				expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/');
			});
		});

		it("When URL changes from a valid to an invalid state, it stays in the valid state", function() {
			window.location.hash = 'bigger';

			delayedExpect(function() {
				window.location.hash = 'bigger/goat';

				delayedExpect(function() {
					expect(navigator.getCurrentState().getPath()).toEqual('/bigger/');
					expect(stateUrlSyncer.getUrlState().getPath()).toEqual('/bigger/');
				});
			});
		});

//				window.location.hash = 'bigger/boat';
//		.(function() {
//		expect(navigator.getCurrentState().getPath()).toEqual('/bigger/boat/');
//		expect(stateUrlSyncer.getUrl()).toEqual('/bigger/boat/');

	});
});