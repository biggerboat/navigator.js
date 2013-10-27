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

		getPathRegex: function() {
			var segments = this.getSegments(),
				regexPath = "\/",
				segment,
				i, length = segments.length;

			for(i=0; i<length; i++) {
				segment = segments[i];

				if(segment == "**") {
					// match any character, including slashes (multiple segments)
					// eg: bla or bla/bla or bla/bla/bla
					regexPath = regexPath + "(.*)";
				} else if(segment == "*") {
					// match anything expect slashes and end with a slash (1 segment only).
					// eg: bla/ but not /bla/ or bla/bla/
					regexPath = regexPath + "([^/]*)\/";
				} else {
					// Either the segment, a wildcard or double wildcard and ends with a forward slash (1 segment only).
					// eg: segment/ or */ or **/
					regexPath = regexPath + "("+segment+"|\\*|\\*\\*)\/";
				}
			}

			return new RegExp(regexPath);
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
				foreignMatch = this.getPath().match(foreignState.getPathRegex()),
				nativeMatch = foreignState.getPath().match(this.getPathRegex()),
				isForeignMatch = foreignMatch && foreignMatch.index == 0 ? true : false,
				isNativeMatch = nativeMatch && nativeMatch.index == 0 ? true : false,
				foreignSegmentDoubleWildcardsMatch = foreignState.getPath().match(/\*\*/g),
				doubleWildcardsLength = foreignSegmentDoubleWildcardsMatch ? foreignSegmentDoubleWildcardsMatch.length : 0,
				tooManyForeignSegments = foreignSegments.length > (nativeSegments.length + doubleWildcardsLength),
				enoughNativeSegments = nativeSegments.length > foreignSegments.length;

			return (isForeignMatch || (isNativeMatch && enoughNativeSegments)) && !tooManyForeignSegments;
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
				subtractedState = this.subtract(state) || state.subtract(this); //Or the other way around for double wildcard states
			
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
				subtractedPath;

			if (!this.contains(operand)) {
				return null;
			}
			
			subtractedPath = this.getPath().replace(operand.getPathRegex(), "");

			return new navigatorjs.NavigationState(subtractedPath);
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