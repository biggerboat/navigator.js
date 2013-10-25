this.navigatorjs = this.navigatorjs || {};

(function() {
	var NavigationState = function(pathStringOrArray) {
		this._path = '';

		if (pathStringOrArray instanceof Array) {
			this.setSegments(pathStringOrArray);
		} else {
			this.setPath(pathStringOrArray);
		}
	};

	NavigationState.make = function(stateOrPath) {
		return stateOrPath instanceof navigatorjs.NavigationState ? stateOrPath : new navigatorjs.NavigationState(stateOrPath);
	};

	NavigationState.prototype = {
		setPath: function(path) {
			this._path = '/' + path.toLowerCase() + '/';
			this._path = this._path.replace(new RegExp("[^-_/A-Za-z0-9* ]", "g"), "");
			this._path = this._path.replace(new RegExp("\/+", "g"), "/");
			this._path = this._path.replace(/\s+/g, "-");

			return this;
		},

		getPath: function() {
			return this._path;
		},

		setSegments: function(segments) {
			this.setPath(segments.join("/"));
		},

		getSegments: function() {
			var segments = this._path.split("/");

			segments.pop();
			segments.shift();

			return segments;
		},

		getSegment: function(index) {
			return this.getSegments()[index];
		},

		getFirstSegment: function() {
			return this.getSegment(0);
		},

		getLastSegment: function() {
			var segments = this.getSegments();
			return this.getSegment(segments.length - 1);
		},

		contains: function(foreignStateOrPathOrArray) {
			if(foreignStateOrPathOrArray instanceof Array) {
				return this._containsStateInArray(foreignStateOrPathOrArray);
			}

			var foreignStateOrPath = foreignStateOrPathOrArray, //if we get this far, it is a state or path
				foreignState = NavigationState.make(foreignStateOrPath),
				foreignSegments = foreignState.getSegments(),
				nativeSegments = this.getSegments(),
				isWildcard, isDoubleWildcard,
				foreignSegment, nativeSegment,
				nextForeignSegment, nextNativeSegment,
				foreignLength = foreignSegments.length,
				nativeLength = nativeSegments.length,
				length = Math.max(foreignLength, nativeLength),
				i, foreignIndex;

			for (i = foreignIndex = 0; i < length; i++) {
				foreignIndex = i;

				if(foreignIndex >= nativeLength) {
					//We are ahead of the length of the nativeState, we can no longer contain the foreignState
					return false;
				} else if(foreignIndex >= foreignLength || i >= nativeLength) {
					//We will run out of indexes on either. This means we got thus far and contain the operand.
					return true;
				}

				foreignSegment = foreignSegments[foreignIndex];
				nativeSegment = nativeSegments[i];

				if(foreignSegment === "**") {
					//Are we done matching segments?
					if(foreignLength == foreignIndex+1) {
						return true;
					}

					if(i+1 < nativeLength && foreignIndex+1 <foreignLength) {
						nextForeignSegment = nativeSegments[foreignIndex+1];
						nextNativeSegment = nativeSegments[i+1];
					}
				}

				isWildcard = foreignSegment === "*" || nativeSegment === "*";
				if (!(isWildcard) && foreignSegment !== nativeSegment) {
					return false;
				}
			}

			return true;
		},

		_containsStateInArray: function(foreignStatesOrPaths) {
			var i, length = foreignStatesOrPaths.length,
				foreignStateOrPath;

			for(i=0; i<length; i++){
				foreignStateOrPath = foreignStatesOrPaths[i];
				if(this.contains(foreignStateOrPath)) {
					return true;
				}
			}

			return false;
		},

		equals: function(stateOrPathOrArray) {
			if(stateOrPathOrArray instanceof Array) {
				return this._equalsStateInArray(stateOrPathOrArray);
			}

			var stateOrPath = stateOrPathOrArray, //if we get this far, it is a state or path
				state = NavigationState.make(stateOrPath),
				subtractedState = this.subtract(state);

			if (subtractedState === null) {
				return false;
			}

			return subtractedState.getSegments().length === 0;
		},

		_equalsStateInArray: function(statesOrPaths) {
			var i, length = statesOrPaths.length,
				stateOrPath;

			for(i=0; i<length; i++){
				stateOrPath = statesOrPaths[i];
				if(this.equals(stateOrPath)) {
					return true;
				}
			}

			return false;
		},

		subtract: function(operandStateOrPath) {
			var operand = NavigationState.make(operandStateOrPath),
				subtractedSegments;

			if (!this.contains(operand)) {
				return null;
			}

			subtractedSegments = this.getSegments();
			subtractedSegments.splice(0, operand.getSegments().length);

			return new navigatorjs.NavigationState(subtractedSegments);
		},

		append: function(stringOrState) {
			var path = stringOrState;
			if (stringOrState instanceof NavigationState) {
				path = stringOrState.getPath();
			}
			return this.setPath(this._path + path);
		},

		prepend: function(stringOrState) {
			var path = stringOrState;
			if (stringOrState instanceof NavigationState) {
				path = stringOrState.getPath();
			}
			return this.setPath(path + this._path);
		},

		hasWildcard: function() {
			return this.getPath().indexOf("/*/") != -1;
		},

		mask: function(sourceStateOrPath) {
			var sourceState = NavigationState.make(sourceStateOrPath),
				unmaskedSegments = this.getSegments(),
				sourceSegments = sourceState.getSegments(),
				length = Math.min(unmaskedSegments.length, sourceSegments.length),
				i;

			for (i = 0; i < length; i++) {
				if (unmaskedSegments[i] === "*") {
					unmaskedSegments[i] = sourceSegments[i];
				}
			}

			return new navigatorjs.NavigationState(unmaskedSegments);
		},

		clone: function() {
			return new navigatorjs.NavigationState(this._path);
		}
	};

	navigatorjs.NavigationState = NavigationState;
}());