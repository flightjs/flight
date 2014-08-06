/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

var advice = require('./lib/advice');
var component = require('./lib/component');
var compose = require('./lib/compose');
var debug = require('./lib/debug');
var logger = require('./lib/logger');
var registry = require('./lib/registry');
var utils = require('./lib/utils');

module.exports = {
  advice: advice,
  component: component,
  compose: compose,
  debug: debug,
  logger: logger,
  registry: registry,
  utils: utils
};
