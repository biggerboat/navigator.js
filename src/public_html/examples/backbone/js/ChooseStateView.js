$( function() {
	window.ChooseStateView = Backbone.View.extend({
		el: '.chooseStateView',

		events: {
			'click a': 'onStateClick'
		},

		initialize: function () {
		},

		onStateClick: function( e ) {
			e.preventDefault();
		    var path = $(e.target).attr('href');

            //navigator.request(path);
            window.router.navigate(path, {trigger: true});
		},

		render: function () {

			return this;
		}
	});
});
