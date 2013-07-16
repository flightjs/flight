// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

define(function(require) {

  var advice = require('./advice');
  var component = require('./component');
  var compose = require('./compose');
  var logger = require('./logger');
  var registry = require('./registry');
  var utils = require('./utils');

  return {
    advice: advice,
    component: component,
    compose: compose,
    logger: logger,
    registry: registry,
    utils: utils
  };

});
