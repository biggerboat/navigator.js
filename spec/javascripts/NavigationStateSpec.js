describe("NavigationState", function() {
	var currentState;

	beforeEach(function() {
		currentState = new navigatorjs.NavigationState("/gallery/holiday/1/");
	});

	describe("Segments", function() {

		it("has three segments", function() {
			expect(currentState.getSegments().length).toEqual(3);
		});

		it("can create a state of three segments based on an array", function() {
			currentState = new navigatorjs.NavigationState(["this", "is", "anArray"]);
			expect(currentState.getSegments().length).toEqual(3);
		});

		it("will have leading and trailing slashes", function() {
			currentState = new navigatorjs.NavigationState("test");
			expect(currentState.getPath()).toEqual("/test/");
		});

		it("will replace spaces by dashes", function() {
			currentState = new navigatorjs.NavigationState("test state");
			expect(currentState.getPath()).toEqual("/test-state/");
		});

		it("omits characters that are not allowed", function() {
			var state = new navigatorjs.NavigationState("t#e&s?t");
			var test = new navigatorjs.NavigationState("test");
			expect(state.getPath()).toEqual(test.getPath())
		});

		it("will remove double slashes", function() {
			currentState = new navigatorjs.NavigationState("//test////");
			expect(currentState.getPath()).toEqual("/test/");
		});

		it("correctly removes double slashes that are caused by omitting characters that are not allowed", function() {
			var state = new navigatorjs.NavigationState("#/test/");
			var test = new navigatorjs.NavigationState("test");
			expect(state.getPath()).toEqual(test.getPath())
		});

		it("has the three segments in the array /gallery/holiday/1/", function() {
			var segments = currentState.getSegments();
			expect(segments[0]).toEqual('gallery');
			expect(segments[1]).toEqual('holiday');
			expect(segments[2]).toEqual('1');
		});

		it("has the three segments accessed by getSegment(index) /gallery/holiday/1/", function() {
			expect(currentState.getSegment(0)).toEqual('gallery');
			expect(currentState.getSegment(1)).toEqual('holiday');
			expect(currentState.getSegment(2)).toEqual('1');
		});

		it("has the /gallery/holiday/1/ path", function() {
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/');
		});

		it("has gallery as the first segment", function() {
			expect(currentState.getFirstSegment()).toEqual('gallery');
		});

		it("has 1 as the last segment", function() {
			expect(currentState.getLastSegment()).toEqual('1');
		});
	});

	describe("Operations without wildcards", function() {
		it("contains the foreign state /gallery/holiday/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/");
			expect(currentState.contains(foreignState)).toBe(true);
		});

		it("does not contain the foreign state /gallery/vacation/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/vacation/");
			expect(currentState.contains(foreignState)).toBe(false);
		});

		it("does contain the foreign state /gallery/holiday/1/more/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/1/more/");
			expect(currentState.contains(foreignState)).toBe(false);
		});

		it("equals the foreign state /gallery/holiday/1/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/1/");
			expect(currentState.equals(foreignState)).toBe(true);
		});

		it("does not equal the foreign state /gallery/holiday/2/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/2/");
			expect(currentState.equals(foreignState)).toBe(false);
		});
	});

	describe("Operations with wildcards", function() {
		it("contains the foreign state /*", function() {
			var foreignState = new navigatorjs.NavigationState("/*");
			expect(currentState.contains(foreignState)).toBeTruthy();
		});

		it("contains the foreign state /gallery/*/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/*/");
			expect(currentState.contains(foreignState)).toBeTruthy();
		});

		it("contains the foreign state /gallery/holiday/*", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/*/");
			expect(currentState.contains(foreignState)).toBeTruthy();
		});

		it("contains the foreign state /gallery/*/1", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/*/1/");
			expect(currentState.contains(foreignState)).toBeTruthy();
		});

		it("contains the foreign state /gallery/*/*", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/*/*/");
			expect(currentState.contains(foreignState)).toBeTruthy();
		});

		it("does not contain the foreign state /gallery/vacation/*/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/vacation/*/");
			expect(currentState.contains(foreignState)).toBeFalsy();
		});

		it("does equal the foreign state /gallery/holiday/*/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/*/");
			expect(currentState.equals(foreignState)).toBe(true);
		});

		it("does equal the foreign state /*/*/1/", function() {
			var foreignState = new navigatorjs.NavigationState("/*/*/1/");
			expect(currentState.equals(foreignState)).toBe(true);
		});

		it("does not equal the foreign state /gallery/holiday/*/a/", function() {
			var foreignState = new navigatorjs.NavigationState("/gallery/holiday/*/a/");
			expect(currentState.equals(foreignState)).toBeFalsy();
		});
	});

	describe("Operations with double wildcards", function() {

		it("Accepts double wildcards as the state", function() {
			var foreignState = new navigatorjs.NavigationState("**");
			expect(foreignState.getPath()).toEqual("/**/")
		});

		describe("contains", function() {
			it("contains the foreign state **", function() {
				var foreignState = new navigatorjs.NavigationState("**");

				expect(currentState.contains(foreignState)).toBe(true);
			});

			it("contains the foreign state **/1/", function() {
				var foreignState = new navigatorjs.NavigationState("**/1");

				expect(currentState.contains(foreignState)).toBe(true);
			});

			it("contains the foreign state /gallery/**/1/", function() {
				var foreignState = new navigatorjs.NavigationState("gallery/**/1");

				expect(currentState.contains(foreignState)).toBe(true);
			});

			it("doesn't contain the foreign state /gal/**/1/", function() {
				var foreignState = new navigatorjs.NavigationState("gal/**/1");

				expect(currentState.contains(foreignState)).toBe(false);
			});

			it("doesn't contain the foreign state /gallery/**/1/more/", function() {
				var foreignState = new navigatorjs.NavigationState("gallery/**/1/more");

				expect(currentState.contains(foreignState)).toBe(false);
			});

			it("contains /**/**/1/", function() {
				var foreignState = new navigatorjs.NavigationState("**/**/1");

				expect(currentState.contains(foreignState)).toBe(true);
			});

			it("contains /gallery/*/1/", function() {
				var foreignState = new navigatorjs.NavigationState("gallery/*/1");

				expect(currentState.contains(foreignState)).toBe(true);
			});

			it("doesn't contain /*/1/", function() {
				var foreignState = new navigatorjs.NavigationState("*/1");

				expect(currentState.contains(foreignState)).toBe(false);
			});
		});

		describe("equals", function() {
			it("does equal the foreign state /gallery/holiday/**/", function() {
				var foreignState = new navigatorjs.NavigationState("/gallery/holiday/**/");
				expect(currentState.equals(foreignState)).toBe(true);
			});

			it("does equal the foreign state /**/1/", function() {
				var foreignState = new navigatorjs.NavigationState("**/1/");
				expect(currentState.equals(foreignState)).toBe(true);
			});

			it("does not equal the foreign state /gallery/holiday/**/a/", function() {
				var foreignState = new navigatorjs.NavigationState("/gallery/holiday/**/a/");
				expect(currentState.equals(foreignState)).toBe(false);
			});

			it("does not equal the foreign state /**/holiday/", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/");
				expect(currentState.equals(foreignState)).toBe(false);
			});

			it("does equal the foreign state /**/holiday/*/", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/*/");
				expect(currentState.equals(foreignState)).toBe(true);
			});

			it("does equal the foreign state /**/holiday/1/", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/1/");
				expect(currentState.equals(foreignState)).toBe(true);
			});

			it("does equal the foreign state /**/holiday/**/", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/**/");
				expect(currentState.equals(foreignState)).toBe(true);
			});

			it("does not equal the foreign state /**/holiday/*/**", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/*/**");
				expect(currentState.equals(foreignState)).toBe(false);
			});

			it("does not equal the foreign state /**/holiday/*/test", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/*/test");
				expect(currentState.equals(foreignState)).toBe(false);
			});

			it("does not equal the foreign state /**/holiday/**/**", function() {
				var foreignState = new navigatorjs.NavigationState("/**/holiday/**/**");
				expect(currentState.equals(foreignState)).toBe(false);
			});

			it("equals any substate when we end with two wildcards", function() {
				var currentState = new navigatorjs.NavigationState("/home/**/");
				expect(currentState.equals('home/test')).toBe(true);
				expect(currentState.equals('home/test/more/sub/states')).toBe(true);
				expect(currentState.equals('contact/test/more/sub/states')).toBe(false);
			});
		});
	});

	describe("Array matching", function() {
		it("performs the equals test on an array of states or paths", function() {
			expect(currentState.equals(["gallery"])).toBe(false);
			expect(currentState.equals(["gallery","gallery/holiday/*"])).toBe(true);
			expect(currentState.equals(["gallery/holiday/*/test"])).toBe(false);
			expect(currentState.equals([new navigatorjs.NavigationState("gallery/holiday/1")])).toBe(true);
		});

		it("performs the contains test on an array of states or paths", function() {
			expect(currentState.contains(["gallery"])).toBe(true);
			expect(currentState.contains(["gallery","gallery/holiday/*"])).toBe(true);
			expect(currentState.contains(["gallery/holiday/*/test"])).toBe(false);
			expect(currentState.contains([new navigatorjs.NavigationState("gallery/holiday/1")])).toBe(true);
			expect(currentState.contains(["test", "state"])).toBe(false);
		});
	});

	describe("State appending by string", function() {
		it("can be appended by appending a string", function() {
			currentState.append('original');
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/');
			currentState.append('zoom');
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});

		it("can be appended by appending a string, also if it has leading or trailing slashes", function() {
			currentState.append('/original');
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/');
			currentState.append('zoom/');
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});

		it("can be appended by appending a string of multiple segments", function() {
			currentState.append('original/zoom');
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});

		it("can be appended by appending a string of multiple segments, also if it has leading or trailing slashes", function() {
			currentState.append('/original/zoom/');
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});

		it("returns an instance of itself", function() {
			expect(currentState.append('/original/zoom/').getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});
	});

	describe("State appending by state", function() {
		it("can be appended multiple times by appending a state", function() {
			var foreignState1 = new navigatorjs.NavigationState("original");
			var foreignState2 = new navigatorjs.NavigationState("zoom");
			currentState.append(foreignState1);
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/');
			currentState.append(foreignState2);
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});

		it("can be appended by appending a state of multiple segments", function() {
			var foreignState = new navigatorjs.NavigationState("original/zoom/");
			currentState.append(foreignState);
			expect(currentState.getPath()).toEqual('/gallery/holiday/1/original/zoom/');
		});

	});

	describe("State prepending by string", function() {
		it("can be prepended by a string", function() {
			currentState.prepend('home');
			expect(currentState.getPath()).toEqual('/home/gallery/holiday/1/');
			currentState.prepend('site');
			expect(currentState.getPath()).toEqual('/site/home/gallery/holiday/1/');
		});

		it("can be prepended by a string, also if it has leading or trailing slashes", function() {
			currentState.prepend('/home');
			expect(currentState.getPath()).toEqual('/home/gallery/holiday/1/');
			currentState.prepend('site/');
			expect(currentState.getPath()).toEqual('/site/home/gallery/holiday/1/');
		});

		it("can be prepended by a string of multiple segments", function() {
			currentState.prepend('site/home');
			expect(currentState.getPath()).toEqual('/site/home/gallery/holiday/1/');
		});

		it("can be prepended by a string of multiple segments, also if it has leading or trailing slashes", function() {
			currentState.prepend('/site/home/');
			expect(currentState.getPath()).toEqual('/site/home/gallery/holiday/1/');
		});
	});

	describe("State prepending by state", function() {
		it("can be prepended multiple times by appending a state", function() {
			var foreignState1 = new navigatorjs.NavigationState("home");
			var foreignState2 = new navigatorjs.NavigationState("site");
			currentState.prepend(foreignState1);
			expect(currentState.getPath()).toEqual('/home/gallery/holiday/1/');
			currentState.prepend(foreignState2);
			expect(currentState.getPath()).toEqual('/site/home/gallery/holiday/1/');
		});

		it("can be prepended by a state of multiple segments", function() {
			var foreignState = new navigatorjs.NavigationState("site/home/");
			currentState.prepend(foreignState);
			expect(currentState.getPath()).toEqual('/site/home/gallery/holiday/1/');
		});

	});

	describe("Other", function() {
		it("Can clone", function() {
			expect(currentState.clone().getPath()).toEqual('/gallery/holiday/1/');
		});

		it("handles masks", function() {
			var foreignState = new navigatorjs.NavigationState("/*/*/2/");
			expect(foreignState.mask(currentState).getPath()).toEqual('/gallery/holiday/2/');
		});

		it("also works when a string is passed into state operators", function() {
			expect(function() {currentState.contains('')}).not.toThrow();
			expect(function() {currentState.equals('')}).not.toThrow();
			expect(function() {currentState.subtract('')}).not.toThrow();
			expect(function() {currentState.mask('')}).not.toThrow();
		});

		it("also works when a path-array is passed into state operators", function() {
			expect(function() {currentState.contains([])}).not.toThrow();
			expect(function() {currentState.equals([])}).not.toThrow();
			expect(function() {currentState.subtract([])}).not.toThrow();
			expect(function() {currentState.mask([])}).not.toThrow();
		});
	});
});