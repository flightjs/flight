"use strict";

var defineComponent = require('../../lib/component');

describe('(Core) constructor', function () {

  function testComponent() {
    this.testVal = 1066;
  }

  function withGoodDefaults() {
    this.defaultAttrs({extra: 38});
  }

  function withBadDefaults() {
    this.defaultAttrs({core: 38});
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

  describe('Component.mixin with this.defaultAttrs', function () {

    var testString1, testString2, testString3 = "";
    var TestComponent, AugmentedComponent1, AugmentedComponent2;

    function baseMixin() {
      this.defaultAttrs({
        core: 35
      });
      this.fn1 = function() {
        testString1 += "testString1"; return testString1
      };
      this.fn2 = function() {
        testString2 += "testString2"; return testString2
      };
    }

    function augmentingMixin1() {
      this.defaultAttrs({
        attr1: {thing: 4}
      });
      this.before('fn1', function() {
        testString1 += "augmented "
      });
      this.fn3 = function() {
        testString3 += "testString3"; return testString3
      };
    }

    function augmentingMixin2() {
      this.defaultAttrs({
        attr1: {thing: 5}
      });
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
      TestComponent = defineComponent(testComponent, baseMixin);
    });

    afterEach(function () {
      TestComponent.teardownAll();
      AugmentedComponent1 && AugmentedComponent1.teardownAll();
      AugmentedComponent2 && AugmentedComponent2.teardownAll();
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

      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1);

      var instance2 = (new AugmentedComponent1).initialize(document.body);
      expect(instance1.fn1()).toBe('testString1');
      expect(instance1.fn2()).toBe('testString2');
      expect(instance1.fn3).not.toBeDefined();

      initData();

      expect(instance2.fn1()).toBe('augmented testString1');
      expect(instance2.fn2()).toBe('testString2');
      expect(instance2.fn3()).toBe('testString3');
    });

    it('cannot re-add an original mixin to an augmented component', function () {
      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
      expect(AugmentedComponent1.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(AugmentedComponent1.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
    });

    it('can be repeatedly called even when augmenting mixins share properties', function () {
      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
      AugmentedComponent2 = TestComponent.mixin(augmentingMixin2, baseMixin);
      expect(AugmentedComponent1.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(AugmentedComponent2.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(AugmentedComponent1.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
      expect(AugmentedComponent2.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
      expect(typeof AugmentedComponent1.prototype.fn3).toBe("function");
      expect(typeof AugmentedComponent2.prototype.fn3).toBe("function");
      expect(AugmentedComponent1.prototype.defaults.attr1).toEqual({thing: 4});
      expect(AugmentedComponent1.prototype.defaults.core).toEqual(35);
      expect(AugmentedComponent2.prototype.defaults.attr1).toEqual({thing: 5});
      expect(AugmentedComponent2.prototype.defaults.core).toEqual(35);
      expect(AugmentedComponent1.prototype.fn3 === AugmentedComponent2.prototype.fn3).toBe(false);
      expect(AugmentedComponent1.prototype.defaults.attr1 === AugmentedComponent2.prototype.defaults.attr1).toBe(false);
    });

    it('(the AugmentedComponent) can be further augmented', function () {
      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
      var anotherMixin = function() {};
      var MoreAugmentedComponent = AugmentedComponent1.mixin(anotherMixin);
      expect(AugmentedComponent1.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(MoreAugmentedComponent.prototype.mixedIn.length).toBe(AugmentedComponent1.prototype.mixedIn.length + 1);
      expect(MoreAugmentedComponent.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
    });

    it('(the AugmentedComponent) can describe itself', function () {
        AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
        expect(AugmentedComponent1.toString()).toBe('testComponent, baseMixin, augmentingMixin1');
    });

  });

  describe('Component.mixin with this.attributes', function () {

    var testString1, testString2, testString3 = "";
    var TestComponent, AugmentedComponent1, AugmentedComponent2;

    function baseMixin() {
      this.attributes({core: 35});
      this.fn1 = function() {
        testString1 += "testString1"; return testString1
      };
      this.fn2 = function() {
        testString2 += "testString2"; return testString2
      };
    }

    function augmentingMixin1() {
      this.attributes({attr1: {thing: 4}});
      this.before('fn1', function() {
        testString1 += "augmented "
      });
      this.fn3 = function() {
        testString3 += "testString3"; return testString3
      };
    }

    function augmentingMixin2() {
      this.attributes({attr1: {thing: 5}});
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
      TestComponent = defineComponent(testComponent, baseMixin);
    });

    afterEach(function () {
      TestComponent.teardownAll();
      AugmentedComponent1 && AugmentedComponent1.teardownAll();
      AugmentedComponent2 && AugmentedComponent2.teardownAll();
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

      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1);

      var instance2 = (new AugmentedComponent1).initialize(document.body);
      expect(instance1.fn1()).toBe('testString1');
      expect(instance1.fn2()).toBe('testString2');
      expect(instance1.fn3).not.toBeDefined();

      initData();

      expect(instance2.fn1()).toBe('augmented testString1');
      expect(instance2.fn2()).toBe('testString2');
      expect(instance2.fn3()).toBe('testString3');
    });

    it('cannot re-add an original mixin to an augmented component', function () {
      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
      expect(AugmentedComponent1.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(AugmentedComponent1.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
    });

    it('can be repeatedly called even when augmenting mixins share properties', function () {
      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
      AugmentedComponent2 = TestComponent.mixin(augmentingMixin2, baseMixin);
      expect(AugmentedComponent1.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(AugmentedComponent2.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(AugmentedComponent1.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
      expect(AugmentedComponent2.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
      expect(typeof AugmentedComponent1.prototype.fn3).toBe("function");
      expect(typeof AugmentedComponent2.prototype.fn3).toBe("function");
      expect(AugmentedComponent1.prototype.attrDef.prototype.attr1).toEqual({thing: 4});
      expect(AugmentedComponent1.prototype.attrDef.prototype.constructor.prototype.core).toEqual(35);
      expect(AugmentedComponent2.prototype.attrDef.prototype.attr1).toEqual({thing: 5});
      expect(AugmentedComponent2.prototype.attrDef.prototype.constructor.prototype.core).toEqual(35);
      expect(AugmentedComponent1.prototype.fn3 === AugmentedComponent2.prototype.fn3).toBe(false);
      expect(AugmentedComponent1.prototype.attrDef.prototype.attr1 === AugmentedComponent2.prototype.attrDef.prototype.attr1).toBe(false);
    });

    it('(the AugmentedComponent) can be further augmented', function () {
      AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
      var anotherMixin = function() {};
      var MoreAugmentedComponent = AugmentedComponent1.mixin(anotherMixin);
      expect(AugmentedComponent1.prototype.mixedIn.length).toBe(TestComponent.prototype.mixedIn.length + 1);
      expect(MoreAugmentedComponent.prototype.mixedIn.length).toBe(AugmentedComponent1.prototype.mixedIn.length + 1);
      expect(MoreAugmentedComponent.prototype.mixedIn.filter(function(e) {return e === baseMixin}).length).toBe(1);
    });

    it('(the AugmentedComponent) can describe itself', function () {
        AugmentedComponent1 = TestComponent.mixin(augmentingMixin1, baseMixin);
        expect(AugmentedComponent1.toString()).toBe('testComponent, baseMixin, augmentingMixin1');
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
