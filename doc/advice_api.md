# Advice API

In Flight, advice is a mixin (`'lib/advice.js'`) that defines `before`, `after`
and `around` methods.

These can be used to modify existing functions by adding custom code. All
Components have advice mixed in to their prototype so that mixins can augment
existing functions without requiring knowledge of the original implementation.
Moreover, since Component's are seeded with an empty `initialize` method,
Component definitions will typically use `after` to define custom `initialize`
behavior.

## before and after

You can add custom code before or after an existing method by calling the
respective advice function with two arguments. The first is the name of the
function you want to augment, the second is a custom function to be invoked
before or after the original:

```js
define(function() {
  function withDrama() {
    this.before('announce', function() {
      clearThroat();
    });
    this.after('leaving', function() {
      slamDoor();
    });
  }

  return withDrama;
});
```

## around

This method is similar to `before` and `after` but allows the existing function
to be invoked in the middle of your custom code (it's similar to
[underscore](http://underscorejs.org/)'s `_wrap` function). Again the first
argument is the existing function while the second is the custom function to go
around it. The existing function will be passed to the custom function as an
argument so that it can be referenced. If the custom function does not call the
existing function then it will replace that function instead of surround it:

```js
define(function() {
  function withDrama() {
    this.around('announce', function(basicAnnounce) {
      clearThroat();
      basicAnnounce();
      bow();
    });
  }

  return withDrama;
});
```

## Making advice available to regular objects

Advice can be mixed in to non-components using the compose module:

```js
// a simple module: 'test/myObj'
define(function() {
  var myObj = {
    print: function() {
      console.log("hello");
    }
  };

  return myObj;
});

// import myObj and augment it
define(function(require) {
  var advice = require('flight/lib/advice');
  var compose = require('flight/lib/compose');
  var myObj = require('test/myObj');

  // add advice functions to myObj
  compose.mixin(myObj, [advice.withAdvice]);

  // augment print function
  myObj.after('print', function() {
    console.log("world");
  });
});
```
