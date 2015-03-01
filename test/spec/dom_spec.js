'use strict';

define(['lib/dom'], function (dom) {

  describe('(Core) dom', function () {

    it('is requireable', function () {
      expect(dom).toBeTruthy();
    });

    // TODO: select, selectAll, closest, wrapCallback, FlightEvent

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

    describe('selectALl', function () {

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

  });

});
