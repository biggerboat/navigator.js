$(function() {
	window.ApplicationRouter = Backbone.Router.extend({

		navigatorBehaviors: ["IHasStateUpdate"],

		routes: {
			"*any" : "onRouteChange"
		},

		initialize: function() {
			this.navigator = new navigatorjs.Navigator();

			this.initViews();
			this.initNavigationStates();
			this.initDebugConsole();

			this.navigator.start();
		},

		initViews: function() {
			this.chooseStateView = new ChooseStateView( { navigator: this.navigator } );

			this.redSquare = new ShapeView( { el: '#responders .red' } );
			this.greenSquare = new ShapeView( { el: '#responders .green' } );
			this.blueSquare = new ShapeView( { el: '#responders .blue' } );
			this.blackCircle = new ShapeView( { el: '#responders .black' } );
		},

		initNavigationStates: function() {
			this.navigator.add(this, "*");

			this.navigator.add(this.redSquare, "red");
			this.navigator.add(this.greenSquare, "green");
			this.navigator.add(this.blueSquare, "blue");
			this.navigator.add(this.blackCircle, "black");

			// We can add one responder to as many states as we like.
			this.navigator.add(this.redSquare, "*/red");
			this.navigator.add(this.greenSquare, "*/green");
			this.navigator.add(this.blueSquare, "*/blue");
			this.navigator.add(this.blackCircle, "*/black");
		},

		initDebugConsole: function() {
			var debugConsole = new navigatorjs.features.DebugConsole(this.navigator),
				$debugConsole = debugConsole.get$El(),
				cssPosition = {position:'fixed', left:10, bottom:10};

			$debugConsole.css(cssPosition).appendTo('body');
		},

		updateState: function(truncatedState, fullState) {
			Backbone.history.navigate(fullState.getPath());
		},

		onRouteChange: function(route) {
			this.navigator.request(route);
		}
	});
});