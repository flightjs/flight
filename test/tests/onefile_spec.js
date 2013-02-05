"use strict";

provide(function(exports) {
  using('lib/index', function(index) {
    describe('Flight distributed as a single file', function() {
      it('exports flight as a global', function() {
        expect(flight).toBeDefined();
      });

      it('contains the same members as index module', function() {
        var indexKeys = Object.keys(index);

        expect(Object.keys(flight).length).toBe(indexKeys.length);

        for (var i=0, key; key = indexKeys[i]; i++) {
          expect(typeof flight[key]).toBe(typeof index[key]);
        }
      });
    });

    exports(1);
  });
});

