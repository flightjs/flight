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
