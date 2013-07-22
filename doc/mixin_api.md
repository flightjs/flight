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
`defineComponent`.

```js
define(function(require) {

  function withDropdown() {
    this.openDropdown = function() {
      //...
    };
    this.selectItem = function() {
      //...
    };
  }

  // return the mixin function
  return withDropdown;

});
```

## How do I apply mixins to a component?

In the Component definition, pass the required mixins as arguments to the
`defineComponent` function:

```js
define(function(require) {
  var defineComponent = require('flight/lib/component');
  var withDialog = require('mixins/with_dialog');
  var withDropdown = require('mixins/with_dropdown');

  return defineComponent(fancyComponent, withDialog, withDropdown);

  function fancyComponent() {
    //...
  }
});
```

## How do I apply mixins to a regular object?

Under the covers, Components add mixins using Flight's `compose` module, which
amongst other things, prevents mixins from clobbering existing method names. If
you ever need to apply a mixin to something other than a component (e.g. to
another mixin), you can invoke `compose.mixin` directly:

```js
define(function(require) {
  var compose = require('flight/lib/compose');
  var withPositioning = require('mixins/with_positioning');

  function withDialog() {
    //mix withPositioning into withDialog
    compose.mixin(this, [withPositioning]);

    //...
  }

  // return the mixin function
  return withDialog;
});
```

## Overriding defaults in a mixin

The `defaultAttrs` method is available to both component and mixin modules. When
used with mixins it will not overwrite attributes already defined in the
component module.

```js
/* mixins/big_button */

define(function(require) {

  function bigButton() {
    this.defaultAttrs({
      buttonClass: 'js-button-big'
    });
  }

  return bigButton;

});
```
