$(function() {
	window.ApplicationRouter = Backbone.Router.extend({

		routes: {
			"*any" : "onRouteChange"
		},

		initialize: function() {
			this.initViews();
		},

		initViews: function() {
			this.chooseStateView = new ChooseStateView();
			this.redShape = new ShapeView( { el: '.red' } );
			this.greenShape = new ShapeView( { el: '.green' } );
			this.blueShape = new ShapeView( { el: '.blue' } );
			this.blackShape = new ShapeView( { el: '.black' } );
		},

		onRouteChange: function(route) {
			console.log('ApplicationRouter -> onRouteChange '+ route);
		}
	});
});