# Component API

## What is a component?

- A Component is nothing more than a constructor with properties mixed into its prototype.
- Every Component comes with a set of basic functionality such as event handling and component registration.
- Additionally, each Component definition mixes in a set of custom properties which describe its behavior.
- When a component is attached to a DOM node, a new instance of that component is created. Each component
instance references the DOM node via its `node` property.
- Component instances cannot be referenced directly; they communicate with other components via events.

## How do I define a component?

Flight expects its client apps to support
[AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)-style module definitions.

To define a component, create a module that depends on Flight's component
module (`lib/component`). The latter module exports a function which we'll
call `defineComponent`.

```js
define(function(require) {

  var defineComponent = require('flight/lib/component');

  //..

});
```

`defineComponent` accepts any number of [mixin](doc/mixin_api.md) functions and returns
a new Component constructor with those mixins applied to its prototype.

Each Component definition should include a function declaration describing its
basic behavior (we can think of this function as the Component's core mixin).
By passing this function to `defineComponent` we can define a simple
Component:

```js
/* mySimpleComponent.js */

define(function(require) {

  var defineComponent = require('components/flight/lib/component');

  return defineComponent(mySimpleComponent);

  function mySimpleComponent() {
    this.doSomething = function() {
      //...
    }

    this.doSomethingElse = function() {
      //...
    }
  }

});
```

Components make no assumptions about the existence of other objects. If you
were to remove all other JavaScript on the site, this component would still
work as intended.

## How do I attach a Component to a DOM node?

Each Component constructor has an `attachTo` method which accepts two
arguments. The first argument is a DOM node (or a jQuery object or CSS selector
representing one or more DOM nodes). The second is an `options` object.  If
extra arguments are supplied, they are merged into the first options argument.
These options will be merged into the `defaults` object which is a property of
the component instance.

Invoking `attachTo` will create a new instance and attach it to the supplied
DOM node. If the first argument resolves to one or more DOM nodes, an instance
will be created for each node.

Here we are creating an instance of an Inbox Component and attaching it to a
node with id `inbox`. We're also passing in values for a couple of selectors
which will override the values defined in the components `defaults` object (if
they exist). More on `defaults` below.

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
or any other value. You should never need a reference to component instances -
they should only respond to events.

### Initializing a component

When a component is created we usually want it to perform an initial setup
routine. Every Component has an empty initialize method attached to its
prototype and we can augment this method by supplying a function as an argument
to a special `after` method. (We'll talk about `before`, `after` and `around`
in detail in the [advice](doc/advice_api.md) section of this document).

The initialize function is a good place to set up event listeners that bind to
callbacks.

```js
define(function(require) {

  var defineComponent = require('flight/lib/component');

  return defineComponent(inbox);

  function inbox() {
    //define custom functions here
    //...

    // now initialize the component
    this.after('initialize', function() {
      this.on('click', doThisThing);
      this.on('mouseover', doThatThing);
    });
  }

});
```

### Defaults and Options

In addition to functions, most components need to define attributes too. In
Flight, default values are assigned by passing an object to the `defaultAttrs`
function.

```js
define(function(require) {
  var defineComponent = require('flight/lib/component');

  return defineComponent(button);

  function button() {
    this.defaultAttrs({
      buttonClass: 'js-button',
      text: 'Click me'
    });

    this.after('initialize', function() {
      //..
    });
  }
});
```

The object will be assigned to, or merged with, the `attr` property of the
component and can be accessed accordingly:

```js
this.after('initialize', function() {
  this.$node
      .addClass(this.attr.buttonClass)
      .text(this.attr.text);
});
```

These can be overridden in options...

```js
/* attach button with text as option */

define(function (require) {
  var Button = require('components/button');

  Button.attachTo("#foo", {
    text: "Don't click me",
    buttonClass: "js-not-a-button"
  });
});
```

...or by [mixins](doc/mixin_api.md).

### Finding elements

Flight's `select` method takes a selector attribute as its argument and will
return all matching elements within the component's `node`. This is a handy
alternative to jQuery's `this.$node.find()` and prevents accidental access to
elements outside of `this.node`.

```js
this.defaultAttrs({
  menuItemSelector: '.menu-item',
  selectedClass: 'selected'
});

this.selectMenuItem = function(e) {
  // toggle 'selected' class on all list items
  this.select('menuItemSelector').toggleClass(this.attr.selectedClass);

  //...
};
```

### Interacting with the DOM

Once attached, component instances have direct access to their node object via
the `node` property. (There's also a jQuery version of the node available via
the `$node` property.)

## Events in Flight

Events are how Flight components interact. The Component prototype supplies
methods for triggering events as well as for subscribing to and unsubscribing
from events. These Component event methods are actually just convenient
wrappers around regular event methods on DOM nodes.

### Triggering events

The `trigger` method takes up to three arguments representing the triggering
element, the event type (e.g.  `click` or `saveRequested`) and the event
payload which must always be an object. Only the event type is mandatory. If
the element is not supplied then the component's `node` property is used.

```js
this.saveButtonClicked = function() {
  this.trigger('saveRequested', currentDocument);
}

this.updateSuccessful = function() {
  this.trigger(document, 'transactionComplete', successData);
}
```

You can also specify a default function that will be called by the component,
providing nothing in the event's bubble chain invokes `preventDefault`. Default
functions in custom events are analagous to the default actions of native
events.

To define a default function, make the event argument an object that specifies
the event type and a `defaultBehavior` property. A common use case is defining
default behavior for keyboard events:

```js
this.trigger('#textInput', {type: 'escapePressed', defaultBehavior: this.blur});
```

### Subscribing to events

A component instance can listen to an event and register a callback to be
invoked using the `on` method of the component prototype. There are three
possible arguments: the DOM node to listen on, the event type to listen to, and
the event handler (callback) to be invoked. Again the DOM node is optional and
defaults to the component instance's `node` value. Flight will automatically
bind the context (`this`) of the callback to the component instance.

The callback argument can be either a function to be invoked...

```js
this.after('initialize', function() {
  this.on(document, 'dataSent', this.refreshList);
  this.on('click', this.selectItem);
});
```

...or an object that maps event targets to callbacks...

```js
this.after('initialize', function() {
  this.on('click', {
    menuItemSelector: this.selectMenuItem,
    saveButtonSelector: this.saveAll
  });
});
```

The latter case is effectively event delegation; selector values are resolved,
at event time, by keying into the `attr` property of the component (see
'defaults and options').  For the above example we would expect the
`defaultAttrs` call to look something like this:

```js
this.defaultAttrs({
  menuItemSelector: '.menuItem',
  saveButtonSelector: '#save'
});
```

### Unsubscribing from events

If we no longer want a component instance to listen to an event we can use the
`off` method to unsubscribe.  This method takes up to three arguments: the DOM
node that was listening to the event, the event type, and the callback. The DOM
node argument is optional and defaults to the component's `node` property. The
callback is also optional and when not supplied the component instance detaches
all callbacks for the event type.

```js
function disableAllDropdowns() {
  this.off('#select', 'click');
}

function noHighlightOnHover() {
  this.off('hover', this.highlight);
}
```

Note: when a component is [torn down](#teardown), it automatically unsubscribes
from all events.

## Putting it together

Here's an example of a navigation menu component.

```js
define(function (require) {
  var defineComponent = require('flight/lib/component');

  return defineComponent(navigationMenu);

  function navigationMenu() {
    this.defaultAttrs({
      menuItemSelector: '.menu-item',
      selectedClass: 'selected'
    });

    // mark menu item as selected. mark others as not selected. trigger uiLoadUrl event
    this.selectMenuItem = function(e) {
      // toggle 'selected' class on all list items
      this.select('menuItemSelector').toggleClass(this.attr.selectedClass);

      // let some other component worry about loading the content & displaying it
      this.trigger('uiLoadUrl', {
        url: $(e.target).attr('href')
      });
    };

    this.after('initialize', function() {
      // 'menuItemSelector' is defined in defaultAttr
      this.on('click', {
        menuItemSelector: this.selectMenuItem
      });
    });
  }
});
```

We can attach the component to a `ul.menu` element like the one below:

```html
<nav>
  <ul class="menu">
    <li class="menu-item selected">
      <a href="apage.html">A page</a>
    </li>
    <li class="menu-item">
      <a href="anotherpage.html">Another page</a>
    </li>
  </ul>
</nav>
```

Now we have a simple menu component that can be attached to any element that
has `.menu-item` children.

## Teardown

Flight provides a set of methods which remove components and their event
bindings. It's a good idea to teardown components after each unit test - and
teardown is also good for unbinding event listeners when, for example, the user
navigates away from a page.

There are three levels of teardown:

* On `defineComponent` (i.e. the object exported by `lib/component.js`) -
  deletes every instance of every component and all their event bindings.

```js
define(function(require) {
  var defineComponent = require('flight/lib/component');

  return defineComponent(navigationMenu);

  function navigationMenu() {
    this.resetEverything = function() {
      //remove every component instance and all event listeners
      defineComponent.teardownAll();
    };
    //..
  }
});
```

* On a Component constructor - deletes every instance of that Component type
  and all their event bindings.

```js
define(function(require) {
  var NavigationMenu = require('ui/navigationMenu');

  //..
  // remove all instances of NavigationMenu and all their event bindings
  NavigationMenu.teardownAll();
});
```

* On a component instance - deletes this instance and its event bindings

```js
define(function(require) {
  var defineComponent = require('flight/lib/component');

  return defineComponent(videoPlayer);

  function videoPlayer() {
    this.closeVideoWidget = function() {
      //remove this component instance and its event bindings
      this.teardown();
    };
    //..
  }
});
```
