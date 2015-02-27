"use strict";

define(['lib/component', 'lib/registry', 'lib/dom'], function (defineComponent, registry, dom) {

  describe("(Core) events", function () {
    var Component = (function () {
      function testComponent() {
        this.attributes({
          eventData: undefined
        });
        this.exampleMethod = jasmine.createSpy();
        this.after('initialize', function () {
          this.testString || (this.testString = "");
          this.testString += "-initBase-";
        });
      }

      return defineComponent(testComponent, withTestMixin1, withTestMixin2);
    })();

    function withTestMixin1() {
      this.testVal = 69;
      this.after('initialize', function () {
        this.testString || (this.testString = "");
        this.testString += "-initTestMixin1-";
      });
    }

    function withTestMixin2() {
      this.after('initialize', function () {
        this.testString || (this.testString = "");
        this.testString += "-initTestMixin1-";
      });
    }

    //////////////////////////////////////

    beforeEach(function () {
      window.outerDiv = document.createElement('div');
      window.anotherDiv = document.createElement('div');
      window.innerDiv = document.createElement('div');
      window.outerDiv.appendChild(window.innerDiv);
      document.body.appendChild(window.outerDiv);
      document.body.appendChild(window.anotherDiv);
    });
    afterEach(function () {
      document.body.removeChild(window.outerDiv);
      document.body.removeChild(window.anotherDiv);
      window.outerDiv = null;
      window.innerDiv = null;
      Component.teardownAll();
    });

    it('bubbles native events between components', function () {
      var instance1 = (new Component).initialize(window.innerDiv);
      var instance2 = (new Component).initialize(window.outerDiv);

      var spy = jasmine.createSpy();
      instance2.on('click', spy);
      instance1.trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    it('can trigger from a specific node', function () {
      var instance1 = (new Component).initialize(window.innerDiv);
      var instance2 = (new Component).initialize(window.outerDiv);
      var instance3 = (new Component).initialize(document);
      var spy1, spy2;

      //raw node
      spy1 = jasmine.createSpy();
      instance2.on('click', spy1);
      spy2 = jasmine.createSpy();
      instance3.on('click', spy2);
      instance1.trigger(document, 'click', {a:2, b:3});
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

      //raw node, no payload
      spy1 = jasmine.createSpy();
      instance2.on('click', spy1);
      spy2 = jasmine.createSpy();
      instance3.on('click', spy2);
      instance1.trigger(document, 'click');
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

      //selector
      spy1 = jasmine.createSpy();
      instance2.on('click', spy1);
      spy2 = jasmine.createSpy();
      instance3.on('click', spy2);
      instance1.trigger('body', 'click', {a:2});
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();

      //JQuery object
      // spy1 = jasmine.createSpy();
      // instance2.on('click', spy1);
      // spy2 = jasmine.createSpy();
      // instance3.on('click', spy2);
      // instance1.trigger($(document.body), 'click', {a:2});
      // expect(spy1).not.toHaveBeenCalled();
      // expect(spy2).toHaveBeenCalled();
    });

    it('unbinds listeners using "off"', function () {
      var instance1 = (new Component).initialize(window.outerDiv);

      var spy = jasmine.createSpy();
      instance1.on('click', spy);
      instance1.off('click', spy);
      instance1.trigger('click');
      expect(spy).not.toHaveBeenCalled();
    });

    it('correctly unbinds multiple registered events for the same callback function using "off"', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      instance1.on(document, 'event2', spy);
      instance1.off(document, 'event1', spy);
      instance1.off(document, 'event2', spy);
      instance1.trigger('event1');
      instance1.trigger('event2');
      expect(spy).not.toHaveBeenCalled();
    });

    it('retains one binding when another is removed for multiple registered events for the same callback function using "off"', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      instance1.on(document, 'event2', spy);
      instance1.off(document, 'event1', spy);
      instance1.trigger('event2');
      expect(spy).toHaveBeenCalled();
    });

    it('removes the binding when "off" is supplied with a bound callback', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      var boundCb = registry.findInstanceInfo(instance1).events.filter(function(e) {
        return e.type == "event1"
       })[0].callback;
      instance1.off(document, 'event1', boundCb);
      instance1.trigger('event1');
      expect(spy).not.toHaveBeenCalled();
    });

    it('retains one binding when another is removed for multiple registered events for the same callback function when "off" is supplied with a bound callback', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      instance1.on(document, 'event2', spy);
      var boundCb = registry.findInstanceInfo(instance1).events.filter(function(e) {
        return e.type == "event1"
       })[0].callback;
      instance1.off(document, 'event1', boundCb);
      instance1.trigger('event2');
      expect(spy).toHaveBeenCalled();
    });

    it('does not unbind those registered events that share a callback, but were not sent "off" requests', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      instance1.on(document, 'event2', spy);
      instance1.off(document, 'event1', spy);
      instance1.trigger('event2');
      expect(spy).toHaveBeenCalled();
    });

    it('does not unbind those registered events that share a callback, but were not sent "off" requests (when "off" is supplied with a bound callback)', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var instance2 = (new Component).initialize(window.anotherDiv);
      var spy1 = jasmine.createSpy();
      instance1.on(document, 'event1', spy1);
      var spy2 = jasmine.createSpy();
      instance1.on(document, 'event1', spy2);
      var boundCb = registry.findInstanceInfo(instance1).events.filter(function(e) {
        return e.type == "event1"
      })[0].callback;
      instance1.off(document, 'event1', boundCb);
      instance1.trigger('event1');
      expect(spy2).toHaveBeenCalled();
    });

    it('does not unbind event handlers which share a node and were registered by the same instance', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var spy1 = jasmine.createSpy();
      instance1.on(document, 'event1', spy1);
      var spy2 = jasmine.createSpy();
      instance1.on(document, 'event1', spy2);
      instance1.off(document, 'event1', spy1);
      instance1.trigger('event1');
      expect(spy2).toHaveBeenCalled();
    });

    it('does not unbind event handlers which share a node but were registered by different instances', function () {
      var instance1 = (new Component).initialize(window.outerDiv);
      var instance2 = (new Component).initialize(window.anotherDiv);
      var spy1 = jasmine.createSpy();
      instance1.on(document, 'event', spy1);
      var spy2 = jasmine.createSpy();
      instance2.on(document, 'event', spy2);
      instance2.off(document, 'event');
      instance1.trigger('event');
      expect(spy1).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });

    it('bubbles custom events between components', function () {
      var instance1 = (new Component).initialize(window.innerDiv);
      var instance2 = (new Component).initialize(window.outerDiv);

      var spy = jasmine.createSpy();
      instance2.on('click', spy);
      instance1.trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    it('can be attached to any element', function () {
      var instance1 = (new Component).initialize(window.innerDiv);
      var instance2 = (new Component).initialize(window.outerDiv);

      var spy = jasmine.createSpy();
      instance2.on(document, 'click', spy);
      instance1.trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    it('makes data and target element available to callback', function () {
      var instance = (new Component).initialize(document.body);
      var data = {blah: 'blah'};

      var spy = jasmine.createSpy();
      instance.on(document, 'foo', spy);
      instance.trigger('foo', data);
      var args = spy.mostRecentCall.args;
      expect(args[0]).toEqual(jasmine.any(dom.FlightEvent));
      expect(args[1]).toEqual(data);
    });

    it('ignores data parameters with value of undefined', function () {
      var instance = (new Component).initialize(document.body);

      var spy = jasmine.createSpy();
      instance.on(document, 'foo', spy);
      instance.trigger('foo', undefined);
      var args = spy.mostRecentCall.args;
      expect(args[0]).toEqual(jasmine.any(dom.FlightEvent));
      expect(args[1]).not.toBeDefined();
    });

    it('throws the expected error when attempting to bind to wrong type', function () {
      var instance = (new Component).initialize(document.body);
      var badBind = function () {
        instance.on(document, 'foo', 1234);
      };
      expect(badBind).toThrow('Unable to bind to "foo" because the given callback is not a function or an object');
    });

    it('merges eventData into triggered event data', function () {
      var instance = (new Component).initialize(document.body, { eventData: { penguins: 'cool', sheep: 'dull' } });
      var data = { sheep: 'thrilling' };

      var spy = jasmine.createSpy();
      instance.on(document, 'foo', spy);
      instance.trigger('foo', data);
      var args = spy.mostRecentCall.args;
      var returnedData = args[1];
      expect(returnedData.penguins).toBeDefined();
      expect(returnedData.penguins).toBe('cool');
      expect(returnedData.sheep).toBeDefined();
      expect(returnedData.sheep).toBe('thrilling');
    });

    // it('executes the specified method when specified', function () {
    //   var instance = (new Component).initialize(document.body);
    //   instance.someMethod = jasmine.createSpy();
    //   instance.trigger({ type: 'foo', defaultBehavior: 'someMethod' });
    //   expect(instance.someMethod).toHaveBeenCalled();
    // });

    // it('executes the specified function when specified', function () {
    //   var instance = (new Component).initialize(document.body);
    //   var spy = jasmine.createSpy();
    //   instance.trigger({ type: 'foo', defaultBehavior: spy });
    //   expect(spy).toHaveBeenCalled();
    // });

    // it('does not execute the specified method when a listener calls preventDefault', function () {
    //   var instance = (new Component).initialize(document.body);
    //   instance.someMethod = jasmine.createSpy();

    //   instance.on('foo', function (e) {
    //     e.preventDefault();
    //   });

    //   instance.trigger({ type: 'foo', defaultBehavior: 'someMethod' });
    //   expect(instance.someMethod).not.toHaveBeenCalled();
    // });

    // it('does not execute the specified function when a listener calls preventDefault', function () {
    //   var instance = (new Component).initialize(document.body);
    //   var spy = jasmine.createSpy();

    //   instance.on('foo', function (e) {
    //     e.preventDefault();
    //   });

    //   instance.trigger({ type: 'foo', defaultBehavior: spy });
    //   expect(spy).not.toHaveBeenCalled();
    // });

    // it('merges eventData into triggered default behavior event data', function () {
    //   var instance = (new Component).initialize(document.body, { eventData: { penguins: 'cool', sheep: 'dull' } });
    //   var data = { sheep: 'thrilling' };

    //   var spy = jasmine.createSpy();
    //   instance.trigger({ type: 'foo', defaultBehavior: spy }, data);
    //   var args = spy.mostRecentCall.args;
    //   var returnedData = args[1];
    //   expect(returnedData.penguins).toBeDefined();
    //   expect(returnedData.penguins).toBe('cool');
    //   expect(returnedData.sheep).toBeDefined();
    //   expect(returnedData.sheep).toBe('thrilling');
    // });

  });
});
