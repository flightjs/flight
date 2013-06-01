"use strict";

define(['lib/index'], function(index) {
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
  });
});

