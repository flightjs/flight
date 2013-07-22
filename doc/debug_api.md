# Debug API

Flight ships with a debug module which can help you trace the sequence of event
triggering and binding. By default console logging is turned off, but you can
you can log `trigger`, `bind` and `unbind` events by means of the following
console commands:

```js
// log everything
DEBUG.events.logAll();
// only log event triggers
DEBUG.events.logByAction('trigger');
// only log events named 'click' - accepts `*` as wildcard
DEBUG.events.logByName('click');
// log nothing
DEBUG.events.logNone();
```

If you want to log everything by default, update the following line in
[tools/debug.js](https://github.com/twitter/flight/blob/master/tools/debug/debug.js).

Change:

```js
var logLevel = [];
```

to:

```js
var logLevel = 'all';
```
