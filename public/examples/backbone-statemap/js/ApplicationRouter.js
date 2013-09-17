$(function() {
	window.ApplicationRouter = Backbone.Router.extend({

		navigatorBehaviors: ["IHasStateUpdate"],

		routes: {
			"*any" : "onRouteChange"
		},

		initialize: function() {
			this.navigator = new navigatorjs.Navigator();

			this.initViews();
			this.mapStates();
			this.initDebugConsole();

			this.navigator.start();
		},

		initViews: function() {
			this.chooseStateView = new ChooseStateView( { navigator: this.navigator } );
		},

		mapStates: function() {
			var $stateMapRoot = $("#responders");
			this.stateViewMap = new navigatorjs.integration.StateViewMap(this.navigator, $stateMapRoot);

			this.stateViewMap.mapState(["red","*/red"]).toView(ShapeView).withArguments({className: 'red'});
			this.stateViewMap.mapState(["green","*/green"]).toView(ShapeView).withArguments({className: 'green'});
			this.stateViewMap.mapState(["blue","*/blue"]).toView(ShapeView).withArguments({className: 'blue'});
			this.stateViewMap.mapState(["black","*/black"]).toView(ShapeView).withArguments({className: 'black circle'});
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