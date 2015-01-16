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

<a name="notes"></a>
## Additional notes on using Advice

### Retrieving event data

In the above examples, the jQuery event and payload that will be passed to the `existingFunc` are available as extra parameters to the `customFunc` callback, respectively. This can be especially useful for calling `existingFunc` with the original arguments when using `this.around`:

```js
function withMelodiousHumour() {
  this.around('yodel', function(func, event, data) {
    if (data.tune) {
      func(event, data); // event.type == 'yodel'
    }
  });
}

return withMelodiousHumour;
```

In the above example, `yodel` will never be called if `data.tune` is missing.

### Shorthand for multiple advices

Advice can be applied to multiple functions at once by listing more than one (space-separated) function names in the `existingFuncName` parameter. This can be used to club together common tasks on related methods:

```js
function withSoundCheck() {
  this.before('announce yodel trumpet', function (event, data) {
    checkOneTwo();
  });
}

return withSoundCheck;
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
