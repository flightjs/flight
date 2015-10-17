/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

define(

  [
    './dom',
    './utils',
    './registry',
    './debug'
  ],

  function(dom, utils, registry, debug) {
    'use strict';

    // common mixin allocates basic functionality - used by all component prototypes
    // callback context is bound to component
    var componentId = 0;

    function teardownInstance(instanceInfo) {
      instanceInfo.events.slice().forEach(function(event) {
        var args = [event.type];

        event.element && args.unshift(event.element);
        (typeof event.callback == 'function') && args.push(event.callback);

        this.off.apply(this, args);
      }, instanceInfo.instance);
    }

    function checkSerializable(type, data) {
      try {
        window.postMessage(data, '*');
      } catch (e) {
        debug.warn.call(this, [
          'Event "', type, '" was triggered with non-serializable data. ',
          'Flight recommends you avoid passing non-serializable data in events.'
        ].join(''));
      }
    }

    function warnAboutReferenceType(key) {
      debug.warn.call(this, [
        'Attribute "', key, '" defaults to an array or object. ',
        'Enclose this in a function to avoid sharing between component instances.'
      ].join(''));
    }

    function initAttributes(attrs) {
      var definedKeys = [], incomingKeys;

      if (typeof this.attrDef === 'undefined') {
        this.attrDef = function Attributes() {};
      }

      this.attr = new this.attrDef;

      if (debug.enabled && window.console) {
        for (var key in this.attrDef.prototype) {
          definedKeys.push(key);
        }
        incomingKeys = Object.keys(attrs);

        for (var i = incomingKeys.length - 1; i >= 0; i--) {
          if (definedKeys.indexOf(incomingKeys[i]) == -1) {
            debug.warn.call(this, 'Passed unused attribute "' + incomingKeys[i] + '".');
            break;
          }
        }
      }

      for (var key in this.attrDef.prototype) {
        if (typeof attrs[key] == 'undefined') {
          if (this.attr[key] === null) {
            throw new Error('Required attribute "' + key +
                            '" not specified in attachTo for component "' + this.toString() + '".');
          }
          // Warn about reference types in attributes
          if (debug.enabled && typeof this.attr[key] === 'object') {
            warnAboutReferenceType.call(this, key);
          }
        } else {
          this.attr[key] = attrs[key];
        }

        if (typeof this.attr[key] == 'function') {
          this.attr[key] = this.attr[key].call(this);
        }
      }

    }

    function withBase() {

      // delegate trigger, bind and unbind to an element
      // if element not supplied, use component's node
      // other arguments are passed on
      // event can be either a string specifying the type
      // of the event, or a hash specifying both the type
      // and a default function to be called.
      this.trigger = function() {
        var element, type, data, event;
        var lastIndex = arguments.length - 1, lastArg = arguments[lastIndex];

        if (typeof lastArg != 'string') {
          lastIndex--;
          data = lastArg;
        }

        if (lastIndex == 1 || utils.isDomObj(arguments[0])) {
          element = dom.select(arguments[0]);
          event = arguments[1];
        } else {
          element = this.node;
          event = arguments[0];
        }

        type = event.type || event;

        if (debug.enabled && window.postMessage) {
          checkSerializable.call(this, type, data);
        }

        if (typeof this.attr.eventData === 'object') {
          data = utils.merge(this.attr.eventData, data, true);
        }

        dom.trigger(element, type, data);

        return element;
      };


      this.on = function() {
        var element, type, callback, originalCb;
        var lastIndex = arguments.length - 1, origin = arguments[lastIndex];

        if (lastIndex == 2) {
          element = dom.select(arguments[0]);
          type = arguments[1];
        } else {
          element = this.node;
          type = arguments[0];
        }

        if (typeof origin == 'object') {
          //delegate callback
          originalCb = utils.delegate(
            element,
            this.resolveDelegateRules(origin),
            dom
          );
        } else {
          originalCb = origin;
        }

        if (typeof originalCb != 'function' && typeof originalCb != 'object') {
          throw new Error('Unable to bind to "' + type +
                          '" because the given callback is not a function or an object');
        }

        // Create a callback that lifts the DOM event into some custom type
        callback = dom.wrapCallback(originalCb, this);
        callback.target = originalCb;
        callback.context = this;

        dom.on(element, type, callback);

        // store every bound version of the callback
        originalCb.bound || (originalCb.bound = []);
        originalCb.bound.push(callback);

        return callback;
      };

      this.off = function() {
        var element, type, callback;
        var lastIndex = arguments.length - 1;

        if (typeof arguments[lastIndex] == 'function') {
          callback = arguments[lastIndex];
          lastIndex -= 1;
        }

        if (lastIndex == 1) {
          element = dom.select(arguments[0]);
          type = arguments[1];
        } else {
          element = this.node;
          type = arguments[0];
        }

        if (callback) {
          //this callback may be the original function or a bound version
          var boundFunctions = callback.target ? callback.target.bound : callback.bound || [];
          //set callback to version bound against this instance
          boundFunctions && boundFunctions.some(function(fn, i, arr) {
            if (fn.context && (this.identity == fn.context.identity)) {
              arr.splice(i, 1);
              callback = fn;
              return true;
            }
          }, this);

          dom.off(element, type, callback);
        } else {
          // Loop through the events of `this` instance
          // and unbind using the callback
          registry.findInstanceInfo(this).events.forEach(function (event) {
            if (type == event.type) {
              dom.off(element, type, event.callback);
            }
          });
        }

        return element;
      };

      this.resolveDelegateRules = function(ruleInfo) {
        var rules = {};

        Object.keys(ruleInfo).forEach(function(r) {
          if (!(r in this.attr)) {
            throw new Error('Component "' + this.toString() + '" wants to listen on "' + r + '" but no such attribute was defined.');
          }
          rules[this.attr[r]] = ruleInfo[r];
        }, this);

        return rules;
      };

      this.select = function(attributeKey) {
        return dom.select(this.attr[attributeKey], this.node);
      };

      this.attributes = function(attrs) {
        function Attributes() {}

        if (this.attrDef) {
          Attributes.prototype = new this.attrDef;
        }

        for (var name in attrs) {
          Attributes.prototype[name] = attrs[name];
        }

        this.attrDef = Attributes;
      };

      this.defaultAttrs = function() {
        throw new Error('defaultAttrs has been removed. Please use attributes instead.');
      };

      this.initialize = function(node, attrs) {
        attrs = attrs || {};
        this.identity || (this.identity = componentId++);

        if (!node) {
          throw new Error('Component needs a node');
        }

        this.node = dom.select(node);

        initAttributes.call(this, attrs);

        return this;
      };

      this.teardown = function() {
        teardownInstance(registry.findInstanceInfo(this));
      };
    }

    return withBase;
  }
);
