this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.features = this.navigatorjs.features||{};

(function() {



	var DebugConsole = function (navigator) {
		navigatorjs.utils.AutoBind(this, this);

		var _navigator = navigator;
		var template = '<div class="debugConsole">Path: <input type="text" class="path" /><div class="responders"><div class="names"></div><div class="status"></div></div></div>';
		var that = this;
		var visible = true;
		var inputRegex = new RegExp("[-_/A-Za-z0-9]");

		this.$el = $(template);
		this.$pathInput = this.$el.find(".path");
		this.$responders = this.$el.find(".responders");
		this.$responderNames = this.$responders.find(".names");
		this.$responderStatus = this.$responders.find(".status");

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

		this.$responderNames.css({
			//float: 'left',
			display: 'inline-block',
			color: '#FF9900',
			marginRight: 15
		});

		this.$responderStatus.css({
			display: 'inline-block'
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

		var handleStatusUpdated = function(e, data) {
			console.log('handleStatusUpdated -> handleStatusUpdated', e, data);
			updateDisplay(data.respondersByID, data.statusByResponderID);
		};

		var updateDisplay = function(respondersByID, statusByResponderID) {
			var currentState = _navigator.getCurrentState(),
				responderID, responder, status, color, responderNamesHTMLString = "", responderStatusHTMLString = "";
			if (!currentState) return;

			that.$pathInput.val(currentState.getPath());
			
			for(responderID in respondersByID) {
				responder = respondersByID[responderID];
				status = statusByResponderID[responderID];

				if(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateTransition") || navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateInitialization")) {
					responderNamesHTMLString += responder + " <br />";
					color = getColorByStatus(status);
					responderStatusHTMLString += "<span style=\" color:" + color + "; font-weight:bold;\">" + navigatorjs.transition.TransitionStatus.toString(status) + "</span><br />";
				}
			}

			that.$responderNames.html(responderNamesHTMLString);
			that.$responderStatus.html(responderStatusHTMLString);
		};

		var getColorByStatus = function(status) {
			var color = "";
			switch(status) {
				case navigatorjs.transition.TransitionStatus.UNINITIALIZED:
					color = "#AAAAAA";
					break;
				case navigatorjs.transition.TransitionStatus.INITIALIZED:
					color = "#FFFFFF";
					break;
				case navigatorjs.transition.TransitionStatus.HIDDEN:
					color = "#FF0000";
					break;
				case navigatorjs.transition.TransitionStatus.APPEARING:
				case navigatorjs.transition.TransitionStatus.DISAPPEARING:
					color = "#FFFF00";
					break;
				case navigatorjs.transition.TransitionStatus.SHOWN:
					color = "#00FF00";
					break;
			}

			return color;
		};

		_navigator.on(navigatorjs.NavigatorEvent.STATE_CHANGED, handleStatusUpdated);
		_navigator.on(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, handleStatusUpdated);

	};

	//PUBLIC API
	DebugConsole.prototype = {

	};

	navigatorjs.features.DebugConsole = DebugConsole;
}());