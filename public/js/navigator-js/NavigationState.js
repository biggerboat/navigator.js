this.navigatorjs = this.navigatorjs||{};

(function() {
	var NavigationState = function (aPathStringOrArray) {
		this._path = '';
		
		if (aPathStringOrArray instanceof Array) {
			this.setSegments(aPathStringOrArray);
		} else {
			this.setPath(aPathStringOrArray);
		}
	};

	NavigationState.make = function(stateOrPath) {
		return stateOrPath instanceof navigatorjs.NavigationState ? stateOrPath : new navigatorjs.NavigationState(stateOrPath);
	};

	NavigationState.prototype = {
		setPath: function (aPath) {
			this._path = '/' + aPath.toLowerCase() + '/';
			this._path = this._path.replace(new RegExp("\/+", "g"), "/");
			this._path = this._path.replace(/\s+/g, "-");
		},

		getPath: function () {
			return this._path;
		},

		setSegments: function (aSegments) {
			this.setPath(aSegments.join("/"));
		},

		getSegments: function () {
			var theSegments = this._path.split("/");

			theSegments.pop();
			theSegments.shift();

			return theSegments;
		},

		getSegment: function (aIndex) {
			return this.getSegments()[aIndex];
		},

		getFirstSegment: function () {
			return this.getSegment(0);
		},

		getLastSegment: function () {
			var theSegments = this.getSegments();
			return this.getSegment(theSegments.length - 1);
		},

		contains: function (aForeignState) {
			var theForeignSegments = aForeignState.getSegments(),
				theNativeSegments = this.getSegments(),
				theForeignSegment, theNativeSegment,
				theIndex;

			if (theForeignSegments.length > theNativeSegments.length) {
				return false;
			}

			for (theIndex = 0; theIndex < theForeignSegments.length; theIndex++) {
				theForeignSegment = theForeignSegments[theIndex];
				theNativeSegment = theNativeSegments[theIndex];

				if (!(theForeignSegment === "*" || theNativeSegment === "*") && theForeignSegment !== theNativeSegment) {
					return false;
				}
			}

			return true;
		},

		equals: function (aState) {
			var theSubtractedState = this.subtract(aState);

			if (theSubtractedState === null) {
				return false;
			}

			return theSubtractedState.getSegments().length === 0;
		},

		subtract: function(aOperand) {
			var theSubtractedSegments;

			if (!this.contains(aOperand)) {
				return null;
			}

			theSubtractedSegments = this.getSegments();
			theSubtractedSegments.splice(0, aOperand.getSegments().length);

			return new navigatorjs.NavigationState(theSubtractedSegments);
		},

		append: function(aStringOrState) {
			var thePath = aStringOrState;
			if (aStringOrState instanceof NavigationState) {
				thePath = aStringOrState.getPath();
			}
			return this.setPath(this._path + thePath);
		},

		prepend: function(aStringOrState) {
			var thePath = aStringOrState;
			if (aStringOrState instanceof NavigationState) {
				thePath = aStringOrState.getPath();
			}
			return this.setPath(thePath + this._path);
		},

		hasWildcard: function() {
			return this.getPath().indexOf("*") != -1;
		},

		mask: function(aSource) {
			var theUnmaskedSegments = this.getSegments(),
				theSourceSegments = aSource.getSegments(),
				theLength = Math.min(theUnmaskedSegments.length, theSourceSegments.length),
				theIndex;

			for(theIndex=0; theIndex<theLength; theIndex++) {
				if(theUnmaskedSegments[theIndex] === "*") {
					theUnmaskedSegments[theIndex] = theSourceSegments[theIndex];
				}
			}

			return new navigatorjs.NavigationState(theUnmaskedSegments);
		},

		clone: function() {
			return new navigatorjs.NavigationState(this._path);
		}
	};

	navigatorjs.NavigationState = NavigationState;
}());