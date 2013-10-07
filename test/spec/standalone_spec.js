define(['lib/index'], function(index) {
  'use strict';

  describe('Flight distributed as a single file', function() {
    /*global flight*/

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

