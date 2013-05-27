// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

"use strict";

define(

  [
    './utils'
  ],

  function (util) {

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
        }

        this.removeInstance = function(instance) {
          delete this.instances[instance.identity];
          var indexOfNode = this.attachedTo.indexOf(instance.node);
          (indexOfNode > -1) && this.attachedTo.splice(indexOfNode, 1);

          if (!Object.keys(this.instances).length) {
            //if I hold no more instances remove me from registry
            registry.removeComponentInfo(this);
          }
        }

        this.isAttachedTo = function(node) {
          return this.attachedTo.indexOf(node) > -1;
        }
      }

      function InstanceInfo(instance) {
        this.instance = instance;
        this.events = [];
        this.namespace = '.' + instance.identity;

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
        (index > -1)  && this.components.splice(index, 1);
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
            if(thisInstanceInfo.instance.node === node) {
              result.push(thisInstanceInfo);
            }
          }, this);
          return result;
      };

      this.on = function(componentOn) {
        var instanceInfo = registry.findInstanceInfo(this),
            otherArgs = prepareEventArguments(arguments),
            eventArgs = otherArgs.slice(),
            boundCallback;

        if (instanceInfo) {
          // add namespace to event type
          var typeIndex = ( eventArgs.length == 3 ) ? 1 : 0
          eventArgs[typeIndex] += instanceInfo.namespace;

          boundCallback = componentOn.apply(null, eventArgs);
          if (boundCallback) {
            otherArgs[otherArgs.length-1] = boundCallback;
          }

          var event = parseEventArgs(this, otherArgs);
          instanceInfo.addBind(event);
        }
      };

      this.off = function(componentOff) {
        var instanceInfo = registry.findInstanceInfo(this),
            otherArgs = prepareEventArguments(arguments),
            eventArgs = otherArgs.slice();

        if (instanceInfo) {
          // add namespace to event type
          var typeIndex = ( eventArgs.length == 3 ) ? 1 : 0
          eventArgs[typeIndex] += instanceInfo.namespace;

          componentOff.apply(null, eventArgs);

          var event = parseEventArgs(this, otherArgs);
          instanceInfo.removeBind(event);
        }

        //remove from global event registry
        for (var i = 0, e; e = registry.events[i]; i++) {
          if (matchEvent(e, event)) {
            registry.events.splice(i, 1);
          }
        }
      };

      // unpacking arguments by hand benchmarked faster
      function prepareEventArguments( args ) {
        var l = args.length, i = 1;
        var otherArgs = new Array(l - 1);
        for (; i < l; i++) otherArgs[i - 1] = args[i];

        return otherArgs;
      };

      //debug tools may want to add advice to trigger
      registry.trigger = new Function;

      this.teardown = function() {
        registry.removeInstance(this);
      };

      this.withRegistration = function() {
        this.before('initialize', function() {
          registry.addInstance(this);
        });

        this.around('on', registry.on);
        this.around('off', registry.off);
        //debug tools may want to add advice to trigger
        window.DEBUG && DEBUG.enabled && this.after('trigger', registry.trigger);
        this.after('teardown', {obj:registry, fnName:'teardown'});
      };

    }

    return new Registry;
  }
);
