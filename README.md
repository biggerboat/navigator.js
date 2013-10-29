# navigator.js [![Build Status](https://travis-ci.org/biggerboat/navigator.js.png)](https://travis-ci.org/biggerboat/navigator.js)

NavigatorJS is the ultimate solution to show/hide your dom-elements based on a single state string.
This library was created to take away your pains when it comes to navigating your (single page) application between different views or application states. It provides ways to deal with (asynchronous) transitions between states without bugging you with the tedious parts. To sum up of the library's features:

- Total control over synchronous and asynchronous visual transitions
- Just-in-Time initalization of view components
- DebugConsole to show exactly which elements are uninitialized, hidden or visible
- Support for dynamic range elements and lists, like gallery items
- Nested states, move complete parts of you application and they still work
- Flow control through state validation, both synchronous and asynchronous
- Optional integration with Backbone  
And many more...

NavigatorJS is mostly ported from the popular AS3 library [Navigator-as3](https://www.github.com/epologee/navigator-as3), created by [@epologee](https://twitter.com/Epologee).
Most work was done by [Paul Tondeur](https://twitter.com/PaulTondeur), later joined by [Michiel van der Ros](https://twitter.com/Micros). They are both members of the [Bigger Boat](http://www.biggerboat.nl) freelance collective in Amsterdam.

## Running the specs

Navigator.js was build with [TDD](http://en.wikipedia.org/wiki/Test-driven_development). We created a test suite with [Jasmine gem](https://github.com/pivotal/jasmine-gem). Every commit and pull requests gets tested with [Travis-ci](https://travis-ci.org/biggerboat/navigator.js).

You can run the test locally by installing Ruby 2.x.x. For more information on how to install Ruby check the [Rbenv](https://github.com/sstephenson/rbenv#installation) installation guide. 

When you have Ruby and Bundler installed run this command to install all dependencies:

    $ bundle install
    
To see the tests in a browser run this command:

    $ bundle exec rake jasmine
    
Then open your browser with this url; [http://localhost:8888/](http://localhost:8888/)

## Usage
Please refer to the [examples](https://github.com/biggerboat/navigator.js/tree/master/public/examples),
[tests](https://github.com/biggerboat/navigator.js/tree/master/spec/javascripts) and
[Navigator-Injector-Backbone-Command-TodoMVC example](https://github.com/BiggerBoat/nibc-todomvc)
for details of how this library can be used.

[Writing full documentation of all its features is on the roadmap](https://github.com/biggerboat/navigator.js/issues/38)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request from Github
