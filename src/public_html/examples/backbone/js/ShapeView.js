$(function() {
	window.ShapeView = Backbone.View.extend({

		navigatorBehaviors: ["IHasStateTransition"],

		initialize: function(options) {
			this.$el.addClass(options.classNames);
		},

		render: function() {

			return this;
		},

		transitionIn: function(callOnComplete) {
			console.log("ShapeView -> transitionIn");
			this.$el.animate({opacity:1}, 500, callOnComplete);
		},

		transitionOut: function(callOnComplete) {
			console.log("ShapeView -> transitionOut");
			this.$el.animate({opacity:0}, 500, callOnComplete);
		},

		toString: function() {
			return "[object "+this.$el.attr('class')+"]"
		}
	});
});