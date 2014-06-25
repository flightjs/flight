# Base API

The base API shared by Flight [components](component_api.md) and
[mixins](mixin_api.md).

<a name="this.attributes"></a>
## this.attributes(object)

Most Components and Mixins need to define attributes. In Flight, default values
are assigned by passing an object to the `attributes` function.

```js
function Button() {
  this.attributes({
    buttonClass: 'js-button',
    text: 'Click me',
    hoverClass: null
  });
}
```

This defines a set of attributes that the mixin makes use of. If you define a
value it serves as a default value in the case that it's not specified in the
`attachTo` call. If you give it a value of `null` it means that this value must
be specified in the `attachTo` call and will raise an error if the value is
missing.

For instance, this would raise an error because `hoverClass` is not defined:

```js
Button.attachTo('#foo', {
  text: 'Don\'t click me',
  buttonClass: 'js-not-a-button'
});
```

Specifying `hoverClass` would correct this:

```js
Button.attachTo('#foo', {
  text: 'Don\'t click me',
  buttonClass: 'js-not-a-button',
  hoverClass: 'hover'
});
```

Mixins can be used to override the default values of attributes specified in
other mixins or to add new attributes. If you pass an attribute value into
`attachTo` but it is not defined via `this.attributes` it will be ignored.

Attributes can be accessed accordingly:

```js
this.attr.buttonClass;
```

Attributes are immutable. In debug mode Flight will raise errors if you try to
set them after `attachTo` has been called.

*NOTE: `this.attributes` replaces the now deprecated `this.defaultAttrs`.
However, for backwards compatibility, if you are using `this.defaultAttrs` then
all the old attribute behavior remains in place. [More details on
`this.defaultAttrs`](../../v1.1.3/doc/base_api.md#this.defaultAttrs)*

<a name="this.select"></a>
## this.select(attr)

The `select` method takes an `attr` key as its argument. The value of the
`attr` must be a CSS Selector. The method will return all matching elements
within the component's `node`.

This is a handy alternative to jQuery's `this.$node.find()` and prevents
accidental access to elements outside of the component's `node`.

```js
this.attributes({
  menuItemSelector: '.menu-item',
});

this.selectMenuItem = function(e) {
  this.select('menuItemSelector')
};
```

<a name="this.initialize"></a>
## this.initialize()

This method is attached to the prototype of every Component; it accepts the
component's node and an `options` object as arguments. The core implementation,
which is called every time an instance is created, will assign the node to the
instance and override the default `attr`s with the `options` object.

Components and Mixins will typically augment the core implementation by
supplying a function as an argument to the `after` method (see the [advice
API](advice_api.md) for more information). This is a good place to set up event
listeners that bind to callbacks.

```js
this.after('initialize', function() {
  this.on('click', this.handleClick);
});
```

<a name="this.on"></a>
## this.on([selector,] eventType, handler)

This allows a component instance to listen to an event and register a callback
to be invoked. Flight will automatically bind the context (`this`) of the
callback to the component instance.

#### `selector`: String | Element | Element collection

Optional. Specify the DOM node(s) that should listen for the event. Defaults
to the component instance's `node` value.

#### `eventType`: String

The event type to listen for.

#### `handler`: Function | Object | String

Either a function (callback) to be invoked, a map of targets and callbacks, or
a string (event name) to be triggered.

Example of `handler` being a function:

```js
this.after('initialize', function() {
  this.on(document, 'dataSent', this.refreshList);
  this.on('click', this.selectItem);
});
```

Example of `handler` as an inline function (this demonstrates how the `ev` and
`data` parameters can be used to receive data from the component's optional
`trigger` parameter `eventPayload`):

```js
this.on(document, 'dataSent', function (ev, data) {
  alert('Message sent: ' + data.msg);
});
```

Example of `handler` being an object that maps event targets to callbacks.
This is effectively event delegation; selector values are resolved, at event
time, by keying into the `attr` property of the component. The target element
is exposed in the handler's data payload as `el`.

```js
this.attributes({
  menuItemSelector: '.menuItem',
  saveButtonSelector: '#save'
});

this.after('initialize', function() {
  this.on('click', {
    menuItemSelector: this.selectMenuItem,
    saveButtonSelector: this.saveAll
  });
});
```

Example of `handler` being a string that maps events to other events. This is
useful for proxying browser events to more meaningful custom events.

```js
this.on('click', 'uiComponentClick');
```

Example of `handler` being an object that maps events to other events.

```js
this.attributes({
  menuItemSelector: '.menuItem',
  saveButtonSelector: '#save'
});

this.after('initialize', function() {
  this.on('click', {
    menuItemSelector: 'uiMenuItemClick',
    saveButtonSelector: 'uiSaveButtonClick'
  });
});
```

<a name="this.off"></a>
## this.off([selector,] eventType [, handler])

If we no longer want a component instance to listen to an event we can use the
`off` method to unsubscribe.

#### `selector`: String | Element | Element collection

Optional. The DOM node(s) listening for the event.
Defaults to the component instance's `node` value.

#### `eventType`: String | Object

The event type being listened to.

#### `handler`: Function | Object

Optional. The function (callback) to detach from the component instance.
Defaults to the detaching all callbacks for the event.

```js
function disableAllDropdowns() {
  this.off('#select', 'click');
}

function noHighlightOnHover() {
  this.off('hover', this.highlight);
}
```

Note: when a component is torn down, it automatically unsubscribes from all
events.

<a name="this.trigger"></a>
## this.trigger([selector,] eventType [, eventPayload])

Trigger an event.

#### `selector`: String | Element | Element collection

Optional. The DOM node(s) that the event will be dispatched to.
Defaults to the component instance's `node` value.

#### `eventType`: String | Object

String. The event type to be triggered.

You can also specify a default function that will be called by the component,
providing that nothing in the event's bubble chain invokes `preventDefault`.
Default functions in custom events are analagous to the default actions of
native events.

To define a default function, make the `eventType` argument an object that
specifies the event's `type` and a `defaultBehavior` property. A common use
case is defining default behavior for keyboard events:

```js
this.trigger('#textInput', {
  type: 'escapePressed',
  defaultBehavior: this.blur
});
```

#### `eventPayload`: Object

This is the payload of data that accompanies the event.

```js
this.saveButtonClicked = function() {
  this.trigger('saveRequested', currentDocument);
}

this.updateSuccessful = function() {
  this.trigger(document, 'transactionComplete', successData);
}
```

<a name="this.teardown"></a>
## this.teardown()

Remove a component instance and its event bindings.

It's a good idea to teardown components after each unit test - and teardown is
also good for unbinding event listeners when, for example, the user navigates
away from a page.

```js
this.closeVideoWidget = function() {
  // remove this component instance and its event bindings
  this.teardown();
};
```
