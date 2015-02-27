"use strict";

define(['lib/component', 'lib/utils', 'lib/debug', 'lib/dom'], function (defineComponent, utils, debug, dom) {

  describe('(Core) utils', function () {

    describe('toArray()', function () {

      it('converts object to an array', function () {
        var result;

        function testFn() {
          result = utils.toArray(arguments);
        }

        testFn('apple', 'pear');

        expect(Array.isArray(result)).toBe(true);
        expect(result[0]).toBe('apple');
        expect(result[1]).toBe('pear');
        expect(typeof result.push).toBe('function');
        expect(typeof result.slice).toBe('function');
        expect(typeof result.splice).toBe('function');
      });

      it('preserves object length', function () {
        var result;

        function testFn() {
          result = utils.toArray(arguments);
        }

        testFn('apple', 'pear');

        expect(result.length).toBe(2);
      });

      it('ignores elements before the "from" argument', function () {
        var result;

        function testFn() {
          result = utils.toArray(arguments, 1);
        }

        testFn('apple', 'pear');

        expect(result.length).toBe(1);
        expect(result[0]).toBe('pear');
      });
    });

    describe('merge()', function () {

      var merged, foo, boo, moo;

      beforeEach(function () {
        foo = {a: 32, b: {aa: 33, bb: 94}};
        boo = {c: 44};
        moo = {b: {aa: 37, cc: 58}, d: 78};
      });

      it('creates a copy', function () {
        merged = utils.merge(foo);
        //reassign to merged
        merged = "monkey";
        expect(foo.a).toBe(32);
      });

      it('merges distinct properties', function () {
        merged = utils.merge(foo, boo);
        expect(merged.a).toBe(32);
        expect(merged.b.aa).toBe(33);
        expect(merged.b.bb).toBe(94);
        expect(merged.c).toBe(44);
      });

      it('recursively merges like properties upon request', function () {
        merged = utils.merge(foo, moo, true);
        expect(merged.a).toBe(32);
        expect(merged.b.aa).toBe(37);
        expect(merged.b.bb).toBe(94);
        expect(merged.b.cc).toBe(58);
        expect(merged.d).toBe(78);
      });

      it('does not recursively merge when not requested', function () {
        merged = utils.merge(foo, moo);
        expect(merged.a).toBe(32);
        expect(merged.b.aa).toBe(37);
        expect(merged.b.bb).toBe(undefined);
        expect(merged.b.cc).toBe(58);
        expect(merged.d).toBe(78);
      });

      it('merges more than two objects', function () {
        merged = utils.merge(foo, boo, moo, true);
        expect(merged.a).toBe(32);
        expect(merged.b.aa).toBe(37);
        expect(merged.b.bb).toBe(94);
        expect(merged.b.cc).toBe(58);
        expect(merged.c).toBe(44);
        expect(merged.d).toBe(78);
      });

      it('copies extra when base is undefined', function () {
        merged = utils.merge(undefined, foo);
        expect(merged).toEqual(foo);
      });

      it('copies base when extra is undefined', function () {
        merged = utils.merge(moo, undefined);
        expect(merged).toEqual(moo);
      });

      it('returns empty hash when base and extra are undefined', function () {
        merged = utils.merge(undefined, undefined);
        expect(typeof merged).toEqual("object");
        expect(Object.keys(merged).length).toEqual(0);
      });
    });

    describe('isDomObj()', function () {

      it('distinguishes DOM objects from other values', function () {
        var div = document.createElement('DIV');
        document.body.appendChild(div);

        //DOM objects
        expect(utils.isDomObj(window)).toBe(true);
        expect(utils.isDomObj(document)).toBe(true);
        expect(utils.isDomObj(document.body)).toBe(true);
        expect(utils.isDomObj(div)).toBe(true);

        //other objects
        expect(utils.isDomObj(alert)).toBe(false);
        expect(utils.isDomObj({})).toBe(false);
        expect(utils.isDomObj([1, 2, 3])).toBe(false);

        //primitives
        expect(utils.isDomObj("banana")).toBe(false);
        expect(utils.isDomObj("34")).toBe(false);
        expect(utils.isDomObj(true)).toBe(false);

        document.body.removeChild(div);
        div = null;
      });
    });

    describe('push()', function () {

      var foo = {a: 32, b: {aa: 33, bb: 94}};
      var boo = {c: 44};
      var moo = {b: {aa: 37, cc: 58}, d: 78};

      it('merges distinct properties', function () {
        var pushed = utils.push(foo, boo);
        expect(pushed.a).toBe(32);
        expect(pushed.b.aa).toBe(33);
        expect(pushed.b.bb).toBe(94);
        expect(pushed.c).toBe(44);
      });

      it('does not overwrite properties when protect is true', function () {
        expect(function () {
          utils.push(foo, moo, true);
        }).toThrow('utils.push attempted to overwrite "b" while running in protected mode');
      });

      it('recursively merges like properties when protect is false', function () {
        var pushed = utils.push(foo, moo);
        expect(pushed.a).toBe(32);
        expect(pushed.b.aa).toBe(37);
        expect(pushed.b.bb).toBe(94);
        expect(pushed.b.cc).toBe(58);
        expect(pushed.d).toBe(78);
      });

      it('returns undefined when base is undefined', function () {
        var pushed = utils.push(undefined, foo);
        expect(pushed).toBe(undefined);
      });

      it('returns base when extra is undefined', function () {
        var pushed = utils.push(moo, undefined);
        expect(pushed).toBe(moo);
      });
    });

  });

  describe('throttle()', function () {

    it('should only call a throttled function once per interval', function () {

      jasmine.Clock.useMock();

      var spy = jasmine.createSpy();
      var throttledFn = utils.throttle(spy, 500);
      throttledFn();
      expect(spy.callCount).toBe(1);
      throttledFn();
      expect(spy.callCount).toBe(1);
      jasmine.Clock.tick(499);
      expect(spy.callCount).toBe(1);
      jasmine.Clock.tick(1);
      expect(spy.callCount).toBe(2);
    });

  });

  describe('debounce()', function () {

    it('should only call a debounce\'d function after it has not been called for a given interval', function () {

      jasmine.Clock.useMock();

      var spy = jasmine.createSpy();
      var debouncedFn = utils.debounce(spy, 500);
      debouncedFn();
      jasmine.Clock.tick(400);
      expect(spy).not.toHaveBeenCalled();
      debouncedFn();
      jasmine.Clock.tick(600);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('delegate()', function () {

    beforeEach(function () {
      window.div = document.createElement('div');
      document.body.appendChild(window.div);
    });
    afterEach(function () {
      document.body.removeChild(window.div);
      window.div = null;
      Component.teardownAll();
    });

    var Component = (function () {
      return defineComponent(function fnTest() {
        this.attributes({
          bodySelector: null,
          divSelector: ''
        });
      });
    })();

    it('should pass event, and data (inc. el property) to its callbacks', function () {
      var instance = (new Component).initialize(document, {'bodySelector': 'body'});
      var myData = {blah: 'blah'};

      jasmine.Clock.useMock();
      var spy = jasmine.createSpy();
      instance.on('customEvent', {bodySelector: spy});

      dom.trigger(document.body, 'customEvent', myData);

      var callbackArgs = spy.mostRecentCall.args;
      expect(spy).toHaveBeenCalledWith(jasmine.any(dom.FlightEvent), myData);
      expect(callbackArgs[1].el).toBe(document.body);
    });

    it('should pass the correct currentTarget', function () {
      var instance = (new Component).initialize(document, {'bodySelector': 'body'});

      instance.on('customEvent', {
        bodySelector: function (event) {
          expect(event.currentTarget).toBe(document.body);
        }
      });

      dom.trigger(window.div, 'customEvent');
    });

    it('makes "this" in delegated function references be the component instance', function () {
      var instance = (new Component).initialize(document, {'bodySelector': 'body'});

      instance.on('customEvent', {
        bodySelector: function (event) {
          expect(this).toBe(instance);
        }
      });

      dom.trigger(document.body, 'customEvent');
    });

    it('should invoke all matching handlers if stopPropagation not called on event', function () {

      var instance = (new Component).initialize(document, {'divSelector': 'div', 'bodySelector': 'body'});
      var spy1 = jasmine.createSpy();
      var spy2 = jasmine.createSpy();

      instance.on('customEvent', {
        'divSelector': function (event) {
          spy1();
        },
        'bodySelector': function() {
          spy2();
        }
      });

      dom.trigger('div', 'customEvent');
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });


    it('should not call handlers after stopPropagation called on event', function () {

      var instance = (new Component).initialize(document, {'divSelector': 'div', 'bodySelector': 'body'});
      var spy1 = jasmine.createSpy();
      var spy2 = jasmine.createSpy();

      instance.on('customEvent', {
        'divSelector': function (event) {
          event.stopPropagation();
          spy1();
        },
        'bodySelector': function() {
          spy2();
        }
      });

      dom.trigger('div', 'customEvent');
      expect(spy1).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
    });
  });

  describe('countThen()', function () {
    it('calls a wrapped function after n invocations', function () {
      var spy = jasmine.createSpy();
      var fn = utils.countThen(2, spy);
      expect(spy).not.toHaveBeenCalled();
      fn();
      expect(spy).not.toHaveBeenCalled();
      fn();
      expect(spy).toHaveBeenCalled();
    });

    it('calls a wrapped function only once', function () {
      var spy = jasmine.createSpy();
      var fn = utils.countThen(1, spy);
      fn();
      expect(spy.callCount).toBe(1);
      fn();
      expect(spy.callCount).toBe(1);
    });
  });

  describe('once()', function () {
    it('should only call a function once', function () {
      var sum = 0;
      var increment = utils.once(function () { sum++; });
      increment();
      increment();
      expect(sum).toEqual(1);
    });

    it('should only call a recursive function once', function () {
      var sum = 0;
      var increment = utils.once(function () { sum++; increment(); });
      increment();
      expect(sum).toEqual(1);
    });
  });

  describe('property locking', function() {
    beforeEach(function () {
      debug.enable(true);
    });

    afterEach(function() {
      debug.enable(false);
    });

    describe('propertyWritability()', function() {

      it('should allow a property to be write locked', function() {

        var a = { lock: true };

        utils.propertyWritability(a, 'lock', false);

        expect(function() {
          a.lock = false;
        }).toThrow();

        expect(a.lock).toBe(true);
      });

    });


    describe('mutateProperty()', function() {
      it('should allow mutations within the callback only', function() {

        var a = { lock: true };

        utils.propertyWritability(a, 'lock', false);

        utils.mutateProperty(a, 'lock', function() {
          a.lock = false;
        });

        expect(a.lock).toBe(false);

      });
    });
  });

  describe('getEnumerableProperty()', function() {
    var obj;

    beforeEach(function () {
      obj = {
        custom: 123
      };
    });

    it('should return custom values', function() {
      expect(utils.getEnumerableProperty(obj, 'custom')).toBe(123);
    });
    it('should not return native values', function() {
      expect(utils.getEnumerableProperty(obj, 'toString')).toBe(undefined);
    });
    it('should return shadowed native values', function() {
      obj.toString = function() {};
      expect(typeof utils.getEnumerableProperty(obj, 'toString')).toBe('function');
    });
  });
});
