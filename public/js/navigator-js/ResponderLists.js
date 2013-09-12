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
		all: null, //[]

		toString: function() {
			var s = "ResponderLists [",
				variable,
				list, contents, key;

			for (variable in this) {
				list = this[variable];
				
				if(this.all.indexOf(list)>-1) {
					contents = [];
					for (key in list) {
						contents.push("[" + key + " = " + list[key] + "]");
					}
					s += "\n\t[" + variable + ": " + contents.join(", ") + "], ";
				}
			}

			s += "]";
			return s;
		}
	};

	navigatorjs.ResponderLists = ResponderLists;
}());