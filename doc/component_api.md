# Component API

The [base API](base_api.md) is mixed into the Component prototype.

## What is a Component?

A Component is just a constructor with properties mixed into its prototype. It
comes with a set of basic functionality such as event handling and Component
registration.

Each Component _definition_ mixes in a set of custom properties which describe
its behavior.

When a Component is attached to a DOM node, a new instance of that Component is
created. Each Component instance references the DOM node via its `node`
property.

**A Component instance cannot be referenced directly**; it communicates with
other components via events.

<a name="defineComponent"></a>
## defineComponent(...)

Flight expects its client apps to support
[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)-style module definitions.

To define a Component, create a module that depends on Flight's component
module (`lib/component`). This module exports a function which we'll call
`defineComponent` by convention.

```js
define(function(require) {
  var defineComponent = require('flight/lib/component');

  // ...
});
```

`defineComponent` accepts any number of [mixin](mixin_api.md) functions and returns
a new Component constructor with those mixins applied to its prototype.

Each Component definition should include a function declaration describing its
basic behavior (we can think of this function as the Component's core mixin).
By passing this function to `defineComponent` we can define a simple
Component:

```js
/* my_simple_component.js */

define(function(require) {
  var defineComponent = require('flight/lib/component');
  var withMyMixin = require('with_my_mixin');

  return defineComponent(mySimpleComponent, withMyMixin);

  // this Component's custom properties
  function mySimpleComponent() {
    this.doSomething = function() {
      //...
    };

    this.doSomethingElse = function() {
      //...
    };
  }
});
```

Components make no assumptions about the existence of other objects. If you
were to remove all other JavaScript on the site, this Component would still
work as intended.

<a name="defineComponent.teardownAll"></a>
## defineComponent.teardownAll()

On `defineComponent` (i.e., the object exported by `lib/component`) this
method deletes every instance of every Component and all their event
bindings.

```js
define(function(require) {
  var defineComponent = require('flight/lib/component');

  return defineComponent(navigationMenu);

  function navigationMenu() {
    this.resetEverything = function() {
      // remove every component instance and all event listeners
      defineComponent.teardownAll();
    };

    // ...
  }
});
```

<a name="Component.attachTo"></a>
## Component.attachTo(selector[, options])

Create a new instance of a Component and attach it to a DOM node.

#### `selector`: String | Element | Element collection

Specify the DOM node(s) that this Component should be attached to. A new
Component instance will be created for each node.

#### `options`: Object

Optional. An object that will be merged into the component's default `attr` object
via the `initialize` method. Any additional arguments are merged into the first `options`
argument.

In the example below, we are creating an instance of an "inbox" Component and
attaching it to a node with id `inbox`. We're also passing in values for a
couple of selectors which will override the values defined in the Component's
`attr` object (if they exist).

```js
/* attach an inbox component to a node with id 'inbox'*/

define(function(require) {
  var Inbox = require('components/inbox');

  Inbox.attachTo('#inbox', {
    'nextPageSelector': '#nextPage',
    'previousPageSelector': '#previousPage',
  });
});
```

It's important to understand that `attachTo` does not return the new instance,
or any other value. You should never need a reference to Component instances -
they should only respond to events.

### Interacting with the DOM

Once attached, Component instances have direct access to their node object via
the `node` property. (There's also a jQuery version of the node available via
the `$node` property.)

```
this.setId = function(n) {
    this.node.id = n;
};

this.hideComponent = function() {
    this.$node.hide();
};
```

<a name="Component.teardownAll"></a>
## Component.teardownAll()

On a Component constructor this method deletes every instance of that Component
type and all their event bindings.

```js
define(function(require) {
  var NavigationMenu = require('ui/navigationMenu');

  // ...
  // remove all instances of NavigationMenu and all their event bindings
  NavigationMenu.teardownAll();
});
```
