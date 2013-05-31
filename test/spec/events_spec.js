"use strict";

define(['lib/component'], function (defineComponent) {

  describe("(Core) events", function () {
    var Component = (function () {
      function testComponent() {
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
      window.innerDiv = document.createElement('div');
      window.outerDiv.appendChild(window.innerDiv);
      document.body.appendChild(window.outerDiv);
    });
    afterEach(function () {
      document.body.removeChild(window.outerDiv);
      window.outerDiv = null;
      window.innerDiv = null;
      Component.teardownAll();
    });

    it('bubbles native events between components', function () {
      var instance1 = new Component(window.innerDiv);
      var instance2 = new Component(window.outerDiv);

      var spy = jasmine.createSpy();
      instance2.on('click', spy);
      instance1.trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    it('unbinds listeners using "off"', function () {
      var instance1 = new Component(window.outerDiv);

      var spy = jasmine.createSpy();
      instance1.on('click', spy);
      instance1.off('click', spy);
      instance1.trigger('click');
      expect(spy).not.toHaveBeenCalled();
    });

    it('correctly unbinds multiple registered events for the same callback function using "off"', function () {
      var instance1 = new Component(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      instance1.on(document, 'event2', spy);
      instance1.off(document, 'event1', spy);
      instance1.off(document, 'event2', spy);
      instance1.trigger('event1');
      instance1.trigger('event2');
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not unbind those registered events that share a callback, but were not sent "off" requests', function () {
      var instance1 = new Component(window.outerDiv);
      var spy = jasmine.createSpy();
      instance1.on(document, 'event1', spy);
      instance1.on(document, 'event2', spy);
      instance1.off(document, 'event1', spy);
      instance1.trigger('event2');
      expect(spy).toHaveBeenCalled();
    });

    it('bubbles custom events between components', function () {
      var instance1 = new Component(window.innerDiv);
      var instance2 = new Component(window.outerDiv);

      var spy = jasmine.createSpy();
      instance2.on('click', spy);
      instance1.trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    it('can be attached to any element', function () {
      var instance1 = new Component(window.innerDiv);
      var instance2 = new Component(window.outerDiv);

      var spy = jasmine.createSpy();
      instance2.on(document, 'click', spy);
      instance1.trigger('click');
      expect(spy).toHaveBeenCalled();
    });

    it('makes data and target element available to callback', function () {
      var instance = new Component(document.body);
      var data = {blah: 'blah'};

      var spy = jasmine.createSpy();
      instance.on(document, 'foo', spy);
      instance.trigger('foo', data);
      var args = spy.mostRecentCall.args;
      expect(args[0]).toEqual(jasmine.any($.Event));
      expect(args[1]).toEqual(data);
    });

    it('ignores data parameters with value of undefined', function () {
      var instance = new Component(document.body);

      var spy = jasmine.createSpy();
      instance.on(document, 'foo', spy);
      instance.trigger('foo', undefined);
      var args = spy.mostRecentCall.args;
      expect(args[0]).toEqual(jasmine.any($.Event));
      expect(args[1]).not.toBeDefined();
    });

    it('throws the expected error when attempting to bind to wrong type', function () {
      var instance = new Component(document.body);
      var badBind = function () {
        instance.on(document, 'foo', "turkey")
      };
      expect(badBind).toThrow("Unable to bind to 'foo' because the given callback is not a function or an object");
    });

    it('merges eventData into triggered event data', function () {
      var instance = new Component(document.body, { eventData: { penguins: 'cool', sheep: 'dull' } });
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

    it('executes the specified method when specified', function () {
      var instance = new Component(document.body);
      instance.someMethod = jasmine.createSpy();
      instance.trigger({ type: 'foo', defaultBehavior: 'someMethod' });
      expect(instance.someMethod).toHaveBeenCalled();
    });

    it('executes the specified function when specified', function () {
      var instance = new Component(document.body);
      var spy = jasmine.createSpy();
      instance.trigger({ type: 'foo', defaultBehavior: spy });
      expect(spy).toHaveBeenCalled();
    });

    it('does not execute the specified method when a listener calls preventDefault', function () {
      var instance = new Component(document.body);
      instance.someMethod = jasmine.createSpy();

      instance.on('foo', function (e) {
        e.preventDefault();
      });

      instance.trigger({ type: 'foo', defaultBehavior: 'someMethod' });
      expect(instance.someMethod).not.toHaveBeenCalled();
    });

    it('does not execute the specified function when a listener calls preventDefault', function () {
      var instance = new Component(document.body);
      var spy = jasmine.createSpy();

      instance.on('foo', function (e) {
        e.preventDefault();
      });

      instance.trigger({ type: 'foo', defaultBehavior: spy });
      expect(spy).not.toHaveBeenCalled();
    });

  });
});