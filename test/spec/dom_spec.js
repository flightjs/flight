'use strict';

define(['lib/dom'], function (dom) {

  describe('(Core) dom', function () {

    it('is requireable', function () {
      expect(dom).toBeTruthy();
    });

    describe('trigger/on', function () {

      it('can listen to and trigger custom event', function () {
        var spy = jasmine.createSpy();
        dom.on(document, 'customEvent', spy);
        dom.trigger(document.body, 'customEvent');
        expect(spy).toHaveBeenCalled();
      });

      it('can listen to and trigger browser event', function () {
        var spy = jasmine.createSpy();
        dom.on(document, 'click', spy);
        dom.trigger(document.body, 'click');
        expect(spy).toHaveBeenCalled();
      });

    });

    describe('off', function () {

      it('can un-listen to custom event', function () {
        var spy = jasmine.createSpy();
        dom.on(document, 'customEvent', spy);
        dom.off(document, 'customEvent', spy);
        dom.trigger(document.body, 'customEvent');
        expect(spy).not.toHaveBeenCalled();
      });

      it('can listen to and trigger browser event', function () {
        var spy = jasmine.createSpy();
        dom.on(document, 'click', spy);
        dom.off(document, 'click', spy);
        dom.trigger(document.body, 'click');
        expect(spy).not.toHaveBeenCalled();
      });

    });

    describe('select', function () {

      var root;
      var child;
      var innerChild;
      var sibling;

      beforeEach(function () {
        root = document.createElement('div');
        child = document.createElement('div');
        innerChild = document.createElement('div');
        sibling = document.createElement('div');

        child.classList.add('child');
        innerChild.classList.add('duplicate');
        sibling.classList.add('duplicate');

        child.appendChild(innerChild);
        root.appendChild(child);
        root.appendChild(sibling);
        document.body.appendChild(root);
      });

      afterEach(function () {
        document.body.removeChild(root);
      });

      it('can select an element via string', function () {
        expect(dom.select('.child')).toBe(child);
      });

      it('can select document via string', function () {
        expect(dom.select('document')).toBe(document.documentElement);
      });

      it('can select an element via reference', function () {
        expect(dom.select(root)).toBe(root);
      });

      it('throws when passed nothing', function () {
        expect(function () {
          dom.select();
        }).toThrow();
      });

      it('throws when passed null', function () {
        expect(function () {
          dom.select(null);
        }).toThrow();
      });

      it('throws when passed other invalid value', function () {
        [true, NaN, {}].forEach(function (v) {
          expect(function () {
            dom.select(v);
          }).toThrow();
        });
      });

      it('can select within a context element', function () {
        expect(dom.select('.duplicate', child)).toBe(innerChild);
      });

    });

    describe('selectAll', function () {

      var root;
      var child;
      var innerChild;
      var sibling;

      beforeEach(function () {
        root = document.createElement('div');
        child = document.createElement('div');
        innerChild = document.createElement('div');
        sibling = document.createElement('div');

        child.classList.add('child');
        innerChild.classList.add('duplicate');
        sibling.classList.add('duplicate');

        child.appendChild(innerChild);
        root.appendChild(child);
        root.appendChild(sibling);
        document.body.appendChild(root);
      });

      afterEach(function () {
        document.body.removeChild(root);
      });

      it('can select elements via string', function () {
        var matches = dom.selectAll('.duplicate');
        expect(matches).toContain(sibling);
        expect(matches).toContain(innerChild);
      });

      it('can select document via string', function () {
        expect(dom.selectAll('document')).toEqual([document.documentElement]);
      });

      it('can select an element via reference', function () {
        expect(dom.selectAll(root)).toEqual([root]);
      });

      it('throws when passed nothing', function () {
        expect(function () {
          dom.selectAll();
        }).toThrow();
      });

      it('throws when passed null', function () {
        expect(function () {
          dom.selectAll(null);
        }).toThrow();
      });

      it('throws when passed other invalid value', function () {
        [true, NaN, {}].forEach(function (v) {
          expect(function () {
            dom.selectAll(v);
          }).toThrow();
        });
      });

      it('can select within a context element', function () {
        expect(dom.selectAll('.duplicate', child)).toEqual([innerChild]);
      });

    });

    describe('closest', function () {

      var root;
      var child;
      var innerChild;
      var sibling;

      beforeEach(function () {
        root = document.createElement('div');
        child = document.createElement('div');
        sibling = document.createElement('div');
        innerChild = document.createElement('div');

        root.classList.add('context-target');
        root.classList.add('multiple-target');
        child.classList.add('parent-target');
        child.classList.add('multiple-target');
        sibling.classList.add('sibling-target');
        innerChild.classList.add('possible-target');

        child.appendChild(innerChild);
        root.appendChild(child);
        root.appendChild(sibling);
        document.body.appendChild(root);
      });

      afterEach(function () {
        document.body.removeChild(root);
      });

      it('will return nothing if nothing matches', function () {
        expect(dom.closest(root, innerChild, '.no-matches')).toEqual(undefined);
      });

      it('will return the target if the target matches', function () {
        expect(dom.closest(root, innerChild, '.possible-target')).toEqual(innerChild);
      });

      it('will return a parent if it matches', function () {
        expect(dom.closest(root, innerChild, '.parent-target')).toEqual(child);
      });

      it('will return nothing if the match is not a parent', function () {
        expect(dom.closest(root, innerChild, '.sibling-target')).toEqual(undefined);
      });

      it('will return nothing if the context element matches', function () {
        expect(dom.closest(root, innerChild, '.context-target')).toEqual(undefined);
      });

      it('will return the closest match if there are multiple', function () {
        expect(dom.closest(root, innerChild, '.multiple-target')).toEqual(child);
      });

    });

    describe('wrapCallback', function () {

      it('maintains context', function () {
        var ctx = {};
        var originalEvent = {};
        var cb = dom.wrapCallback(function (event) {
          expect(this).toEqual(ctx);
        }, ctx);
        cb(originalEvent);
      });

      it('wraps argument in a FlightEvent', function () {
        var originalEvent = {};
        var cb = dom.wrapCallback(function (event) {
          expect(event).not.toEqual(originalEvent);
          expect(event instanceof dom.FlightEvent).toBe(true);
        });
        cb(originalEvent);
      });

      it('passes event detail', function () {
        var originalEvent = { detail: {} };
        var cb = dom.wrapCallback(function (event, data) {
          expect(data).toEqual(originalEvent.detail);
        });
        cb(originalEvent);
      });

    });

    describe('FlightEvent', function () {

      function makeEvent(type, detail) {
        return {
          type: type,
          detail: detail,
          defaultPrevented: false,
          stopPropagation: function () {},
          preventDefault: function () {
            this.defaultPrevented = true;
          }
        }
      }

      it('saves wrapped as originalEvent', function () {
        var originalEvent = {};
        var event = new dom.FlightEvent(originalEvent);
        expect(event.originalEvent).toBe(originalEvent);
      });

      it('should track of stopPropagation', function () {
        var event = new dom.FlightEvent(makeEvent('click'));
        event.stopPropagation();
        expect(event.isPropagationStopped()).toBe(true);
      });

      it('should call through to event methods', function () {
        var event = new dom.FlightEvent(makeEvent('click'));
        event.preventDefault();
        expect(event.defaultPrevented).toBe(true);
      });

      it('does not modify the underlying event', function () {
        var originalEvent = makeEvent('click');
        var event = new dom.FlightEvent(originalEvent);
        event.type = 'mouseover';
        expect(event.type).toBe('mouseover');
        expect(originalEvent.type).toBe('click');
      });

      it('converts null detail to undefined', function () {
        var event = new dom.FlightEvent(makeEvent('click', null));
        expect(event.detail).toBe(undefined);
      });

    });

  });

});
