/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

define(

  [
    './advice',
    './utils',
    './compose',
    './base',
    './registry',
    './logger',
    './debug'
  ],

  function(advice, utils, compose, withBase, registry, withLogging, debug) {
    'use strict';

    var functionNameRegEx = /function (.*?)\s?\(/;
    var ignoredMixin = {
      withBase: true,
      withLogging: true
    };

    // teardown for all instances of this constructor
    function teardownAll() {
      var componentInfo = registry.findComponentInfo(this);

      componentInfo && Object.keys(componentInfo.instances).forEach(function(k) {
        var info = componentInfo.instances[k];
        // It's possible that a previous teardown caused another component to teardown,
        // so we can't assume that the instances object is as it was.
        if (info && info.instance) {
          info.instance.teardown();
        }
      });
    }

    function attachTo(selector/*, options args */) {
      // unpacking arguments by hand benchmarked faster
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) {
        args[i - 1] = arguments[i];
      }

      if (!selector) {
        throw new Error('Component needs to be attachTo\'d a jQuery object, native node or selector string');
      }

      var options = utils.merge.apply(utils, args);
      var componentInfo = registry.findComponentInfo(this);

      $(selector).each(function(i, node) {
        if (componentInfo && componentInfo.isAttachedTo(node)) {
          // already attached
          return;
        }

        (new this).initialize(node, options);
      }.bind(this));
    }

    function prettyPrintMixins() {
      //could be called from constructor or constructor.prototype
      var mixedIn = this.mixedIn || this.prototype.mixedIn || [];
      return mixedIn.map(function(mixin) {
        if (mixin.name == null) {
          // function name property not supported by this browser, use regex
          var m = mixin.toString().match(functionNameRegEx);
          return (m && m[1]) ? m[1] : '';
        }
        return (!ignoredMixin[mixin.name] ? mixin.name : '');
      }).filter(Boolean).join(', ');
    };


    // define the constructor for a custom component type
    // takes an unlimited number of mixin functions as arguments
    // typical api call with 3 mixins: definition(timeline, withTweetCapability, withScrollCapability);
    function definition(/*mixins*/) {
      // unpacking arguments by hand benchmarked faster
      var l = arguments.length;
      var mixins = new Array(l);
      for (var i = 0; i < l; i++) {
        mixins[i] = arguments[i];
      }

      var Component = function() {};

      Component.toString = Component.prototype.toString = prettyPrintMixins;
      if (debug.enabled) {
        Component.describe = Component.prototype.describe = Component.toString();
      }

      Component.attachTo = attachTo;

      // enables extension of existing "base" Components
      Component.mixin = function() {
        var newComponent = definition(); //TODO: fix pretty print
        var newPrototype = Object.create(Component.prototype);
        newPrototype.mixedIn = [].concat(Component.prototype.mixedIn);
        newPrototype.attrDef = Component.prototype.attrDef;
        compose.mixin(newPrototype, arguments);
        newComponent.prototype = newPrototype;
        newComponent.prototype.constructor = newComponent;
        return newComponent;
      };
      Component.teardownAll = teardownAll;

      // prepend common mixins to supplied list, then mixin all flavors
      if (debug.enabled) {
        mixins.unshift(withLogging);
      }
      mixins.unshift(withBase, advice.withAdvice, registry.withRegistration);
      compose.mixin(Component.prototype, mixins);

      return Component;
    }

    definition.teardownAll = function() {
      registry.components.slice().forEach(function(c) {
        c.component.teardownAll();
      });
      registry.reset();
    };

    return definition;
  }
);
