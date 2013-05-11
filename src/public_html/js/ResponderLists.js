this.navigatorjs = this.navigatorjs||{};

(function() {
	var ResponderLists = function () {

		this.validateByPath = {};
		this.updateByPath = {};
		this.swapByPath = {};
		this.showByPath = {};
		this.hideByPath = {};
		this.swappedBefore ={};

		this.all = [this.validateByPath,
					this.updateByPath,
					this.swapByPath,
					this.showByPath,
					this.hideByPath,
					this.swappedBefore];
	};

	//PUBLIC API
	ResponderLists.prototype = {
		validateByPath: null, //[]
		updateByPath: null, //[]
		swapByPath: null, //[]
		showByPath: null, //[]
		hideByPath: null, //[]
		swappedBefore: null, //[]
		all: null //[]
	};

	navigatorjs.ResponderLists = ResponderLists;
}());