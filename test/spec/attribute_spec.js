"use strict";

define(['lib/component', 'lib/debug'], function (defineComponent, debug) {

  describe('(Core) this.attributes', function() {
    function testComponentDefaultAttrs() {
      this.attributes({core: 35});
    }

    function testComponentDefaultAttrsRequired() {
      this.attributes({req: null});
    }

    function withGoodDefaults() {
      this.attributes({extra: 38});
    }

    function withBadDefaults() {
      this.attributes({core: 38});
    }

    function withOverriddenAttributes() {
      this.attributes({core: 1, extra: 38});
    }

    function testComponentWithFunctionAttribute() {
      this.attributes({
        f: function() {
          return this.node.nodeName.toLowerCase() == 'body';
        }
      });
    }

    it('adds core defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs);
      var instance = (new TestComponent).initialize(document.body);

      expect(instance.attr.core).toBe(35);

      TestComponent.teardownAll();
    });

    it('throws error if required attr not specified', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrsRequired);
      expect(function () {
        var instance = (new TestComponent).initialize(document.body);
      }).toThrow('Required attribute "req" not specified in attachTo for component "testComponentDefaultAttrsRequired".');

      TestComponent.teardownAll();
    });

    it("doesn't throw error if required attr is specified", function () {
      var TestComponent = defineComponent(testComponentDefaultAttrsRequired);
      expect(function () {
        var instance = (new TestComponent).initialize(document.body, { req: 'hello' });
      }).not.toThrow();

      TestComponent.teardownAll();
    });

    it("doesn't attach to empty jQuery objects", function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs);
      var trouble = function () {
        (new TestComponent).initialize();
      };
      expect(trouble).toThrow(new Error("Component needs a node"));
    });

    it('adds mixin defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs, withGoodDefaults);
      var instance = (new TestComponent).initialize(document.body);

      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

    it('adds core and mixin defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs, withGoodDefaults);
      var instance = (new TestComponent).initialize(document.body);
      expect(instance.attr.core).toBe(35);
      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

    it('can override attributes from a mixin', function() {
      var TestComponent = defineComponent(testComponentDefaultAttrs, withOverriddenAttributes);
      var instance = (new TestComponent).initialize(document.body);
      expect(instance.attr.core).toBe(1);
      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

    it('can override attributes from a mixin when write-lock engaged', function() {
      debug.enable(true);
      var TestComponent = defineComponent(testComponentDefaultAttrs, withOverriddenAttributes);
      var instance = (new TestComponent).initialize(document.body);
      expect(instance.attr.core).toBe(1);
      expect(instance.attr.extra).toBe(38);
      debug.enable(false);

      TestComponent.teardownAll();
    });

    it('will evaluate attributes that are functions at initialize time', function() {
      var TestComponent = defineComponent(testComponentWithFunctionAttribute);

      var instance = (new TestComponent).initialize(document.body);
      expect(instance.attr.f).toBe(true);

      var instance2 = (new TestComponent).initialize($('div').get(0));
      expect(instance2.attr.f).toBe(false);

      TestComponent.teardownAll();
    });
  });

  describe('(Core) this.defaultAttrs', function() {
    function testComponentDefaultAttrs() {
      this.defaultAttrs({core: 35});
    }

    function testComponentDefaultAttrsRequired() {
      this.defaultAttrs({req: null});
    }

    function withGoodDefaults() {
      this.defaultAttrs({extra: 38});
    }

    function withBadDefaults() {
      this.defaultAttrs({core: 38});
    }

    it('adds core defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs);
      var instance = (new TestComponent).initialize(document.body);

      expect(instance.attr.core).toBe(35);

      TestComponent.teardownAll();
    });

    it('throws error if required attr not specified', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrsRequired);
      expect(function () {
        var instance = (new TestComponent).initialize(document.body);
      }).toThrow('Required attribute "req" not specified in attachTo for component "testComponentDefaultAttrsRequired".');

      TestComponent.teardownAll();
    });

    it("doesn't throw error if required attr is specified", function () {
      var TestComponent = defineComponent(testComponentDefaultAttrsRequired);
      expect(function () {
        var instance = (new TestComponent).initialize(document.body, { req: 'hello' });
      }).not.toThrow();

      TestComponent.teardownAll();
    });

    it("doesn't attach to empty jQuery objects", function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs);
      var trouble = function () {
        (new TestComponent).initialize();
      };
      expect(trouble).toThrow(new Error("Component needs a node"));
    });

    it('adds mixin defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs, withGoodDefaults);
      var instance = (new TestComponent).initialize(document.body);

      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

    it('adds core and mixin defaults', function () {
      var TestComponent = defineComponent(testComponentDefaultAttrs, withGoodDefaults);
      var instance = (new TestComponent).initialize(document.body);
      expect(instance.attr.core).toBe(35);
      expect(instance.attr.extra).toBe(38);

      TestComponent.teardownAll();
    });

  });

});
