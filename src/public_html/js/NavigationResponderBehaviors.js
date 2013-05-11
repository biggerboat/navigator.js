this.navigatorjs = this.navigatorjs||{};

this.navigatorjs.NavigationResponderBehaviors = {};
this.navigatorjs.NavigationResponderBehaviors.IHasStateInitialization = {name:"IHasStateInitialization", methods: ["initialize"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidation = {name: "IHasStateValidation", methods: ["validate"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationAsync = {name: "IHasStateValidationAsync", methods: ["validate", "prepareValidation"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationOptional = {name: "IHasStateValidationOptional", methods: ["validate", "willValidate"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationOptionalAsync = {name: "IHasStateValidationOptionalAsync", methods: ["validate", "willValidate", "prepareValidation"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateRedirection = {name: "IHasStateRedirection", methods: ["validate","redirect"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateSwap = {name: "IHasStateSwap", methods: ["willSwapToState","swapOut", "swapIn"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateTransition = {name: "IHasStateTransition", methods: ["transitionIn","transitionOut"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateUpdate = {name: "IHasStateUpdate", methods: ["updateState"]};