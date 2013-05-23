this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.features = this.navigatorjs.features||{};

(function() {
	var DebugConsole = function (navigator) {
		var _navigator = navigator;
		var template = '<div class="debugConsole">Path: <input type="text" class="path" /><div class="responders"></div></div>';
		var that = this;
		var visible = true;
		var inputRegex = new RegExp("[-_/A-Za-z0-9]");

		this.$el = $(template);
		this.$pathInput = this.$el.find(".path");

		//STYLING
		this.$el.css({
			backgroundColor: '#000000',
			color: '#AAAAAA',
			fontFamily: 'Arial',
			fontSize: 12,
			padding: 5
		});

		this.$pathInput.css({
			color: '#00FF00',
			backgroundColor: 'transparent',
			fontSize: 12,
			border: 0
		});

		//Input keydown validation and requesting the entered path
		this.$pathInput.on('keypress', function(e) {
			switch(e.which) {
				case 13: //Return
					e.preventDefault(); //Prevent char from writing in textfield
					navigator.request(that.$pathInput.val());
					return;
				break;
				case 8: //Backspace
				case 0: //Others such as arrows
					return; //This can just be executed
					break;
			}

			var char = String.fromCharCode(e.which);
			if(!inputRegex.test(char)) {
				e.preventDefault(); //Prevent char from writing in textfield
			}

		});

		//Toggle showing debug console
		$(window).on('keypress', function(e) {
			switch(String.fromCharCode(e.which)) {
				case "~":
				case "$":
				case "`":
					visible = !visible;
					that.$el.css({display:visible ? '' : 'none'});
					break;
			}
		});
	};

	//PUBLIC API
	DebugConsole.prototype = {

	};

	navigatorjs.features.DebugConsole = DebugConsole;
}());