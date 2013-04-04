/**
 * wrapper for describe. load component before each test
 * @param componentPath
 * @param specDefinitions
 */
var describeComponent = function (componentPath, specDefinitions) {
  jasmine.getEnv().describeComponent(componentPath, specDefinitions);
};

jasmine.Env.prototype.describeComponent = function (componentPath, specDefinitions) {
  describe(componentPath, function () {
    beforeEach(function () {
      this.Component = null;

      var requireCallback = function(registry, Component) {
        registry.reset();
        this.Component = Component;
      }.bind(this);

      require(['flight/lib/registry', componentPath], requireCallback);

      waitsFor(function() {
        return this.Component !== null;
      }.bind(this));
    });

    afterEach(function () {
      try {
        this.component && this.component.teardown();
      } catch (e) {
        // component has already been torn down. do nothing
      }
    });
    specDefinitions.apply(this);
  });
};

/**
 * wrapper for describe. load component before each test
 * @param mixinPath
 * @param specDefinitions
 */
var describeMixin = function (mixinPath, specDefinitions) {
  jasmine.getEnv().describeMixin(mixinPath, specDefinitions);
};

jasmine.Env.prototype.describeMixin = function (mixinPath, specDefinitions) {
  describe(mixinPath, function () {
    beforeEach(function () {

      this.Component = null;

      var requireCallback = function(registry, defineComponent, Mixin) {
        registry.reset();
        this.Component = defineComponent(function() {}, Mixin);
      }.bind(this);

      require(['flight/lib/registry', 'flight/lib/component', mixinPath], requireCallback);

      waitsFor(function() {
        return this.Component !== null;
      });
    });

    afterEach(function () {
      try {
        this.component && this.component.teardown();
        this.$node.remove();
      } catch (e) {
        // component has already been torn down. do nothing
      }
    });
    specDefinitions.apply(this);
  });
};

/**
 * Create root node and initialize component. Fixture should be html string or jQuery object
 * @param fixture {String} (Optional)
 * @param options {Options} (Optional)
 */
var setupComponent = function (fixture, options) {
  jasmine.getEnv().currentSpec.setupComponent(fixture, options);
};

jasmine.Spec.prototype.setupComponent = function (fixture, options) {

  var options;
  var fixture;

  if (this.component) {
    this.component && this.component.teardown();
    this.$node.remove();
  }

  this.$node = $('<div class="component-root" />');
  $('body').append(this.$node);

  if (fixture instanceof jQuery || typeof fixture === 'string') {
    this.$node.append(fixture);
  } else {
    options = fixture;
    fixture = null;
  }

  options = options === undefined ? {} : options;

  this.component = new this.Component(this.$node, options);
};

jasmine.flight = {};

(function(namespace) {
  var eventsData = {
    spiedEvents: {},
    handlers:    []
  };

  namespace.events = {
    spyOn: function(selector, eventName) {
      eventsData.spiedEvents[[selector, eventName]] = {
        callCount: 0,
        calls: [],
        mostRecentCall: {},
        name: eventName
      };
      var handler = function(e, data) {
        var call = {
          event: e,
          args: jasmine.util.argsToArray(arguments),
          data: data
        };
        eventsData.spiedEvents[[selector, eventName]].callCount++;
        eventsData.spiedEvents[[selector, eventName]].calls.push(call);
        eventsData.spiedEvents[[selector, eventName]].mostRecentCall = call;
      };
      jQuery(selector).bind(eventName, handler);
      eventsData.handlers.push(handler);
      return eventsData.spiedEvents[[selector, eventName]];
    },

    eventArgs: function(selector, eventName, expectedArg) {
      var actualArgs = eventsData.spiedEvents[[selector, eventName]].mostRecentCall.args;

      if(!actualArgs) {
        throw "No event spy found on " + eventName + ". Try adding a call to spyOnEvent or make sure that the selector the event is triggered on and the selector being spied on are correct.";
      }

      // remove extra event metadata if it is not tested for
      if((actualArgs.length == 2) && typeof actualArgs[1] === 'object' &&
        expectedArg && !expectedArg.scribeContext && !expectedArg.sourceEventData && !expectedArg.scribeData) {
        actualArgs[1] = $.extend({}, actualArgs[1]);
        delete actualArgs[1].sourceEventData;
        delete actualArgs[1].scribeContext;
        delete actualArgs[1].scribeData;
      }

      return actualArgs;
    },

    wasTriggered: function(selector, event) {
      var spiedEvent = eventsData.spiedEvents[[selector, event.name]];
      return spiedEvent && spiedEvent.callCount;
    },

    wasTriggeredWith: function(selector, eventName, expectedArg, env) {
      var actualArgs = jasmine.flight.events.eventArgs(selector, eventName, expectedArg);
      return actualArgs && env.contains_(actualArgs, expectedArg);
    },

    wasTriggeredWithData: function(selector, eventName, expectedArg, env) {
      var actualArgs = jasmine.flight.events.eventArgs(selector, eventName, expectedArg);
      if(actualArgs) {
        var valid = false;
        for(var i = 0; i < actualArgs.length; i++) {
          if(jasmine.flight.validateHash(expectedArg, actualArgs[i])) {
            return true;
          }
        }
        return valid;
      }
      return false;
    },

    cleanUp: function() {
      eventsData.spiedEvents = {};
      eventsData.handlers    = [];
    }
  };

  namespace.validateHash = function(a, b, intersection) {
    var validHash;
    for(var field in a) {
      if((typeof a[field] == 'object') && (typeof b[field] == 'object')) {
        validHash = jasmine.flight.validateHash(a[field], b[field]);
      } else if(intersection && (typeof a[field] == 'undefined' || typeof b[field] == 'undefined')) {
        validHash = true;
      } else {
        validHash = a[field] == b[field];
      }
      if(!validHash) {
        break;
      }
    }
    return validHash;
  };

})(jasmine.flight);


beforeEach(function() {
  this.addMatchers({
    toHaveBeenTriggeredOn: function() {
      var selector = arguments[0];
      var wasTriggered = jasmine.flight.events.wasTriggered(selector, this.actual);

      this.message = function () {
        var $pp = function(obj) {
          var description;
          var attr;

          if (! obj instanceof jQuery) {
            obj = $(obj);
          }

          description = [
            obj.get(0).nodeName
          ];

          attr = obj.get(0).attributes;

          for (var x = 0; x < attr.length; x++) {
            description.push(attr[x].name + '="' + attr[x].value + '"');
          }

          return '<' + description.join(' ') + '>';
        };

        if (wasTriggered) {
          return [
            "<div class='value-mismatch'>Expected event " + this.actual.name + " to have been triggered on" + selector,
            "<div class='value-mismatch'>Expected event " + this.actual.name + " not to have been triggered on" + selector
          ];
        } else {
          return [
            "Expected event " + this.actual.name + " to have been triggered on " + $pp(selector),
            "Expected event " + this.actual.name + " not to have been triggered on " + $pp(selector)
          ];
        }
      };

      return wasTriggered;
    }
  });
});

var spyOnEvent = function(selector, eventName) {
  jasmine.JQuery.events.spyOn(selector, eventName);
  return jasmine.flight.events.spyOn(selector, eventName);
};

This looks like a JavaScript file. Click this bar to format it.