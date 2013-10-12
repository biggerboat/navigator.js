describe('History', function() {

	var navigator, history;

	beforeEach(function() {
		navigator = new navigatorjs.Navigator();
		history = new navigatorjs.History(navigator);

		navigator.add({}, '/');
		navigator.add({}, 'state1');
		navigator.add({}, 'state2');
		navigator.add({}, 'state3');
		navigator.add({}, 'state4');
		navigator.add({}, 'state5');
		navigator.start('/');
	});

	it('starts with no history', function() {
		navigator = new navigatorjs.Navigator();
		history = new navigatorjs.History(navigator);

		expect(history.getPreviousState()).toBeNull();
		expect(history.getNextState()).toBeNull();
		expect(history.getCurrentState()).toBeNull();

		navigator.start('/');

		expect(history.getPreviousState()).toBeNull();
		expect(history.getNextState()).toBeNull();
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('adds a history item when the current state changes', function() {
		navigator.request('state1');
		expect(history.getPreviousState().getPath()).toEqual('/');
		expect(history.getNextState()).toBeNull();
	});

	it('has one history state after start', function() {
		navigator = new navigatorjs.Navigator();
		history = new navigatorjs.History(navigator);

		expect(history.getLength()).toEqual(0);
		navigator.start('/');
		expect(history.getLength()).toEqual(1);
	});

	it('has a history length that equals the number of state changes', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.getLength()).toEqual(3); // Including start state
	});

	it('does not go back without history', function() {
		expect(history.back()).toBe(false);
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('does not allow to navigate forwards if we did not go back first', function() {
		navigator.request('state1');

		expect(history.forward()).toBe(false);
		expect(history.getCurrentState().getPath()).toEqual('/state1/');
	});

	it('navigates back in history', function() {
		navigator.request('state1');

		expect(history.getCurrentState().getPath()).toEqual('/state1/');
		expect(history.back()).toBe(true);

		expect(history.getCurrentState().getPath()).toEqual('/');
		expect(history.getNextState().getPath()).toEqual('/state1/');
	});

	it('navigates back in history when there are multiple history entries', function() {
		navigator.request('state1');
		navigator.request('state2');

		expect(history.getCurrentState().getPath()).toEqual('/state2/');
		expect(history.back()).toBe(true);

		expect(history.getCurrentState().getPath()).toEqual('/state1/');
		expect(history.getNextState().getPath()).toEqual('/state2/');
		expect(history.getPreviousState().getPath()).toEqual('/');
	});

	it('navigates back multiple to multiple history entries', function() {
		navigator.request('state1');
		navigator.request('state2');

		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('navigates back with multiple steps at once', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back(2)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('navigates forward in history', function() {
		navigator.request('state1');
		expect(history.back()).toBe(true);
		expect(history.forward()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state1/');
	});

	it('navigates forward across multiple history items', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.forward()).toBe(true);
		expect(history.forward()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

	it('navigates forward with multiple steps at once', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.forward(2)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

	it('navigates backwards multiple steps but caps it within history bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back(10)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('navigates forward multiple steps but caps it within history bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.forward(10)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

	it('retrieves the previous NavigationState', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.getPreviousState().getPath()).toEqual('/state1/');
	});

	it('retrieves the previous NavigationState with multiple steps', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		expect(history.getPreviousState(2).getPath()).toEqual('/state1/');
	});

	it('retrieves the previous NavigationState with multiple steps within bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		expect(history.getPreviousState(100).getPath()).toEqual('/');
	});

	it('retrieves null when the next state is requested while there is no future', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.getNextState()).toBeNull();
		expect(history.getNextState(10)).toBeNull();
	});

	it('retrieves the next NavigationState when there is a future', function() {
		navigator.request('state1');
		navigator.request('state2');
		history.back();
		expect(history.getNextState().getPath()).toEqual('/state2/');
	});

	it('retrieves the next NavigationState with multiple steps at once', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.back(3);
		expect(history.getNextState(2).getPath()).toEqual('/state2/');
	});

	it('retrieves the next NavigationState with multiple steps at once capped within history bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.back();
		expect(history.getNextState(100).getPath()).toEqual('/state3/');
	});

	it('clears history', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.clearHistory();
		expect(history.getLength()).toEqual(0);
	});

	it('has no previous and next after clearing history', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.clearHistory();
		expect(history.getNextState()).toBeNull();
		expect(history.getPreviousState()).toBeNull();
	});

	it('has no current state after the history is cleared', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.clearHistory();
		expect(history.getCurrentState()).toBeNull();
	});

	it('can access states by absolute position in the history', function() {
		navigator.request('state1');
		expect(history.getStateByPosition(1).getPath()).toEqual('/');
		expect(history.getStateByPosition(0).getPath()).toEqual('/state1/');
	});

	it('can retrieve the history position by path', function() {
		navigator.request('state1');
		expect(history.getPositionByPath('/state1/')).toEqual(0);
		expect(history.getPositionByPath('/')).toEqual(1);
	});

	it('returns the index of the first history item that is matched', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state1');
		expect(history.getPositionByPath('/state1/')).toEqual(0);
	});

	it('can retrieve the history position by state', function() {
		navigator.request('state1');
		expect(history.getPositionByState(history.getCurrentState())).toEqual(0);
		expect(history.getPositionByState(history.getPreviousState())).toEqual(1);
	});

	it("keeps the history length within defined bounds and removes older states from the history", function() {
		history.maxLength = 3;
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		navigator.request('state4');
		navigator.request('state5');

		expect(history.getLength()).toEqual(3);
		expect(history.getStateByPosition(0).getPath()).toEqual('/state5/');
		expect(history.getStateByPosition(2).getPath()).toEqual('/state3/');
	});

	it("clears the future when we go back and navigate to a new state", function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.back(3);

		expect(history.getLength()).toEqual(4);
		navigator.request('state4');
		expect(history.getLength()).toEqual(2);

		expect(history.getPreviousState().getPath()).toEqual('/');
		expect(history.getNextState()).toBeNull();
	});

	it("doesn't clear the future when we go back and forward", function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');

		history.back(3);
		expect(history.getLength()).toEqual(4);

		history.forward(2);
		expect(history.getLength()).toEqual(4);

		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

});