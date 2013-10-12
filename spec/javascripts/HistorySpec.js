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
		navigator.start('/');
	});

	afterEach(function() {
	});

	it('starts with no history', function() {
		expect(history.getPreviousState()).toBeNull();
		expect(history.getNextState()).toBeNull();
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('adds a history item when the current state changes', function() {
		navigator.request('state1');
		expect(history.getPreviousState().getPath()).toEqual('/');
		expect(history.getNextState()).toBeNull();
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

	it('does not allow navigation into future', function() {
		navigator.request('state1');
		expect(history.forward()).toBe(false);
		expect(history.getCurrentState().getPath()).toEqual('/state1/');
	});

	it('navigates back in history', function() {
		navigator.request('state1');
		expect(history.back()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/');
		expect(history.getNextState().getPath()).toEqual('/state1/');
	});

	it('navigates back in history with multiple items', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state1/');
		expect(history.getNextState().getPath()).toEqual('/state2/');
		expect(history.getPreviousState().getPath()).toEqual('/');
	});

	it('navigates back multiple times', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('navigates back multiple steps', function() {
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

	it('navigates forward multiple times', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.forward()).toBe(true);
		expect(history.forward()).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

	it('navigates forward multiple steps in history', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.forward(2)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

	it('navigates backwards multiple steps within bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back(10)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/');
	});

	it('navigates forward multiple steps within bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.back()).toBe(true);
		expect(history.back()).toBe(true);
		expect(history.forward(10)).toBe(true);
		expect(history.getCurrentState().getPath()).toEqual('/state2/');
	});

	it('retrieve the previous NavigationState', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.getPreviousState().getPath()).toEqual('/state1/');
	});

	it('retrieve the previous NavigationState with multiple steps', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		expect(history.getPreviousState(2).getPath()).toEqual('/state1/');
	});

	it('retrieve the previous NavigationState with multiple steps within bounds', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		expect(history.getPreviousState(100).getPath()).toEqual('/');
	});

	it('retrieve the next NavigationState in future returns null', function() {
		navigator.request('state1');
		navigator.request('state2');
		expect(history.getNextState()).toBeNull();
	});

	it('retrieve the next NavigationState', function() {
		navigator.request('state1');
		navigator.request('state2');
		history.back();
		expect(history.getNextState().getPath()).toEqual('/state2/');
	});

	it('retrieve the next NavigationState with multiple steps', function() {
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		history.back(10);
		expect(history.getNextState(2).getPath()).toEqual('/state2/');
	});

	it('retrieve the next NavigationState with multiple steps within bounds', function() {
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

	it('state by position matches', function() {
		navigator.request('state1');
		expect(history.getStateByPosition(1).getPath()).toEqual('/');
		expect(history.getStateByPosition(0).getPath()).toEqual('/state1/');
	});

	it('position by path matches', function() {
		navigator.request('state1');
		expect(history.getPositionByPath('/state1/')).toEqual(0);
		expect(history.getPositionByPath('/')).toEqual(1);
	});

	it('position by state matches', function() {
		navigator.request('state1');
		expect(history.getPositionByState(history.getCurrentState())).toEqual(0);
		expect(history.getPositionByState(history.getPreviousState())).toEqual(1);
	});

	it('max length limit works', function() {
		history.maxLength = 3;
		navigator.request('state1');
		navigator.request('state2');
		navigator.request('state3');
		navigator.request('state4');
		navigator.request('state5');

		expect(history.getLength()).toEqual(3);
		expect(history.getStateByPosition(history.getLength() - 1).getPath()).toEqual('/state3/');
	});

});