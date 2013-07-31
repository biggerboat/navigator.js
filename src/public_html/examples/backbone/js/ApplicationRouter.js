$(function() {
	window.ApplicationRouter = Backbone.Router.extend({

		routes: {
			"*any" : "onRouteChange"
		},

		initialize: function() {

		},

		onRouteChange: function(route) {
			console.log('ApplicationRouter -> onRouteChange '+ route);
		}
	});
});