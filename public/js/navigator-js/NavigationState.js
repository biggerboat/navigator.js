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
			this._path = this._path.replace(new RegExp("\/+", "g"), "/");
			this._path = this._path.replace(/\s+/g, "-");
			this._path = this._path.replace(new RegExp("[^-_/A-Za-z0-9*]", "g"), "");
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

		contains: function(foreignState) {
			var foreignSegments = foreignState.getSegments(),
				nativeSegments = this.getSegments(),
				foreignSegment, nativeSegment,
				i;

			if (foreignSegments.length > nativeSegments.length) {
				return false;
			}

			for (i = 0; i < foreignSegments.length; i++) {
				foreignSegment = foreignSegments[i];
				nativeSegment = nativeSegments[i];

				if (!(foreignSegment === "*" || nativeSegment === "*") && foreignSegment !== nativeSegment) {
					return false;
				}
			}

			return true;
		},

		equals: function(state) {
			var subtractedState = this.subtract(state);

			if (subtractedState === null) {
				return false;
			}

			return subtractedState.getSegments().length === 0;
		},

		subtract: function(operand) {
			var subtractedSegments;

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
			return this.getPath().indexOf("*") != -1;
		},

		mask: function(sourceState) {
			var unmaskedSegments = this.getSegments(),
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