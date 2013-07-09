# Flight

[![Build Status](https://travis-ci.org/flightjs/flight.png?branch=master)](http://travis-ci.org/flightjs/flight)

[Flight](http://flightjs.github.io/) is a lightweight, component-based,
event-driven JavaScript framework that maps behavior to DOM nodes. It was
created at Twitter, and is used by the [twitter.com](https://twitter.com/) and
[TweetDeck](https://web.tweetdeck.com/) web applications.

* [Website](http://flightjs.github.io/)
* [API documentation](doc)
* [Flight sample app](http://flightjs.github.io/example-app/)
* [Flight's Google Group](https://groups.google.com/forum/?fromgroups#!forum/twitter-flight)
* [Flight on Twitter](https://twitter.com/flight)


## Why Flight?

Flight is only ~5K minified and gzipped. It's build upon jQuery, and has
first-class support for AMD and [Bower](http://bower.io/).

Flight components are highly portable and easily testable. This is because
a Flight component and its API is entirely decoupled from other components. They
communicate only by triggering and subscribing to events.

Flight also includes a simple and safe
[mixin](https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/)
infrastructure, allowing components to be easily extended with minimal
boilerplate.


## Development tools

Flight has supporting projects that provide everything you need to setup,
write, and test your application.

* [Flight generator](https://github.com/flightjs/generator-flight/)
  Recommended. One-step to setup everything you need to work with Flight.

* [Jasmine Flight](https://github.com/flightjs/jasmine-flight/)
  Extensions for the Jasmine test framework.

* [Mocha Flight](https://github.com/flightjs/mocha-flight/)
  Extensions for the Mocha test framework.


## Finding and writing standalone components

Flight components can be found by searching the Bower registry:

```
bower search flight
```

The easiest way to write a standalone Flight component is to use the [Flight
package generator](https://github.com/flightjs/generator-flight/):

```
yo flight:package foo
```


## Installation

If you prefer not to use the [Flight
generator](https://github.com/flightjs/generator-flight/), it's highly
recommended that you install Flight as an AMD package (including all the
correct dependencies). This is best done with [Bower](http://bower.io/), a
package manager.

```
npm install -g bower
bower install --save flight
```

You will have to reference Flight's installed dependencies –
[ES5-shim](https://github.com/kriskowal/es5-shim) and
[jQuery](http://jquery.com) – and use an AMD module loader like
[Require.js](http://requirejs.org/) or
[Loadrunner](https://github.com/danwrong/loadrunner).

```html
<script src="bower_components/es5-shim/es5-shim.js"></script>
<script src="bower_components/es5-shim/es5-sham.js"></script>
<script src="bower_components/jquery/jquery.js"></script>
<script data-main="main.js" src="bower_components/requirejs/require.js"></script>
...
```


## Standalone version

Alternatively, you can manually install the [standalone
version](http://flightjs.github.io/releases/latest/flight.js) of Flight, also
available on [cdnjs](http://cdnjs.com/). It exposes all of its modules as
properties of a global variable, `flight`:

```html
...
<script src="flight.js"></script>
<script>
  var MyComponent = flight.component(function() {
    //...
  });
</script>
```

N.B. You will also need to manually install the correct versions of Flight's
dependencies: ES5 Shim and jQuery.


## Example

A simple example of how to write and use a Flight component. Read the [API
documentation](doc) for a comprehensive overview.

```js
define(function (require) {
  var defineComponent = require('flight/lib/component');

  // define the component
  return defineComponent(inbox);

  function inbox() {
    // define custom functions here
    this.doSomething = function() {
      //...
    }

    this.doSomethingElse = function() {
      //...
    }

    // now initialize the component
    this.after('initialize', function() {
      this.on('click', doSomething);
      this.on('mouseover', doSomethingElse);
    });
  }
});
```

```js
/* attach an inbox component to a node with id 'inbox'*/

define(function (require) {
  var Inbox = require('inbox');

  Inbox.attachTo('#inbox', {
    'nextPageSelector': '#nextPage',
    'previousPageSelector': '#previousPage',
  });
});
```


## Browser Support

Chrome, Firefox, Safari, Opera, IE 7+.


## Authors

+ [@angus-c](http://github.com/angus-c)
+ [@danwrong](http://github.com/danwrong)
+ [@kpk](http://github.com/kennethkufluk)

Thanks for assistance and contributions:
[@sayrer](https://github.com/sayrer),
[@shinypb](https://github.com/shinypb),
[@kloots](https://github.com/kloots),
[@marcelduran](https://github.com/marcelduran),
[@tbrd](https://github.com/tbrd),
[@necolas](https://github.com/necolas),
[@fat](https://github.com/fat),
[@mkuklis](https://github.com/mkuklis),
[@jrburke](https://github.com/jrburke),
[@garann](https://github.com/garann),
[@WebReflection](https://github.com/WebReflection),
[@coldhead](https://github.com/coldhead),
[@paulirish](https://github.com/paulirish),
[@nimbupani](https://github.com/nimbupani),
[@mootcycle](https://github.com/mootcycle).

Special thanks to the rest of the Twitter web team for their abundant
contributions and feedback.


## License

Copyright 2013 Twitter, Inc and other contributors.

Licensed under the MIT License
