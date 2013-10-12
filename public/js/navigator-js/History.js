this.navigatorjs = this.navigatorjs || {};

(function($) {

	/**
	 * History manager for the navigatorjs.Navigator
	 * 
	 * @example 
	 *	<code>
	 *		
	 *		// Create the normal navigator
	 *		var navigator = new navigatorjs.Navigator();
	 *		
	 *		// Create the history and supply the navigator it should manage
	 *		var history = new navigatorjs.History(navigator);
	 *
	 *		// Navigate to states as you normally would
	 *		navigator.request('/my/state');
	 *		
	 *		// Go back in time
	 *		history.back();
	 *		
	 *	</code>
	 *
	 * @author Laurent van Dommelen
	 * @created 11 oct 2013
	 * 
	 * @param {navigatorjs.Navigator} navigator
	 */
	var History = function(navigator) {

		// Bind the methods to this scope
		navigatorjs.utils.AutoBind(this, this);

		// Initialize the instance
		this._initialize(navigator);
	};

	// Default max history length, don't change this, 
	// change the maxLength instance property
	History.MAX_HISTORY_LENGTH = 100;

	// Navigation direction types
	History.DIRECTION_BACK = -1;
	History.DIRECTION_NORMAL = 0;
	History.DIRECTION_FORWARD = 1;

	/**
	 * Instance properties
	 */
	History.prototype = {

		// The navigator it is controlling
		_navigator: null,

		// The history, last state is at start of Array
		_history: null,

		// The current position in history
		_historyPosition: 0,

		// The navigator doesn't know anything about going forward or back.
		// Therefore, we need to keep track of the direction.
		// This is changed when the forward or back methods are called.
		_navigationDirection: History.DIRECTION_NORMAL,

		// The max number of history states
		maxLength: History.MAX_HISTORY_LENGTH,

		/**
		 * Create the history manager. When navigating back and forword, the history is maintained. 
		 * It is truncated when navigating to a state naturally
		 * 
		 * @param {navigatorjs.Navigator} navigator
		 * @param {Object} [options]
		 */
		_initialize: function(navigator, options) {

			// Setup the options
			if (options) {
				this.maxLength = options.maxLength || this.maxLength;
			}

			// Create the history array containing the NavigationState objects
			this._history = [];

			// Listen to changes on the navigator
			this._navigator = navigator;
			this._navigator.on(navigatorjs.NavigatorEvent.STATE_CHANGED, this._handleStateChange);
		},

		/**
		 * Go back in the history
		 * 
		 * @param {Number} [steps=1] The number of steps to go back in history
		 * @return {Boolean} Returns false if there was no previous state
		 */
		back: function(steps) {

			// Check if we know history
			if (this._historyPosition == this._history.length - 1) {
				return false;
			}

			// Set to 1 by default
			steps = steps || 1;

			// Set the history position and navigate to it
			this._historyPosition = Math.min(this._history.length - 1, this._historyPosition + steps);
			this._navigationDirection = History.DIRECTION_BACK;
			this._navigateToCurrentHistoryPosition();
			return true;
		},

		/**
		 * Go forward in the history
		 * 
		 * @param {Number} [steps=1] The number of steps to go forward in history
		 * @return {Boolean} Returns false if there was no next state
		 */
		forward: function(steps) {
			if (this._historyPosition === 0) {
				return false;
			}

			// Set to 1 by default
			steps = steps || 1;

			// Set the history position and navigate to it
			this._historyPosition = Math.max(0, this._historyPosition - steps);
			this._navigationDirection = History.DIRECTION_FORWARD;
			this._navigateToCurrentHistoryPosition();
			return true;
		},

		/**
		 * Go back in the history and return that NavigationState
		 * 
		 * @param {Number} [steps=1] The number of steps to go back in history
		 * @return {navigatorjs.NavigationState} The found state or null if no state was found
		 */
		getPreviousState: function(steps) {

			// Cannot go beyond the first entry in history
			if (this._history.length === 0 || this._historyPosition == Math.max(0, this._history.length - 1)) {
				return null;
			}

			// Set to 1 by default
			steps = steps || 1;

			// Fetch the requested state in history
			var position = Math.min(this._history.length - 1, Math.max(0, this._historyPosition + steps));
			return this._history[position];
		},

		/**
		 * Go forward in the history and return that NavigationState
		 * 
		 * @param {Number} [steps=1] The number of steps to go back in history
		 * @return {navigatorjs.NavigationState} The found state or null if no state was found
		 */
		getNextState: function(steps) {

			// Cannot look into the future
			if (this._history.length === 0 || this._historyPosition === 0) {
				return null;
			}

			// Set to 1 by default
			steps = steps || 1;

			// Fetch the requested state in history
			var position = Math.max(0, this._historyPosition - steps);
			return this._history[position];
		},

		/**
		 * Fetch the current NavigationState
		 * 
		 * @return {navigatorjs.NavigationState}
		 */
		getCurrentState: function() {
			return this._history[this._historyPosition] || null;
		},

		/**
		 * Clear the navigation history
		 */
		clearHistory: function() {
			this._history = [];
			this._historyPosition = 1;
		},

		/**
		 * Get the full history
		 * 
		 * @return {Array} List of navigatorjs.NavigationStates
		 */
		all: function() {
			return this._history;
		},

		/**
		 * Get the state by historyposition
		 * 
		 * @param {Number} position The position in history
		 * @return {navigatorjs.NavigationState} The found state or null if no state was found
		 */
		getStateByPosition: function (position) {
			if (position < 0 || position > this._history.length - 1) {
				return null;
			}
			return this._history[position];
		},

		/**
		 * Get the first occurence of a state in the history
		 * 
		 * @param {navigatorjs.NavigationState} state The NavigationState in history
		 * @return {Number} The found position or false if not found
		 */
		getPositionByState: function(state) {
			return this.getPositionByPath(state.getPath());
		},

		/**
		 * Find the first occurence of the path in the history
		 * 
		 * @param {String} path
		 * @return {Number} The index or false if not found
		 */
		getPositionByPath: function(path) {
			var count = this.getLength();
			for (var i = 0; i < count; i++) {
				if (this._history[i].getPath() == path) {
					return i;
				}
			}
			return false;
		},

		/**
		 * Get the number of items in the history
		 * 
		 * @return {Number}
		 */
		getLength: function() {
			return this._history.length;
		},

		/**
		 * Tell the navigator to go the current historyPosition
		 */
		_navigateToCurrentHistoryPosition: function() {
			var newState = this._history[this._historyPosition];
			this._navigator.request(newState);
		},

		/**
		 * Check what to do with the new state
		 *
		 * @param {Object} event
		 * @param {Object} update
		 */
		_handleStateChange: function(event, update) {
			var state = update.state;

			switch (this._navigationDirection) {

				case History.DIRECTION_BACK:
					this._navigationDirection = History.DIRECTION_NORMAL;
					break;

				case History.DIRECTION_NORMAL:

					// Strip every history state before current
					this._history.splice(0, this._historyPosition);

					// Add the state at the beginning of the history array
					this._history.unshift(state);
					this._historyPosition = 0;

					// Truncate the history to the max allowed items
					this._history.length = Math.min(this._history.length, this.maxLength);
					break;

				case History.DIRECTION_FORWARD:
					this._navigationDirection = History.DIRECTION_NORMAL;
					break;
			}
		}
	};

	// Copy the History object to the navigatorjs namespace
	navigatorjs.History = History;
}(jQuery));