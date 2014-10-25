# Advice API

In Flight, `advice` is a mixin (`lib/advice.js`) that defines `before`, `after`
and `around` methods.

These can be used to modify existing functions by adding custom code. All
Components have advice mixed in to their prototype so that mixins can augment
existing functions without requiring knowledge of the original implementation.
Mixins will typically use the `after` method to define custom `initialize`
behavior for the target component.

<a name="this.before"></a>
## this.before(existingFuncName, customFunc)

Run the `customFunc` function before the `existingFunc` function.

#### `existingFuncName`: String

The name of the existing function (`existingFunc`) you want to augment.

#### `customFunc`: Function

The function to be invoked before `existingFunc`.

```js
function withDrama() {
  this.before('announce', function() {
    clearThroat();
  });
}

return withDrama;
```

<a name="this.after"></a>
## this.after(existingFuncName, customFunc)

Run the `customFunc` function after the `existingFunc` function.

#### `existingFuncName`: String

The name of the existing function (`existingFunc`) you want to augment.

#### `customFunc`: Function

The function to be invoked after `existingFunc`.

```js
function withDrama() {
  this.after('leaving', function() {
    slamDoor();
  });
}

return withDrama;
```

<a name="this.around"></a>
## this.around(existingFuncName, customFunc)

Run the `existingFunc` function in the middle of the `customFunc` function. It's
similar to [underscore](http://underscorejs.org/)'s `_wrap` function).

#### `existingFuncName`: String

The name of the existing function (`existingFunc`) you want to augment.

#### `customFunc`: Function

The function to wrap around `existingFunc`. The `existingFunc` function will be
passed to `customFunc` as an argument.

The existing function is passed to the custom function as an argument so that
it can be referenced. If the custom function does not call the existing
function then it will replace that function instead of surrounding it:

```js
function withDrama() {
  this.around('announce', function(basicAnnounce) {
    clearThroat();
    basicAnnounce();
    bow();
  });
}

return withDrama;
```

<a name="advice.withAdvice"></a>
## Making advice available to regular objects

Advice can be mixed in to non-components using the compose module:

```js
// a simple module: 'test/myObj'

var myObj = {
  print: function() {
    console.log("hello");
  }
};

return myObj;
```

```js
// import myObj and augment it

var flight = require('flightjs');
var myObj = require('test/myObj');

// add advice functions to myObj
flight.advice.withAdvice.call(myObj);

// augment print function
myObj.after('print', function() {
  console.log('world');
});
```
