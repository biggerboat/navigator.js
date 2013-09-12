this.navigatorjs = this.navigatorjs||{};

this.navigatorjs.NavigationBehaviors = {};

/**
 * Will show when the state matches, will hide when it doesn't
 */
this.navigatorjs.NavigationBehaviors.SHOW = "show";
/**
 * Will hide when the state matches, even if it has a show on a higher level
 */
this.navigatorjs.NavigationBehaviors.HIDE = "hide";
/**
 * Will update before any show method gets called
 */
this.navigatorjs.NavigationBehaviors.UPDATE = "update";
/**
 * Will swap out and in, when the state is changed
 */
this.navigatorjs.NavigationBehaviors.SWAP = "swap";
/**
 * Will ask for validation of the state, if a state can't be validated, it is denied
 */
this.navigatorjs.NavigationBehaviors.VALIDATE = "validate";
/**
 * Will try to add all behaviors, based on the class properties of the responder
 */
this.navigatorjs.NavigationBehaviors.AUTO = "auto";
/**
 * Used for looping through when the AUTO behavior is used.
 */
this.navigatorjs.NavigationBehaviors.ALL_AUTO = ["show", "update", "swap", "validate"];