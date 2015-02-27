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

  });

});
