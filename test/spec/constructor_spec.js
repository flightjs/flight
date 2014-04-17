"use strict";

define(['lib/component'], function (defineComponent) {

  describe('(Core) constructor', function () {

    function testComponent() {
      this.testVal = 1066;
    }

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

    function augmentingMixin() {
      this.after('fn1', function() {return "fn1"});
      this.fn2 = function() {return "fn2"};
    }

    it('exports a define function', function () {
      expect(typeof defineComponent).toBe('function');
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
      var TestComponent = defineComponent(testComponent, withGoodDefaults);
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

    it('throws error when core and mixin defaults overlap', function () {
      expect(function () {
        defineComponent(testComponentDefaultAttrs, withBadDefaults);
      }).toThrow('utils.push attempted to overwrite "core" while running in protected mode');
    });

    describe('Component.mixin', function () {

      var testString1, testString2, testString3 = "";
      var TestComponent, AugmentedComponent;

      function baseMixin() {
        this.fn1 = function() {
          testString1 += "testString1"; return testString1
        };
        this.fn2 = function() {
          testString2 += "testString2"; return testString2
        };
      }

      function augmentingMixin() {
        this.before('fn1', function() {
          testString1 += "augmented "
        });
        this.fn3 = function() {
          testString3 += "testString3"; return testString3
        };
      }

      function initData() {
        testString1 = "";
        testString2 = "";
        testString3 = "";
      }

      beforeEach(function () {
        initData();
        TestComponent = defineComponent(testComponentDefaultAttrs, baseMixin);
      });

      afterEach(function () {
        TestComponent.teardownAll();
        AugmentedComponent && AugmentedComponent.teardownAll();
      });

      it('is a function', function () {
        expect(typeof TestComponent.mixin).toBe('function');
      });

      it('augments a base component', function () {
        var instance1 = (new TestComponent).initialize(document.body);
        expect(instance1.fn1()).toBe('testString1');
        expect(instance1.fn2()).toBe('testString2');
        expect(instance1.fn3).not.toBeDefined();

        initData();

        AugmentedComponent = TestComponent.mixin(augmentingMixin);

        var instance2 = (new AugmentedComponent).initialize(document.body);
        expect(instance1.fn1()).toBe('testString1');
        expect(instance1.fn2()).toBe('testString2');
        expect(instance1.fn3).not.toBeDefined();

        initData();

        expect(instance2.fn1()).toBe('augmented testString1');
        expect(instance2.fn2()).toBe('testString2');
        expect(instance2.fn3()).toBe('testString3');
      });

      it('cannot re-add an original mixin to an augmented component', function () {
        AugmentedComponent = TestComponent.mixin(augmentingMixin, baseMixin);
        expect(AugmentedComponent.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
        expect(AugmentedComponent.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
        console.log(AugmentedComponent.prototype.mixedIn)
      });

      it('(the AugmentedComponent) can be further augmented', function () {
        AugmentedComponent = TestComponent.mixin(augmentingMixin, baseMixin);
        var anotherMixin = function() {};
        var MoreAugmentedComponent = AugmentedComponent.mixin(anotherMixin);
        expect(AugmentedComponent.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
        expect(MoreAugmentedComponent.prototype.mixedIn.length).toBe(AugmentedComponent.prototype.mixedIn.length + 1);
        expect(MoreAugmentedComponent.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
      });

    });

    describe('teardownAll', function () {

      it('should teardown all instances', function () {
        var TestComponent = defineComponent(testComponent);
        var instance1 = (new TestComponent).initialize(document.body);
        var instance2 = (new TestComponent).initialize(document.body);
        spyOn(instance1, 'teardown').andCallThrough();
        spyOn(instance2, 'teardown').andCallThrough();
        TestComponent.teardownAll();
        expect(instance1.teardown).toHaveBeenCalled();
        expect(instance2.teardown).toHaveBeenCalled();
      });

      it('should support teardowns that cause other teardowns', function () {
        var TestComponent = defineComponent(testComponent);
        var instance1 = (new TestComponent).initialize(document.body);
        var instance2 = (new TestComponent).initialize(document.body);
        var original = instance1.teardown;
        instance1.teardown = function () {
          instance2.teardown();
          original.call(this);
        }.bind(instance1);
        expect(function () {
          TestComponent.teardownAll();
        }).not.toThrow();
      });

    });

  });
});
