## v1.1.4 (4/18/2014)

###features
* Existing Components can now be extended with `mixin`
https://github.com/flightjs/flight/pull/238
https://github.com/flightjs/flight/pull/242

* Nested event logging
https://github.com/flightjs/flight/pull/244

###bug fixes and tweaks

* No fatal CSP error for accessing storage when cookies are off
https://github.com/flightjs/flight/pull/233

## v1.1.3 (2/18/2014)

###features
* `on` now optionally accepts an event to trigger instead of a callback
https://github.com/flightjs/flight/pull/217

* logger now shows trigger payload
https://github.com/flightjs/flight/pull/213

* `getBoundRequests` addes to registry as a convenience
https://github.com/flightjs/flight/pull/214

###bug fixes and tweaks

* correct clean-up when 'off' callback is a bound function
https://github.com/flightjs/flight/pull/222

## v1.1.2 (1/14/2014)

###features
* new `once` util can be used to mimick jQuery's $node.once behavior (PR 186)
* delegate method now interruptible by calling stopPropagation on the event (PR 202)

###bug fixes and tweaks
* prevent component.off from closing all event bindings for a given event and node (PR 192)
* clean up debugger and logger code (PR 193)
* ensure nested teardown support (PR 194)
* documentation improvements

## v1.1.1 (10/15/2013)

###features
* better docs

###bug fixes and tweaks
* new Function -> function declaration to avoid CSP issues
* more tests
* normalize all references to the utils module

## v1.1.0 (07/26/2013)

##api changes
* new \<Component\> (not recommended) no longer auto-calls initialize
(use \<Component\>.attachTo)

###features
* core component behavior now in base.js mixin/module
* using karma for tests
* refactored documentation now includes api docs

###bug fixes and tweaks
* update bower resources to match current bower naming scheme
* tools/debug.js -> lib/debug.js

## v1.0.11 (07/26/2013)

* rollback 1.0.10 due to API changes

## v1.0.10 (07/24/2013)

* becomes v1.1.0 due to API changes

## v1.0.9 (05/13/2013)

###features
* Event logger now works out-of-the-box

###bug fixes and tweaks
* Fix logger output

## v1.0.8 (04/23/2013)

###features
* bower ignores non-useful resources

###bug fixes and tweaks
* fix purging of event registry when unbinding
* fix empty componentInfo check in registry

## v1.0.7 (04/02/2013)

###features
* logging options are now persisted

###bug fixes and tweaks
* event logging fixed

## v1.0.6 (03/26/2013)

###features
* access registry component info more efficiently
* detect existing instance on attachTo and return without error

###bug fixes and tweaks
* fix Component.describe

## v1.0.5 (03/19/2013)

###features
* even faster component initialization

###bug fixes and tweaks
* add id to component and for fast registry lookup
* remove array creation for argument munging, for speed and less gc
* remove unused trigger advice
* various refactors for performance
* remove component lifecycle events

## v1.0.4 (03/12/2013)

###features
* more efficient options->attr merging
* faster component initialization

###bug fixes and tweaks
* tighter debug-mode checking
* remove obsolete component::bind

## v1.0.3 (03/05/2013)

###features
* tests use require.js
* remove $.browser dependency (in prep for jQuery.next)

###bug fixes and tweaks
* return {} if utils.merge has no arguments
* event logging off by default

## v1.0.2 (02/15/2013)

###features
* events can define default behaviour

###bug fixes and tweaks
* fix null pointer issues with callback exception

## v1.0.1 (02/06/2013)

###bug fixes and tweaks
* revert to es5-shim 2.0.0 (cross domain issue with IE<9 Object.create shim)
* fix Travis build script
* fix unbinding where multiple bindings have same evet and callback

## v1.0.0 (01/30/2013)

* Initial public release.
