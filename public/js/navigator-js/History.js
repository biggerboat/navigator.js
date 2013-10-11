this.navigatorjs = this.navigatorjs || {};

(function($) {

	/**
	 * History manager for the navigator
	 * 
	 * @example 
	 *	<code>
	 *		
	 *		// Create the normal navigator
	 *		var navigator = new navigatorjs.Navigator();
	 *		
	 *		// Create the history and supply the navigator it should manage
	 *		var myHistory : NavigatorHistory = new NavigatorHistory(myNavigator);
	 *		
	 *		-----
	 *		
	 *		// Go back in time
	 *		myHistory.back();
	 *		
	 *	</code>
	 *
	 * @param  {Navigator} navigator
	 * @author Studio Sugarfree - Laurent
	 * @created 11 oct 2013
	 */
	var History = function(navigator) {

		// Bind the methods to this scope
		navigatorjs.utils.AutoBind(this, this);

		// Initialize the instance
		this._initialize(navigator);
	};

	// Default max history length
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
		 * @param navigator Navigator
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
		 * @param steps The number of steps to go back in history
		 * @return Returns false if there was no previous state
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
		 * @param steps The number of steps to go forward in history
		 * @return Returns false if there was no next state
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
		 * @param steps The number of steps to go back in history
		 * @return The found state or null if no state was found
		 */
		previousState: function(steps) {

			// Cannot go beyond the first entry in history
			if (this._historyPosition == this._history.length - 1) {
				return null;
			}

			// Set to 1 by default
			steps = steps || 1;

			// Fetch the requested state in history
			var position = Math.min(this._history.length - 1, this._historyPosition + steps);
			return this._history[position];
		},

		/**
		 * Go forward in the history and return that NavigationState
		 * 
		 * @param steps The number of steps to go back in history
		 * @return The found state or null if no state was found
		 */
		getNextState: function(steps) {

			// Cannot look into the future (for now ;-))
			if (this._historyPosition === 0) {
				return null;
			}

			// Set to 1 by default
			steps = steps || 1;

			// Fetch the requested state in history
			var position = Math.max(0, this._historyPosition - steps);
			return this._history[position];
		},

		/**
		 * Clear up navigation history
		 */
		clearHistory: function() {
			this._history = [];
			this._historyPosition = 1;
		},

		/**
		 * Get the state by historyposition
		 * 
		 * @param position The position in history
		 * @return NavigationState The found state or null if no state was found
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
		 * @param NavigationState - state The state in history
		 * @return Number - The found position or -1 if no position was found
		 */
		getPositionByState: function(state) {
			return this._history.indexOf(state);
		},

		/**
		 * Get an array with the states in the history
		 * @return Array
		 */
		history: function() {
			return this._history;
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
		 */
		_handleStateChange: function(event) {
			var state = event.state;

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