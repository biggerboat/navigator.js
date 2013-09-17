$(function() {
	describe("BackboneSimpleSpec", function () {
		var applicationRouter = window.router,
			navigatorjs = applicationRouter.navigator,
			$red = $('.red'),
			$green = $('.green'),
			$blue = $('.blue');

		beforeEach(function () {
//		    applicationRouter =
		});

		describe("Simple", function () {

			it("Starts at root state", function () {
				expect(
					navigatorjs.getCurrentState().getPath()
				).toEqual('/');
			});

			it("Goes to red state", function () {
				navigatorjs.request('red');
				expect( navigatorjs.getCurrentState().getPath() ).toEqual( '/red/' );
			});

			it("Transitions via red to green state", function () {
				expect(parseFloat($red.css('opacity'))).toEqual(0);
				expect(parseFloat($green.css('opacity'))).toEqual(0);

				navigatorjs.request('red');
				expect( navigatorjs.getCurrentState().getPath() ).toEqual( '/red/' );
				navigatorjs.request('green');
				expect( navigatorjs.getCurrentState().getPath() ).toEqual( '/green/' );

				waitsFor(function() {
					return parseFloat($red.css('opacity')) == 1 && parseFloat($green.css('opacity')) == 0;
				},"only red to be visible", 1000);

				waitsFor(function() {
					return parseFloat($green.css('opacity')) == 1 && parseFloat($red.css('opacity')) == 0;
				}, "only green to be visible", 1000);

				runs(function() {
					expect(parseFloat($red.css('opacity'))).toEqual(0);
					expect(parseFloat($green.css('opacity'))).toEqual(1);
				});
			});
		});
	})
});