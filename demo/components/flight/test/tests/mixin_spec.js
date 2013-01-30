"use strict";

provide(function(exports) {
  using('lib/component', 'lib/utils', 'lib/compose', function(defineComponent, util, compose) {

    describe('(Core) mixin', function() {

      //var canWriteProtect = !util.isEnumerable(Object, 'getOwnPropertyDescriptor');

      //TODO: temporarily turn off this until we resolvle IE8 and legacy clobbering
      var canWriteProtect = false;

      it('should throw an exception if a mixin tries to overwrite a property', function() {
        var mixItIn =  function() {
          defineComponent(function() {this.myProperty = 23}, function() {this.myProperty = 38});
        };

        if (canWriteProtect) {
          expect(mixItIn).toThrow("Cannot assign to read only property 'myProperty' of #<Component>");
        } else  {
          expect(mixItIn).not.toThrow();
        }
      });

      it('should not mix in the same mixin twice', function() {
        var base = {mixedInCount: 0};

        var mixMeIn =  function() {this.mixedInCount++};
        var mixMeToo =  function() {this.mixedInCount++};

        compose.mixin(base, [mixMeIn]);
        compose.mixin(base, [mixMeIn]);
        compose.mixin(base, [mixMeToo]);
        compose.mixin(base, [mixMeToo]);

        expect(base.mixedInCount).toBe(2);
      });

    });

    exports(1);
  });
});

