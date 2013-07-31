$(function() {
	window.ApplicationRouter = Backbone.Router.extend({

		navigatorBehaviors: ["IHasStateUpdate"],

		routes: {
			"*any" : "onRouteChange"
		},

		initialize: function() {
			this.navigator = new navigatorjs.Navigator();

			this.initViews();
			this.initNavigator();
			this.initDebugConsole();
		},

		initViews: function() {
			this.chooseStateView = new ChooseStateView( { navigator: this.navigator } );

			this.redSquare = new ShapeView( { el: '#responders .red' } );
			this.greenSquare = new ShapeView( { el: '#responders .green' } );
			this.blueSquare = new ShapeView( { el: '#responders .blue' } );
			this.blackCircle = new ShapeView( { el: '#responders .black' } );
		},

		initNavigator: function() {
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

			// And then we decide the point at which the Navigator takes over
			this.navigator.start();
		},

		initDebugConsole: function() {
			this.debugConsole = new navigatorjs.features.DebugConsole(this.navigator);
			this.$debugConsole = this.debugConsole.get$El();
			this.$debugConsole.css({position:'fixed', left:10, bottom:10});
			$('body').append(this.$debugConsole);
		},

		updateState: function(truncatedState, fullState) {
			console.log('ApplicationRouter -> updateState ' + fullState.getPath());
			Backbone.history.navigate(fullState.getPath(), {trigger:true});
		},

		onRouteChange: function(route) {
			console.log('ApplicationRouter -> onRouteChange ' + route);
			this.navigator.request(route);
		}
	});
});