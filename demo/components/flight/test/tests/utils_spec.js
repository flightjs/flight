"use strict";

provide(function(exports) {
  using('lib/component', 'lib/utils', function(defineComponent, util) {

    describe('(Core) utils', function() {

      describe('toArray()', function() {

        it('converts object to an array', function() {
          var result;

          function testFn() {
            result = util.toArray(arguments);
          }

          testFn('apple', 'pear');

          expect(Array.isArray(result)).toBe(true);
          expect(result[0]).toBe('apple');
          expect(result[1]).toBe('pear');
          expect(typeof result.push).toBe('function');
          expect(typeof result.slice).toBe('function');
          expect(typeof result.splice).toBe('function');
        });

        it('preserves object length', function() {
          var result;

          function testFn() {
            result = util.toArray(arguments);
          }

          testFn('apple', 'pear');

          expect(result.length).toBe(2);
        });

        it('ignores elements before the "from" argument', function() {
          var result;

          function testFn() {
            result = util.toArray(arguments, 1);
          }

          testFn('apple', 'pear');

          expect(result.length).toBe(1);
          expect(result[0]).toBe('pear');
        });
      });

      describe('merge()', function() {

        var merged, foo, boo, moo;

        beforeEach(function() {
          foo = {a: 32, b: {aa: 33, bb: 94}};
          boo = {c: 44};
          moo = {b: {aa: 37, cc: 58}, d: 78};
        });

        it('creates a copy', function() {
          merged = util.merge(foo);
          //reassign to merged
          merged = "monkey";
          expect(foo.a).toBe(32);
        });

        it('merges distinct properties', function() {
          merged = util.merge(foo, boo);
          expect(merged.a).toBe(32);
          expect(merged.b.aa).toBe(33);
          expect(merged.b.bb).toBe(94);
          expect(merged.c).toBe(44);
        });

        it('recursively merges like properties upon request', function() {
          merged = util.merge(foo, moo, true);
          expect(merged.a).toBe(32);
          expect(merged.b.aa).toBe(37);
          expect(merged.b.bb).toBe(94);
          expect(merged.b.cc).toBe(58);
          expect(merged.d).toBe(78);
        });

        it('does not recursively merge when not requested', function() {
          merged = util.merge(foo, moo);
          expect(merged.a).toBe(32);
          expect(merged.b.aa).toBe(37);
          expect(merged.b.bb).toBe(undefined);
          expect(merged.b.cc).toBe(58);
          expect(merged.d).toBe(78);
        });

        it('merges more than two objects', function() {
          merged = util.merge(foo, boo, moo, true);
          expect(merged.a).toBe(32);
          expect(merged.b.aa).toBe(37);
          expect(merged.b.bb).toBe(94);
          expect(merged.b.cc).toBe(58);
          expect(merged.c).toBe(44);
          expect(merged.d).toBe(78);
        });

        it('copies extra when base is undefined', function() {
          merged = util.merge(undefined, foo);
          expect(merged).toEqual(foo);
        });

        it('copies base when extra is undefined', function() {
          merged = util.merge(moo, undefined);
          expect(merged).toEqual(moo);
        });
      });


      describe('isDomObj()', function() {

        it('distinguishes DOM objects from other values', function() {
          var div = document.createElement('DIV');
          document.body.appendChild(div);

          //DOM objects
          expect(util.isDomObj(window)).toBe(true);
          expect(util.isDomObj(document)).toBe(true);
          expect(util.isDomObj(document.body)).toBe(true);
          expect(util.isDomObj(div)).toBe(true);

          //other objects
          expect(util.isDomObj(alert)).toBe(false);
          expect(util.isDomObj({})).toBe(false);
          expect(util.isDomObj([1,2,3])).toBe(false);

          //primitives
          expect(util.isDomObj("banana")).toBe(false);
          expect(util.isDomObj("34")).toBe(false);
          expect(util.isDomObj(true)).toBe(false);

          document.body.removeChild(div);
          div = null;
        });
      });

      describe('push()', function() {

        var foo = {a: 32, b: {aa: 33, bb: 94}};
        var boo = {c: 44};
        var moo = {b: {aa: 37, cc: 58}, d: 78};

        it('merges distinct properties', function() {
          var pushed = util.push(foo, boo);
          expect(pushed.a).toBe(32);
          expect(pushed.b.aa).toBe(33);
          expect(pushed.b.bb).toBe(94);
          expect(pushed.c).toBe(44);
        });

        it('does not overwrite properties when protect is true', function() {
          expect(function () {
            util.push(foo, moo, true);
          }).toThrow("utils.push attempted to overwrite 'b' while running in protected mode");
        });

        it('recursively merges like properties when protect is false', function() {
          var pushed = util.push(foo, moo);
          expect(pushed.a).toBe(32);
          expect(pushed.b.aa).toBe(37);
          expect(pushed.b.bb).toBe(94);
          expect(pushed.b.cc).toBe(58);
          expect(pushed.d).toBe(78);
        });

        it('returns undefined when base is undefined', function() {
          var pushed = util.push(undefined, foo);
          expect(pushed).toBe(undefined);
        });

        it('returns base when extra is undefined', function() {
          var pushed = util.push(moo, undefined);
          expect(pushed).toBe(moo);
        });
      });

    });

    describe('throttle()', function() {

      it('should only call a throttled function once per interval', function() {

        jasmine.Clock.useMock();

        var spy = jasmine.createSpy();
        var throttledFn = util.throttle(spy, 500);
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

    describe('debounce()', function() {

      it("should only call a debounce'd function after it has not been called for a given interval", function() {

        jasmine.Clock.useMock();

        var spy = jasmine.createSpy();
        var debouncedFn = util.debounce(spy, 500);
        debouncedFn();
        jasmine.Clock.tick(400);
        expect(spy).not.toHaveBeenCalled();
        debouncedFn();
        jasmine.Clock.tick(600);
        expect(spy).toHaveBeenCalled();
      });
    });

    describe("delegate()", function() {

      var Component = (function() {
        return defineComponent(function fnTest() {});
      })();

      afterEach(function() {
        Component.teardownAll();
      });

      it('should pass event, and data (inc. el property) to its callbacks', function() {
        var instance = new Component(document, {'bodySelector': 'body'});
        var myData = {blah: 'blah'};

        jasmine.Clock.useMock();
        var spy = jasmine.createSpy();
        instance.on('click', {bodySelector: spy});

        $(document.body).trigger('click', myData);

        myData.el = document.body;

        var callbackArgs = spy.mostRecentCall.args;

        expect(spy).toHaveBeenCalledWith(jasmine.any($.Event), myData);

      });

      it('makes "this" in delegated function references be the component instance', function() {
        var instance = new Component(document, {'bodySelector': 'body'});

        instance.on('click', {
          bodySelector: function(el, event) {
            expect(this).toBe(instance);
          }
        });

        $(document.body).trigger('click');

      });

      Component.teardownAll();
    });

    exports(1);

  });
});
