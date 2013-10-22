// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

define(

  [],

  function() {
    'use strict';

    function parseEventArgs(instance, args) {
      var element, type, callback;
      var end = args.length;

      if (typeof args[end - 1] === 'function') {
        end -= 1;
        callback = args[end];
      }

      if (typeof args[end - 1] === 'object') {
        end -= 1;
      }

      if (end == 2) {
        element = args[0];
        type = args[1];
      } else {
        element = instance.node;
        type = args[0];
      }

      return {
        element: element,
        type: type,
        callback: callback
      };
    }

    function matchEvent(a, b) {
      return (
        (a.element == b.element) &&
        (a.type == b.type) &&
        (b.callback == null || (a.callback == b.callback))
      );
    }

    function findEventsByTarget(events, target) {
      var matches = [];
      for (var i = 0, e; e = events[i]; i++) {
        if (e.callback &&
            e.callback.target === target) {
          matches.push(e);
        }
      }
      return matches;
    };

    function unpackArgs(originalArgs, offset) {
      // unpacking arguments by hand benchmarked faster
      if (typeof offset === "undefined") offset = 0;
      if (typeof offset !== "number") offset = 0;
      var l = originalArgs.length, i = offset;
      if (offset > l - 1) throw new Error("Offset greater than number of arguments.");
      var args = new Array(l - 1);
      for (; i < l; i++) args[i - offset] = originalArgs[i];
      return args;
    }

    function Registry() {

      var registry = this;

      (this.reset = function() {
        this.components = [];
        this.allInstances = {};
        this.events = [];
      }).call(this);

      function ComponentInfo(component) {
        this.component = component;
        this.attachedTo = [];
        this.instances = {};

        this.addInstance = function(instance) {
          var instanceInfo = new InstanceInfo(instance);
          this.instances[instance.identity] = instanceInfo;
          this.attachedTo.push(instance.node);

          return instanceInfo;
        };

        this.removeInstance = function(instance) {
          delete this.instances[instance.identity];
          var indexOfNode = this.attachedTo.indexOf(instance.node);
          (indexOfNode > -1) && this.attachedTo.splice(indexOfNode, 1);

          if (!Object.keys(this.instances).length) {
            //if I hold no more instances remove me from registry
            registry.removeComponentInfo(this);
          }
        };

        this.isAttachedTo = function(node) {
          return this.attachedTo.indexOf(node) > -1;
        };
      }

      function InstanceInfo(instance) {
        this.instance = instance;
        this.events = [];

        this.addBind = function(event) {
          this.events.push(event);
          registry.events.push(event);
        };

        this.removeBind = function(event) {
          for (var i = 0, e; e = this.events[i]; i++) {
            if (matchEvent(e, event)) {
              this.events.splice(i, 1);
            }
          }
        };
      }

      this.addInstance = function(instance) {
        var component = this.findComponentInfo(instance);

        if (!component) {
          component = new ComponentInfo(instance.constructor);
          this.components.push(component);
        }

        var inst = component.addInstance(instance);

        this.allInstances[instance.identity] = inst;

        return component;
      };

      this.removeInstance = function(instance) {
        var index, instInfo = this.findInstanceInfo(instance);

        //remove from component info
        var componentInfo = this.findComponentInfo(instance);
        componentInfo && componentInfo.removeInstance(instance);

        //remove from registry
        delete this.allInstances[instance.identity];
      };

      this.removeComponentInfo = function(componentInfo) {
        var index = this.components.indexOf(componentInfo);
        (index > -1) && this.components.splice(index, 1);
      };

      this.findComponentInfo = function(which) {
        var component = which.attachTo ? which : which.constructor;

        for (var i = 0, c; c = this.components[i]; i++) {
          if (c.component === component) {
            return c;
          }
        }

        return null;
      };

      this.findInstanceInfo = function(instance) {
        return this.allInstances[instance.identity] || null;
      };

      this.findInstanceInfoByNode = function(node) {
        var result = [];
        Object.keys(this.allInstances).forEach(function(k) {
          var thisInstanceInfo = this.allInstances[k];
          if (thisInstanceInfo.instance.node === node) {
            result.push(thisInstanceInfo);
          }
        }, this);
        return result;
      };

      this.on = function(componentOn) {
        var instance = registry.findInstanceInfo(this), boundCallback;

        var otherArgs = unpackArgs(arguments, 1);

        if (instance) {
          boundCallback = componentOn.apply(null, otherArgs);
          if (boundCallback) {
            otherArgs[otherArgs.length-1] = boundCallback;
          }
          var event = parseEventArgs(this, otherArgs);
          instance.addBind(event);
        }
      };

      this.off = function(componentOff /*, el, type, callback*/) {
        var otherArgs = unpackArgs(arguments, 1);
        var lastIndex = otherArgs.length - 1;

        var event = parseEventArgs(this, otherArgs),
            instance = registry.findInstanceInfo(this);

        // Find the events that have the correct unbound callback within *this instances*
        // events, and then use the *bound*, which was what was registered with $.on,
        // callback to turn it $.off.
        // This is avoids the .guid messing that was going on before.
        if (instance) {
          var matchedEvents = findEventsByTarget(instance.events, event.callback);

          var newArgs = otherArgs.slice(0, lastIndex);
          for (var i = 0, e; e = matchedEvents[i]; i++) {
            componentOff.apply(this, newArgs.concat([e.callback]));
          }
        }

        // Remove the matching instance events (using the unbound callback)
        if (instance) {
          instance.removeBind(event);
        }

        // Remove from global event registry
        for (var i = 0, e; e = registry.events[i]; i++) {
          if (matchEvent(e, event)) {
            registry.events.splice(i, 1);
          }
        }
      };

      // debug tools may want to add advice to trigger
      registry.trigger = function() {};

      this.teardown = function() {
        registry.removeInstance(this);
      };

      this.withRegistration = function() {
        this.after('initialize', function() {
          registry.addInstance(this);
        });

        this.around('on', registry.on);
        this.around('off', registry.off);
        //debug tools may want to add advice to trigger
        window.DEBUG && DEBUG.enabled && this.after('trigger', registry.trigger);
        this.after('teardown', {obj: registry, fnName: 'teardown'});
      };

    }

    return new Registry;
  }
);
