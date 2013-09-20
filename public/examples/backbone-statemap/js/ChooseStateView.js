$(function() {
	window.ChooseStateView = Backbone.View.extend({
		el: '.chooseStateView',

		events: {
			'click a': 'onStateClick'
		},

		initialize: function(options) {
			this.navigator = options.navigator;
			_.bind(this.onStateClick, this);
		},

		onStateClick: function(e) {
			e.preventDefault();
			var path = $(e.target).attr('href');

			this.navigator.request(path);

			/**
			 * Even though the next line will work in most situations,
			 * it is recommended to only use navigator.request().
			 * For example, when using wildcard states, the Backbone-
			 * router has no filtering mechanism and the '*' will appear
			 * in your address bar and navigation history.
			 * Besides that, the optional state validation will be executed
			 * after the address bar was updated, which is not desirable.
			 */
//          window.router.navigate(path, {trigger: true});
		}
	});
});
