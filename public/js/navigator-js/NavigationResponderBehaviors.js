this.navigatorjs = this.navigatorjs || {};

this.navigatorjs.NavigationResponderBehaviors = {};
this.navigatorjs.NavigationResponderBehaviors.IHasStateInitialization = {name: "IHasStateInitialization", methods: ["initializeByNavigator"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidation = {name: "IHasStateValidation", methods: ["validate"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationAsync = {name: "IHasStateValidationAsync", "extends": ["IHasStateValidation"], methods: ["prepareValidation"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationOptional = {name: "IHasStateValidationOptional", "extends": ["IHasStateValidation"], methods: ["willValidate"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationOptionalAsync = {name: "IHasStateValidationOptionalAsync", "extends": ["IHasStateValidationAsync", "IHasStateValidationOptional"], methods: []};
this.navigatorjs.NavigationResponderBehaviors.IHasStateRedirection = {name: "IHasStateRedirection", "extends": ["IHasStateValidation"], methods: ["redirect"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateSwap = {name: "IHasStateSwap", methods: ["willSwapToState", "swapOut", "swapIn"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateTransition = {name: "IHasStateTransition", methods: ["transitionIn", "transitionOut"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateUpdate = {name: "IHasStateUpdate", methods: ["updateState"]};

this.navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface = function(object, _interface) {
	if (object.navigatorBehaviors == undefined || !object.navigatorBehaviors instanceof Array) {
		//The input interface is not set on object's navigatorBehaviors.
		return false;
	}

	var inheritanceChain = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain(_interface),
		methodsToBeImplemented = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(inheritanceChain),
		i, method,
		length = methodsToBeImplemented.length;

	for (i = 0; i < length; i++) {
		method = methodsToBeImplemented[i];

		if (object[method] == undefined || typeof object[method] !== 'function') {
			return false;
		}
	}

	return true;
};

this.navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain = function(_interface, existingChain) {
	var chain = existingChain || [],
		extendsArray,
		extendingInterface,
		i, length,
		interfaceObject = navigatorjs.NavigationResponderBehaviors[_interface];

	if (interfaceObject == undefined || typeof interfaceObject !== 'object') {
//		console.log('behaviorObject for interface is undefined ', interface );
		return chain;
	}

	chain.push(_interface);
	extendsArray = interfaceObject["extends"];
	if (extendsArray == undefined) {
//		console.log('extendsArray for interface is undefined, the chain ends here ', interface, chain);
		return chain;
	}

	length = extendsArray.length;

	for (i = 0; i < length; i++) {
		extendingInterface = extendsArray[i];
		if (chain.indexOf(extendingInterface) == -1) {
			//We did not yet extend this interface, so continue to follow the chain
			navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain(extendingInterface, chain);
		}
	}

	return chain;
};

this.navigatorjs.NavigationResponderBehaviors.getInterfaceMethods = function(interfaces) {
	if (interfaces == undefined || !interfaces instanceof Array) {
		//No valid input
		return [];
	}

	var combinedInterfacesChain = [],
		_interface, i,
		length = interfaces.length,
		interfaceObject,
		interfaceMethods,
		j, methodsLength, method,
		methods = [];

	for (i = 0; i < length; i++) {
		_interface = interfaces[i];
		navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain(_interface, combinedInterfacesChain);
	}

	length = combinedInterfacesChain.length;
	for (i = 0; i < length; i++) {
		_interface = combinedInterfacesChain[i];
		interfaceObject = navigatorjs.NavigationResponderBehaviors[_interface];
		interfaceMethods = interfaceObject.methods;
		if (interfaceObject != undefined && typeof interfaceObject === 'object' && interfaceMethods != undefined && interfaceMethods instanceof Array) {
			methodsLength = interfaceMethods.length;
			for (j = 0; j < methodsLength; j++) {
				method = interfaceMethods[j];
				if (methods.indexOf(method) == -1) {
					methods.push(method);
				}
			}
		}
	}

	return methods;
};
