this.navigatorjs = this.navigatorjs||{};

this.navigatorjs.NavigationResponderBehaviors = {};
this.navigatorjs.NavigationResponderBehaviors.IHasStateInitialization = {name:"IHasStateInitialization", methods: ["initialize"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidation = {name: "IHasStateValidation", methods: ["validate"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationAsync = {name: "IHasStateValidationAsync", extends: ["IHasStateValidation"], methods: ["prepareValidation"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationOptional = {name: "IHasStateValidationOptional", extends: ["IHasStateValidation"], methods: ["willValidate"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateValidationOptionalAsync = {name: "IHasStateValidationOptionalAsync", extends: ["IHasStateValidationAsync", "IHasStateValidationOptional"], methods: []};
this.navigatorjs.NavigationResponderBehaviors.IHasStateRedirection = {name: "IHasStateRedirection", extends: ["IHasStateValidation"], methods: ["redirect"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateSwap = {name: "IHasStateSwap", methods: ["willSwapToState","swapOut", "swapIn"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateTransition = {name: "IHasStateTransition", methods: ["transitionIn","transitionOut"]};
this.navigatorjs.NavigationResponderBehaviors.IHasStateUpdate = {name: "IHasStateUpdate", methods: ["updateState"]};

this.navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface = function(object, interface) {
	if(object.navigatorBehaviors==undefined || !object.navigatorBehaviors instanceof Array || object.navigatorBehaviors.indexOf(interface)==-1) {
		//The input interface is not set on object's navigatorBehaviors.
		return false;
	}

	var inheritanceChain = navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain(interface),
		methodsToBeImplemented = navigatorjs.NavigationResponderBehaviors.getInterfaceMethods(inheritanceChain),
		index,
		length = methodsToBeImplemented.length,
		method;

	for(index=0; index<length; index++) {
		method = methodsToBeImplemented[index];

		if(object[method]==undefined || typeof object[method] !== 'function') {
			return false;
		}
	}

	return true;
};

this.navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain = function(interface, existingChain) {
	var chain = existingChain || [],
		extendsArray,
		extendingInterface,
		index, length,
		interfaceObject = navigatorjs.NavigationResponderBehaviors[interface];

	if(interfaceObject==undefined || typeof interfaceObject!=='object') {
//		console.log('behaviorObject for interface is undefined ', interface );
		return chain;
	}

	chain.push(interface);
	extendsArray = interfaceObject["extends"];
	if(extendsArray==undefined) {
//		console.log('extendsArray for interface is undefined, the chain ends here ', interface, chain);
		return chain;
	}

	length = extendsArray.length;

	for(index=0; index<length; index++) {
		extendingInterface = extendsArray[index];
		if(chain.indexOf(extendingInterface)==-1) {
			//We did not yet extend this interface, so continue to follow the chain
			navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain(extendingInterface, chain);
		}
	}

	return chain;
};

this.navigatorjs.NavigationResponderBehaviors.getInterfaceMethods = function(interfaces) {
	if(interfaces == undefined || !interfaces instanceof Array) {
		//No valid input
		return [];
	}

	var combinedInterfacesChain = [],
		interface,
		index,
		length = interfaces.length,
		interfaceObject,
		interfaceMethods,
		methodIndex, methodsLength, method,
		methods = [];

	for(index=0; index<length; index++) {
		interface = interfaces[index];
		navigatorjs.NavigationResponderBehaviors.getInterfaceInheritanceChain(interface, combinedInterfacesChain);
	}

	length = combinedInterfacesChain.length;
	for(index=0; index<length; index++) {
		interface = combinedInterfacesChain[index];
		interfaceObject = navigatorjs.NavigationResponderBehaviors[interface];
		interfaceMethods = interfaceObject.methods;
		if(interfaceObject!=undefined && typeof interfaceObject==='object' && interfaceMethods!=undefined && interfaceMethods instanceof Array) {
			methodsLength = interfaceMethods.length;
			for(methodIndex=0; methodIndex<methodsLength; methodIndex++) {
				method = interfaceMethods[methodIndex];
				if(methods.indexOf(method)==-1) {
					methods.push(method);
				}
			}
		}
	}

	return methods;
};