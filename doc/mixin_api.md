# Mixin API

- In Flight, a mixin is a function which assigns properties to a target object (represented by the `this`
keyword).
- A typical mixin defines a set of functionality that will be useful to more than one component.
- One mixin can be applied to any number of [Component](component_api.md) definitions.
- One Component definition can have any number of mixins applied to it.
- Each Component defines a [*core*](#core_mixin) mixin within its own module.
- A mixin can itself have mixins applied to it.

## How do I define a mixin?

Mixin definitions are like Component definitions but without the call to
`flight.component`.

```js
function withDropdown() {
  this.openDropdown = function() {
    //...
  };
  this.selectItem = function() {
    //...
  };
}

// export the mixin function
module.exports = withDropdown;
```

## How do I apply mixins to a component?

In the Component definition, pass the required mixins as arguments to the
`flight.component` function:

```js
var flight = require('flightjs');
var withDialog = require('mixins/with_dialog');
var withDropdown = require('mixins/with_dropdown');

module.exports = flight.component(fancyComponent, withDialog, withDropdown);

function fancyComponent() {
  //...
}
```

## How do I apply mixins to a regular object?

Under the covers, Components add mixins using Flight's `compose` module, which
amongst other things, prevents mixins from clobbering existing method names. If
you ever need to apply a mixin to something other than a component (e.g. to
another mixin), you can invoke `compose.mixin` directly:

```js
var flight = require('flightjs');
var withPositioning = require('mixins/with_positioning');

function withDialog() {
  //mix withPositioning into withDialog
  flight.compose.mixin(this, [withPositioning]);

  //...
}

// export the mixin function
module.exports = withDialog;
```

## Overriding defaults in a mixin

The `attributes` method is available to both component and mixin modules. When
used with mixins it will not overwrite attributes already defined in the
component module.

```js
/* mixins/big_button */

function bigButton() {
  this.attributes({
    buttonClass: 'js-button-big'
  });
}

module.exports = bigButton;
```

## Creating a new Component from an existing one

Existing Components can act as base components from which additional Components can
be made.

For example, let's say all your components need to implement some touch screen behavior and also
override Flight's default `trigger` function. Instead of having to add these mixins to every component,
you can use them to create a base component (`components/base`) which all other components will extend.

```js
var flight = require('flightjs');
var withTouchScreen = require('mixins/with_touchscreen');
var withCustomTrigger = require('mixins/with_custom_trigger');

module.exports = flight.component(withTouchScreen, withCustomTrigger);
```

Component constructors have a `mixin` method which can be used to create a new Component constructor
based on the original:

```js
var Base = require('components/base');

module.exports = Base.mixin(shoppingCart);

function shoppingCart() {
  //..
}
```
