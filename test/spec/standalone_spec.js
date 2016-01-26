"use strict";

define(['index'], function(index) {
  describe('Flight distributed as a single file', function() {
    it('exports flight as a global', function() {
      expect(flight).toBeDefined();
    });

    it('contains the same members as index module', function() {
      var indexKeys = Object.keys(index);

      expect(Object.keys(flight).length).toBe(indexKeys.length);

      indexKeys.forEach(function(key) {
        expect(typeof flight[key]).toBe(typeof index[key]);
      });
    });

    it('supports debugging via window.DEBUG', function() {
      flight.debug.enable(true);
      flight.debug.events.logAll();

      var Component = flight.component(function() {
        this.after('initialize', function() {
          this.trigger('an-event');
        });
      });
      var node = document.createElement('div');
      document.body.appendChild(node);

      spyOn(console, 'info');
      Component.attachTo(node);
      expect(console.info).toHaveBeenCalledWith('->', 'trigger', '[an-event]', '\'div\'', '');
    });
  });
});

