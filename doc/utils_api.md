# Utilities API

Utilities available with the `utils` modules.

<a name="utils.compose"></a>
## utils.compose(fn1, fn2, ...)

Build a function from other function(s)

```js
utils.compose(a,b,c) -> a(b(c()));
```

<a name="utils.countThen"></a>
## utils.countThen(num, base)

Returns a function that will call `base` (with the given arguments) after it has been called `num` times

<a name="utils.debounce"></a>
## utils.debounce(func, wait, immediate)

Creates and returns a new debounced version of the passed function which will
postpone its execution until after `wait` milliseconds have elapsed since the
last time it was invoked.

Pass `true` for the immediate parameter to cause debounce to trigger the
function on the leading instead of the trailing edge of the `wait` interval.

<a name="utils.delegate"></a>
## utils.delegate(rules)

Delegate to event handlers based on the event target. The `rules` argument is an object who's keys represent keys 
in the component's `attr` object (resolving to the selector of the event target) and values are the handler to be
called. 

The handlers are lazily resolved when the event is fired.

<a name="utils.isDomObj"></a>
## utils.isDomObj(obj)

Detect if an object is a DOM node.

<a name="utils.isEnumerable"></a>
## utils.isEnumerable(obj, property)

Detect is a property of an object is enumerable.

<a name="utils.merge"></a>
## utils.merge(obj1, obj2, ... [, deepClone])

Returns new object representing multiple objects merged together.
Optional final argument is boolean which specifies if merge is recursive.
Original objects are unmodified.

```js
var base = {a:2, b:6};
var extra = {b:3, c:4};
merge(base, extra); // {a:2, b:3, c:4}
base; // {a:2, b:6}

var base = {a:2, b:6};
var extra = {b:3, c:4};
var extraExtra = {a:4, d:9};
merge(base, extra, extraExtra); // {a:4, b:3, c:4. d: 9}
base; // {a:2, b:6}

var base = {a:2, b:{bb:4, cc:5}};
var extra = {a:4, b:{cc:7, dd:1}};
merge(base, extra, true); // {a:4, b:{bb:4, cc:7, dd:1}}
base; // {a:2, b:6}
```

<a name="utils.push"></a>
## utils.push(base, extra [, protect])

Updates base in place by copying properties of extra to it.
Optionally clobber protected.

```js
var base = {a:2, b:6};
var extra = {c:4};
push(base, extra); // {a:2, b:6, c:4}
base; // {a:2, b:6, c:4}

var base = {a:2, b:6};
var extra = {b: 4 c:4};
push(base, extra, true); // Error ("utils.push attempted to overwrite 'b' while running in protected mode")
base; // {a:2, b:6}
```

Objects with the same key will merge recursively when protect is `false`.

```js
var base = {a:16, b:{bb:4, cc:10}};
var extra = {b:{cc:25, dd:19}, c:5};
push(base, extra); // {a:16, {bb:4, cc:25, dd:19}, c:5}
```

<a name="utils.throttle"></a>
## utils.throttle(func, wait)

Creates and returns a new, throttled version of the passed function, that, when
invoked repeatedly, will only actually call the original function at most once
per every `wait` milliseconds.

<a name="utils.toArray"></a>
## utils.toArray(obj [, from])

Convert an object to an array. Optionally specify the index at which to begin extraction.

<a name="utils.uniqueArray"></a>
## utils.uniqueArray(array)

Can produce only unique arrays of homogeneous primitives, e.g., an array of
only strings, an array of only booleans, or an array of only numerics
