this.navigatorjs = this.navigatorjs||{};
this.navigatorjs.features = this.navigatorjs.features||{};

(function() {

	var _navigator = null,
		_template = '<div class="debugConsole">Path: <input type="text" class="path" /><div class="responders"><div class="names"></div><div class="status"></div></div></div>',
		_visible = true,
		_inputRegex = new RegExp("[-_/A-Za-z0-9]"),
		_$el = null,
		_$pathInput = null,
		_$responders = null,
		_$responderNames = null,
		_$responderStatus = null;

	//Input keydown validation and requesting the entered path
	var _onKeyPress = function(e) {
		switch(e.which) {
			case 13: //Return
				e.preventDefault(); //Prevent char from writing in textfield
				_navigator.request(_$pathInput.val());
				return;
				break;
			case 8: //Backspace
			case 0: //Others such as arrows
				return; //This can just be executed
				break;
		}

		var char = String.fromCharCode(e.which);
		if(!_inputRegex.test(char)) {
			e.preventDefault(); //Prevent char from writing in textfield
		}
	};

	//Toggle showing debug console
	var _onWindowKeyPress = function(e) {
		switch(String.fromCharCode(e.which)) {
			case "~":
			case "$":
			case "`":
				_visible = !_visible;
				_$el.css({display:_visible ? '' : 'none'});
				break;
		}
	};

	var _handleStatusUpdated = function(e, data) {
		_updateDisplay(data.respondersByID, data.statusByResponderID);
	};

	var _updateDisplay = function(respondersByID, statusByResponderID) {
		var currentState = _navigator.getCurrentState(),
			responderID, responder, status, color, responderNamesHTMLString = "", responderStatusHTMLString = "";
		if (!currentState) return;

		_$pathInput.val(currentState.getPath());

		for(responderID in respondersByID) {
			responder = respondersByID[responderID];
			status = statusByResponderID[responderID];

			if(navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateTransition") || navigatorjs.NavigationResponderBehaviors.implementsBehaviorInterface(responder, "IHasStateInitialization")) {
				responderNamesHTMLString += '<span data-responder-id="'+responderID+'">' + responder + '</span><br />';
				color = _getColorByStatus(status);
				responderStatusHTMLString += '<span style=" color:' + color + '; font-weight:bold;" data-responder-id="'+responderID+'">' + navigatorjs.transition.TransitionStatus.toString(status) + '</span><br />';
			}
		}

		_$responderNames.html(responderNamesHTMLString);
		_$responderStatus.html(responderStatusHTMLString);
	};

	var _getColorByStatus = function(status) {
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

	var DebugConsole = function (navigator) {
		_navigator = navigator;

		_$el = $(_template);
		_$pathInput = _$el.find(".path");
		_$responders = _$el.find(".responders");
		_$responderNames = _$responders.find(".names");
		_$responderStatus = _$responders.find(".status");

		//STYLING
		_$el.css({
			backgroundColor: '#000000',
			color: '#AAAAAA',
			fontFamily: 'Arial',
			fontSize: 12,
			padding: 5
		});

		_$pathInput.css({
			color: '#00FF00',
			backgroundColor: 'transparent',
			fontSize: 12,
			border: 0
		});

		_$responderNames.css({
			display: 'inline-block',
			color: '#FF9900',
			marginRight: 15
		});

		_$responderStatus.css({
			display: 'inline-block'
		});


		_$pathInput.on('keypress', _onKeyPress);
		$(window).on('keypress', _onWindowKeyPress);

		_navigator.on(navigatorjs.NavigatorEvent.STATE_CHANGED, _handleStatusUpdated);
		_navigator.on(navigatorjs.NavigatorEvent.TRANSITION_STATUS_UPDATED, _handleStatusUpdated);
	};

	//PUBLIC API
	DebugConsole.prototype = {
		get$El: function() {return _$el;}
	};

	navigatorjs.features.DebugConsole = DebugConsole;
}());