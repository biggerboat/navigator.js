$( function() {
	window.ChooseStateView = Backbone.View.extend({
		el: '.chooseStateView',

		events: {
			'click a': 'onStateClick'
		},

		initialize: function (options) {
			this.navigator = options.navigator;
			_.bind(this.onStateClick, this);
		},

		onStateClick: function( e ) {
			e.preventDefault();
		    var path = $(e.target).attr('href');

            this.navigator.request(path);
            //window.router.navigate(path, {trigger: true});
		},

		render: function () {

			return this;
		}
	});
});
