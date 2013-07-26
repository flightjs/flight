"use strict";

define(['lib/component'], function (defineComponent) {

  describe('(Core) constructor', function () {

    function testComponent() {
      this.testVal = 1066;
    }

    function withGoodDefaults() {
      this.defaultAttrs({extra: 38});
    }

    it('exports a define function', function () {
      expect(typeof defineComponent).toBe('function');
    });

    it("doesn't attach to empty jQuery objects", function () {
      var TestComponent = defineComponent(testComponent);
      var trouble = function () {
        (new TestComponent).initialize();
      };
      expect(trouble).toThrow(new Error("Component needs a node"));
    });

    it('defineComponent() should return a component constructor', function () {
      var TestComponent = defineComponent(testComponent);

      expect(typeof TestComponent).toBe('function');
      expect(typeof TestComponent.attachTo).toBe('function');
      expect(TestComponent.prototype.testVal).toBe(1066);
    });

    it('has standard methods', function () {
      var TestComponent = defineComponent(testComponent);

      expect(typeof TestComponent.prototype.on).toBe('function');
      expect(typeof TestComponent.prototype.off).toBe('function');
      expect(typeof TestComponent.prototype.trigger).toBe('function');
    });

    it('can describe itself', function () {
      var TestComponent = defineComponent(testComponent, withGoodDefaults);
      expect(TestComponent.toString()).toBe('testComponent, withGoodDefaults');
    });

  });
});
