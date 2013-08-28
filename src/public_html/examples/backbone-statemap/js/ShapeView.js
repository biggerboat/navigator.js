$(function() {
	window.ShapeView = Backbone.View.extend({

		navigatorBehaviors: ["IHasStateTransition"],

		transitionIn: function(callOnComplete) {
			this.$el.animate({opacity:1}, 500, callOnComplete);
		},

		transitionOut: function(callOnComplete) {
			this.$el.animate({opacity:0}, 500, callOnComplete);
		},

		toString: function() {
			return "[object "+this.$el.attr('class')+"]"
		}
	});
});