#Flight: an event driven component framework
[![Build Status](https://travis-ci.org/twitter/flight.png?branch=master)](http://travis-ci.org/twitter/flight)

Flight is a lightweight, component-based JavaScript framework that maps behavior to DOM
nodes. Twitter uses it for their web applications.

Components cannot be directly referenced, instead they communicate by triggering and subscribing to events.
Consequently every component, and every component API, is entirely decoupled from every other component, so
that components are highly portable and easily testable.

As an added bonus, Flight includes a simple and safe mixin infrastructure allowing components to be easily
extended with minimal boilerplate.

## Sample App

By way of example, we've including a simple email client built over the Flight framework. The source code for this
app is in the [demo](https://github.com/twitter/flight/tree/gh-pages/demo) directory and you can run the demo [here](http://twitter.github.com/flight/demo/).

## Browser Support

Flight has been tested on all major browsers: Chrome, Firefox, Safari, Opera and IE7 and upwards.

## Installation

To ensure Flight is installed with the correct dependencies, we recommend using [bower](https://github.com/twitter/bower).
Your client app will need a `component.json` file that looks something like this:

    {
      "name": "myApp",
      "version": "1.2.1",
      "dependencies": {
        "flight": "~1.0.0"
      }
    }

Then running `bower install` will add flight to the `components` directory of `myApp`.

## Dependencies

Flight uses [ES5-shim](https://github.com/kriskowal/es5-shim) to pollyfill ES5 support for older browsers and [JQuery](http://jquery.com)
for DOM manipulation API. If you install flight with bower, these apps will be deployed in the `components`
folder. Additionally you will need to include an AMD implementation such as [require.js](http://requirejs.org/)
or [loadrunner](https://github.com/danwrong/loadrunner).

These files are loaded in the sample app at `demo/index.html`.

```html
<script src='components/jquery/jquery.js'></script>
<script src='components/es5-shim/es5-shim.js'></script>
<script src='components/es5-shim/es5-sham.js'></script>
<script data-main="requireMain.js" src='components/requirejs/requirejs.js'></script>
```

## How do I use it?

1.  Define a component
2.  Attach a component instance to a DOM node

## Components

### What is a component?

- A Component is nothing more than a constructor with properties mixed into its prototype.
- Every Component comes with a set of basic functionality such as event handling and component registration.
- Additionally, each Component definition mixes in a set of custom properties which describe its behavior.
- When a component is attached to a DOM node, a new instance of that component is created. Each component
instance references the DOM node via its `node` property.
- Component instances cannot be referenced directly; they communicate with other components via events.

### How do I define a component?

Flight expects its client apps to support [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD)-style module definitions.

To define a component, create a module that depends on Flight's component module (`lib/component.js`). The
latter module exports a function which we'll call `defineComponent`.

```js
define(
  [
    'components/flight/lib/component'
  ],

  function(defineComponent) {
    //..
  }
};
```

`defineComponent` accepts any number of [mixin](#mixins) functions and returns a new Component constructor
with those mixins applied to its prototoype.

<a name="core_mixin"></a>Each Component definition should include a function declaration describing its
basic behavior (we can think of this function as the Component's core mixin). By passing this function to
`defineComponent` we can define a simple Component:

```js
/* mySimpleComponent.js */

define(
  [
    'components/flight/lib/component'
  ],

  function(defineComponent)  {

    return defineComponent(mySimpleComponent);

    function mySimpleComponent() {
      this.doSomething = function() {
        //...
      }

      this.doSomethingElse = function() {
        //...
      }
    }
  }
);
```

Components make no assumptions about the existence of other objects. If you were to remove all other
JavaScript on the site, this component would still work as intended.

### How do I attach a Component to a DOM node?

Each Component constructor has an `attachTo` method which accepts two arguments. The first argument is a DOM
node (or a jQuery object or CSS selector representing one or more DOM nodes). The second is an `options` object.
If extra arguments are supplied, they are merged into the first options argument. These options will be merged
into the `defaults` object which is a property of the component instance.

Invoking `attachTo` will create a new instance and attach it to the supplied DOM node. If the first argument
resolves to one or more DOM nodes, an instance will be created for each node.

Here we are creating an instance of an Inbox Component and attaching it to a node with id `inbox`. We're also
passing in values for a couple of selectors which will override the values defined in the components `defaults`
object (if they exist). More on `defaults` [here](#defaults-and-options).

```js
/* attach an inbox component to a node with id 'inbox'*/

define(
  [
    'components/inbox'
  ],

  function(Inbox) {
    Inbox.attachTo('#inbox', {
      'nextPageSelector': '#nextPage',
      'previousPageSelector': '#previousPage',
    });
  }
);
```

It's important to understand that `attachTo` does not return the new instance, or any other value. You should
never need a reference to component instances - they should only respond to events.

### Initializing a component

When a component is created we usually want it to perform an initial setup routine. Every Component has an
empty initialize method attached to its prototype and we can augment this method by supplying a function as
an argument to a special `after` method. (We'll talk about `before`, `after` and `around` in detail in the
[advice](#advice) section of this document).

The initialize function is a good place to set up event listeners that bind to callbacks.

```js
define(
  [
    'components/flight/lib/component'
  ],

  function(defineComponent)  {

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
  }
);
```
### Defaults and Options

In addition to functions, most components need to define attributes too. In Flight, default values are
assigned by passing an object to the `defaultAttrs` function

```js
define(
  [
    'flight/lib/component'
  ],

  function(defineComponent) {

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

  }
);
```

The object will be assigned to, or merged with, the `attr` property of the component and can be accessed
accordingly:

```js
this.after('initialize', function() {
  this.$node
      .addClass(this.attr('buttonClass'))
      .text(this.attr('text'));
});
```

These can be overridden in options...

```js
/* attach button with text as option */

define(
  [
    'components/button'
  ],

  function(Button) {
    Button.attachTo("#foo", {
      text: "Don't click me",
      buttonClass: "js-not-a-button"
    });
  }
);
```

...or by [mixins](#overriding-defaults-in-a-mixin).

### Finding elements

Flight's `select` method takes a [selector attribute](#defaults-and-options) as its argument and will return
all matching elements within the component's `node`. This is a handy alternative to jQuery's `this.$node.find()`
and prevents accidental access to elements outside of `this.node`.

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

Once attached, component instances have direct access to their node object via the `node` property. (There's
also a jQuery version of the node available via the `$node` property.)

### Events in Flight

Events are how Flight components interact. The Component prototype supplies methods for triggering events as
well as for subscribing to and unsubscribing from events. These Component event methods are actually just convenient
wrappers around regular event methods on DOM nodes.

#### Triggering events

The `trigger` method takes up to three arguments representing the triggering element, the event type (e.g.
`'click'` or `'saveRequested'`) and the event payload which must always be an object. Only the event type is
mandatory. If the element is not supplied then the component's `node` property is used.

```js
this.saveButtonClicked = function() {
  this.trigger('saveRequested', currentDocument);
}

this.updateSuccesful = function() {
  this.trigger(document, 'transactionComplete', succcessData);
}
```

#### Subscribing to events

A component instance can listen to an event and register a callback to be invoked using the `on` method of the
component prototype. There are three possible arguments: the DOM node to listen on, the event type to listen
to, and the event handler (callback) to be invoked. Again the DOM node is optional and defaults to the component
instance's `node` value. Flight will automatically bind the context (`this`) of the callback to the component instance.

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

In the latter case, selector values are resolved, at event time, by keying into the `attr` property of the component (see [`defaults and options`](#defaults-and-options)).
For the above example we would expect the `defaultAttrs` call to look something like this:

```js
this.defaultAttrs({
  menuItemSelector: '.menuItem',
  saveButtonSelector: '#save'
});
```

#### Unsubscribing from events

If we no longer want a component instance to listen to an event we can use the `off` method to unsubscribe.
This method takes up to three arguments: the DOM node that was listening to the event, the event type, and the
callback. The DOM node argument is optional and defaults to the component's `node` property. The callback is
also optional and when not supplied the component instance detaches all callbacks for the event type.

```js
function disableAllDropdowns() {
  this.off('#select', 'click');
}

function noHighlightOnHover() {
  this.off('hover', this.highlight);
}
```

Note: when a component is [torn down](#teardown), it automatically unsubscribes from all events.

### Putting it together

Here's an example of a navigation menu component.

```js
define(
  [
    'flight/lib/component',
  ],

  function(defineComponent) {

    return defineComponent(navigationMenu);

    function navigationMenu() {
      defaultAttr({
        menuItemSelector: '.menu-item',
        selectedClass: 'selected'
      });

      // mark menu item as selected. mark others as not selected. trigger uiLoadUrl event
      this.selectMenuItem = function(e) {
        // toggle 'selected' class on all list items
        this.select('menuItemSelector').toggleClass(this.attr.selectedClass);

        // let some other component worry about loading the content & displaying it
        this.trigger('uiLoadUrl', {
          url: $(e.target).attr('href');
        });
      };

      this.after('initialize', function() {
        // 'menuItemSelector' is defined in defaultAttr
        this.on('click', {
          menuItemSelector: this.selectMenuItem
        });
      });
    }

  }
);
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

Now we have a simple menu component that can be attached to any element that has `.menu-item` children.

## Teardown

Flight provides a set of methods which remove components and their event bindings. It's a good idea to use teardown
components after each unit test - and teardown also good for unbinding event listeners when, for example, the user
navigates away from a page.

There are three levels of teardown:

* On `defineComponent` (i.e. the object exported by `lib/component.js`) - deletes every instance of
every component and all their event bindings.

```js
define(
  [
    'flight/lib/component'
  ],

  function(defineComponent) {

    return defineComponent(navigationMenu);

    function navigationMenu() {

      this.resetEverything = function() {
        //remove every component instance and all event listeners
        defineComponent.teardownAll();
      };
      //..
    }
  }
);
```

* On a Component constructor - deletes every instance of that Component type and all their event bindings.

```js
define(
  [
    'ui/navigationMenu'
  ],

  function(NavigationMenu) {
    //..
    //remove all instances of NavigationMenu and all their event bindings
    NavigationMenu.teardownAll();
  }
);
```

* On a component instance - deletes this instance and its event bindings

```js
define(
  [
    'flight/lib/component'
  ],

  function(defineComponent) {

    return defineComponent(videoPlayer);

    function videoPlayer() {

      this.closeVideoWidget = function() {
        //remove this component instance and its event bindings
        this.teardown();
      };
      //..
    }
  }
);
```

## Mixins

- In Flight, a mixin is a function which assigns properties to a target object (represented by the `this`
keyword).
- A typical mixin defines a set of functionality that will be useful to more than one component.
- One mixin can be applied to any number of [Component](#components) definitions.
- One Component definition can have any number of mixins applied to it.
- Each Component defines a [*core*](#core_mixin) mixin within its own module.
- A mixin can itself have mixins applied to it.

### How do I define a mixin?

Mixin defintions are like Component definitions but without the call to `defineComponent`.

```js

define(
  [],

  function() {

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
  }
);
```

### How do I apply mixins to a component?

In the Component definition, pass the required mixins as arguments to the `defineComponent` function:

```js
define(
  [
    'flight/lib/component',
    'mixins/with_dialog',
    'mixins/with_dropdown'
  ],

  function(defineComponent, withDialog, withDropdown) {

    defineComponent(fancyComponent, withDialog, withDropdown);

    function fancyComponent() {
      //...
    }
  }
);
```

### How do I apply mixins to a regular object?

Under the covers, Components add mixins using Flight's `compose` module, which amongst other things, prevents
mixins from clobbering existing method names. If you ever need to apply a mixin to something other than a
component (e.g. to another mixin), you can invoke `compose.mixin` directly:

```js
define(
  [
    'mixins/with_positioning'
  ],

  function(withPositioning) {

    //mix withPositioning into withDialog
    compose.mixin(this, [withPositioning]);

    function withDialog() {
      //...
    }

    // return the mixin function
    return withDialog;
  }
);
```

### Overriding defaults in a mixin

The `defaultAttr` method is available to both component and mixin modules. When used with mixins it will not
overwrite attributes already defined in the component module.

```js
/* mixins/big_button */

define(
  [],

  function() {

    function bigButton() {
      this.defaultAttrs({
        buttonClass: 'js-button-big'
      });
    }

    return bigButton;

  }
);
```
## Advice

In Flight, advice is a mixin (`'lib/advice.js'`) that defines `before`, `after` and `around` methods.

These can be used to modify existing functions by adding custom code. All Components have advice mixed in to
their prototype so that mixins can augment existing functions without requiring knowledge
of the original implementation. Moreover, since Component's are seeded with an empty `initialize` method,
Component definitions will typically use `after` to define custom `initialize` behavior.

### before and after

You can add custom code before or after an exisiting method by calling the respective advice function with two
arguments. The first is the name of the function you want to augment, the second is a custom function to be
invoked before or after the original:

```js
define(
  [],

  function() {

    function withDrama() {
      this.before('announce', function() {
        clearThroat();
      });
      this.after('leaving', function() {
        slamDoor();
      });
    }

    return withDrama;
  }
);
```

### around

This method is similar to `before` and `after` but allows the existing function to be invoked in the middle of
your custom code (it's similar to [underscore](http://underscorejs.org/)'s `_wrap` function). Again the first argument is the existing function
while the second is the custom function to go around it. The existing function will be passed to the custom
function as an argument so that it can be referenced. If the custom function does not call the existing function
then it will replace that function instead of surround it:

```js
define(
  [],

  function() {

    function withDrama() {
      this.around('announce', function(basicAnnounce) {
        clearThroat();
        basicAnnounce();
        bow();
      });
    }

    return withDrama;
  }
);
```

### Making advice available to regular objects

Advice can be mixed in to non-components using the compose module:

```js
//a simple module: 'test/myObj'
define{
  [],

  function() {
    var myObj = {
      print: function() {
        console.log("hello");
      }
    };

    return myObj;
  }
}

//import myObj and augment it
define(
  [
    'lib/advice',
    'lib/compose',
    'test/myObj'
  ],

  function(advice, compose, myObj) {

    //add advice functions to myObj
    compose.mixin(myObj, [advice.withAdvice]);

    //augment print function
    myObj.after('print', function() {
      console.log("world");
    });
  }
);
```

## Debugging

Flight ships with a debug module which can help you trace the sequence of event triggering and binding. By default
the console will log every trigger, bind and unbind event. By sending instructions to your browser console, you
can filter logged events by type or by name or turn them off completely:

    DEBUG.events.logByAction('trigger'); //only log event triggers
    DEBUG.events.logByName('click'); //only log events named 'click' - accepts * as wildcard
    DEBUG.events.logNone(); //log nothing
    DEBUG.events.logAll(); //log everything

## Authors

+ [@angus-c](http://github.com/angus-c)
+ [@danwrong](http://github.com/danwrong)
+ [@kpk](http://github.com/kennethkufluk)

Thanks for assistance and contributions:

+ [@jrburke](https://github.com/jrburke)
+ [@garann](https://github.com/garann)
+ [@WebReflection](https://github.com/WebReflection)
+ [@coldhead](https://github.com/coldhead)
+ [@paulirish](https://github.com/paulirish)
+ [@nimbupani](https://github.com/nimbupani)
+ [@mootcycle](https://github.com/mootcycle)

Special thanks to the rest of the Twitter web team for their abundant contributions and feedback.

## License

Copyright 2013 Twitter, Inc and other contributors.

Licensed under the MIT License
