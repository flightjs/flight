# Debug API

Flight ships with a debug module which can help you trace the sequence of event
triggering and binding. By default console logging is turned off, but you can
you can log `trigger`, `on` and `off` events by means of the following console
commands:

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
