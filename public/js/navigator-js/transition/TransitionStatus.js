this.navigatorjs = this.navigatorjs || {};
this.navigatorjs.transition = this.navigatorjs.transition || {};

this.navigatorjs.transition.TransitionStatus = {};
this.navigatorjs.transition.TransitionStatus.UNINITIALIZED = -2;
this.navigatorjs.transition.TransitionStatus.INITIALIZED = -1;
this.navigatorjs.transition.TransitionStatus.HIDDEN = 1;
this.navigatorjs.transition.TransitionStatus.APPEARING = 2;
this.navigatorjs.transition.TransitionStatus.SHOWN = 3;
this.navigatorjs.transition.TransitionStatus.SWAPPING = 4;
this.navigatorjs.transition.TransitionStatus.DISAPPEARING = 5;

this.navigatorjs.transition.TransitionStatus.toString = function(status) {
	switch (status) {
		case navigatorjs.transition.TransitionStatus.UNINITIALIZED:
			return "UNINITIALIZED";
		case navigatorjs.transition.TransitionStatus.INITIALIZED:
			return "INITIALIZED";
		case navigatorjs.transition.TransitionStatus.HIDDEN:
			return "HIDDEN";
		case navigatorjs.transition.TransitionStatus.APPEARING:
			return "APPEARING";
		case navigatorjs.transition.TransitionStatus.SHOWN:
			return "SHOWN";
		case navigatorjs.transition.TransitionStatus.SWAPPING:
			return "SWAPPING";
		case navigatorjs.transition.TransitionStatus.DISAPPEARING:
			return "DISAPPEARING";
	}

	return "UNKNOWN";
};