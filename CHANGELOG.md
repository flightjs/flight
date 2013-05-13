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
