describe("StateUrlSyncer", function() {

	var navigator,
		stateUrlSyncer,
		root = window.location.pathname,
		search = window.location.search,
		resetUrl = root + search;

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
	});

	it("Detects if the browser supports push states", function() {
		expect(typeof stateUrlSyncer.supportsPushState).toEqual('boolean'); 
	});

	describe("Use hashes in url", function() {

		it("Can set a URL", function() {
			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrl()).toEqual('test');
		});

		it("The parameters in the URL can be reset", function() {
			expect(stateUrlSyncer.getUrl()).toEqual('');

			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrl()).toEqual('test');

			stateUrlSyncer.resetUrl();
			expect(stateUrlSyncer.getUrl()).toEqual('');
		});

	});

	describe("Use push states in url", function() {

		beforeEach(function(){
			stateUrlSyncer.usePushState(root);
		});

		it("Can set a URL", function() {
			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrl()).toEqual('test');
		});

		it("The parameters in the URL can be reset", function() {
			expect(stateUrlSyncer.getUrl()).toEqual('');

			stateUrlSyncer.setUrl('test');
			expect(stateUrlSyncer.getUrl()).toEqual('test');

			stateUrlSyncer.resetUrl();
			expect(stateUrlSyncer.getUrl()).toEqual('');
		});

	});


	it("Updates the URL when the current navigator state changes", function() {

	});

	it("Updates the current navigator state when the URL changes", function() {

	});

});