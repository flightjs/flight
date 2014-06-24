# Flight

[![Build Status](https://travis-ci.org/flightjs/flight.png?branch=master)](http://travis-ci.org/flightjs/flight)

[Flight](http://flightjs.github.io/) is a lightweight, component-based,
event-driven JavaScript framework that maps behavior to DOM nodes. It was
created at Twitter, and is used by the [twitter.com](https://twitter.com/) and
[TweetDeck](https://tweetdeck.twitter.com/) web applications.

* [Website](http://flightjs.github.io/)
* [API documentation](doc/README.md)
* [Flight example app](http://flightjs.github.io/example-app/) ([Source](https://github.com/flightjs/example-app))
* [Flight's Google Group](https://groups.google.com/forum/?fromgroups#!forum/twitter-flight)
* [Flight on Twitter](https://twitter.com/flight)


## Why Flight?

Flight is only ~5K minified and gzipped. It's built upon jQuery, and has
first-class support for Asynchronous Module Definition (AMD) and [Bower](http://bower.io/).

Flight components are highly portable and easily testable. This is because a
Flight component (and its API) is entirely decoupled from other components.
Flight components communicate only by triggering and subscribing to events.

Flight also includes a simple and safe
[mixin](https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/)
infrastructure, allowing components to be easily extended with minimal
boilerplate.


## Development tools

Flight has supporting projects that provide everything you need to setup,
write, and test your application.

* [Flight generator](https://github.com/flightjs/generator-flight/)
  Recommended. One-step to setup everything you need to work with Flight.

* [Flight package generator](https://github.com/flightjs/generator-flight-package/)
  Recommended. One-step to setup everything you need to write and test a
  standalone Flight component.

* [Jasmine Flight](https://github.com/flightjs/jasmine-flight/)
  Extensions for the Jasmine test framework.

* [Mocha Flight](https://github.com/flightjs/mocha-flight/)
  Extensions for the Mocha test framework.


## Finding and writing standalone components

You can browse all the [Flight components](http://flight-components.jit.su)
available at this time. They can also be found by searching the Bower registry:

```
bower search flight
```

The easiest way to write a standalone Flight component is to use the [Flight
package generator](https://github.com/flightjs/generator-flight-package/):

```
yo flight-package foo
```


## Installation

If you prefer not to use the Flight generators, it's highly recommended that
you install Flight as an AMD package (including all the correct dependencies).
This is best done with [Bower](http://bower.io/), a package manager for the web.

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
<script src="bower_components/jquery/dist/jquery.js"></script>
<script data-main="main.js" src="bower_components/requirejs/require.js"></script>
...
```

## Standalone version

Alternatively, you can manually install the [standalone
version](http://flightjs.github.io/release/latest/flight.js) of Flight, also
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

## Browser Support

Chrome, Firefox, Safari, Opera, IE 7+.

## Quick Overview

Here's a brief introduction to Flight's key concepts and syntax. Read the [API
documentation](doc) for a comprehensive overview.

### Example

A simple example of how to write and use a Flight component.

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
      this.on('click', this.doSomething);
      this.on('mouseover', this.doSomethingElse);
    });
  }
});
```

```js
/* attach an inbox component to a node with id 'inbox' */

define(function (require) {
  var Inbox = require('inbox');

  Inbox.attachTo('#inbox', {
    'nextPageSelector': '#nextPage',
    'previousPageSelector': '#previousPage',
  });
});
```

### Components ([API](doc/component_api.md))

- A Component is nothing more than a constructor with properties mixed into its prototype.
- Every Component comes with a set of basic functionality such as event handling and component registration.
(see [Base API](doc/base_api.md))
- Additionally, each Component definition mixes in a set of custom properties which describe its behavior.
- When a component is attached to a DOM node, a new instance of that component is created. Each component
instance references the DOM node via its `node` property.
- Component instances cannot be referenced directly; they communicate with other components via events.

### Interacting with the DOM

Once attached, component instances have direct access to their node object via the `node` property. (There's
also a jQuery version of the node available via the `$node` property.)

### Events in Flight

Events are how Flight components interact. The Component prototype supplies methods for triggering events as
well as for subscribing to and unsubscribing from events. These Component event methods are actually just convenient
wrappers around regular event methods on DOM nodes.

### Mixins ([API](doc/mixin_api.md))

- In Flight, a mixin is a function which assigns properties to a target object (represented by the `this`
keyword).
- A typical mixin defines a set of functionality that will be useful to more than one component.
- One mixin can be applied to any number of [Component](#components) definitions.
- One Component definition can have any number of mixins applied to it.
- Each Component defines a [*core*](#core_mixin) mixin within its own module.
- A mixin can itself have mixins applied to it.

### Advice ([API](doc/advice_api.md))

In Flight, advice is a mixin (`'lib/advice.js'`) that defines `before`, `after` and `around` methods.

These can be used to modify existing functions by adding custom code. All Components have advice mixed in to
their prototype so that mixins can augment existing functions without requiring knowledge
of the original implementation. Moreover, since Component's are seeded with an empty `initialize` method,
Component definitions will typically use `after` to define custom `initialize` behavior.

### Debugging ([API](doc/debug_api.md))

Flight ships with a debug module which can help you trace the sequence of event triggering and binding. By default
console logging is turned off, but you can you can log `trigger`, `on` and `off` events by means of the following console
commands.

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
