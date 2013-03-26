"use strict";

define(['lib/component', 'lib/registry'], function (defineComponent, registry) {

  var testString = "";
  var Component = (function () {
    function testComponent() {
      this.after('initialize', function () {
        testString = testString || "";
        testString += "-initBase-";
      });
    }

    return defineComponent(testComponent, withTestMixin1, withTestMixin2);
  })();

  var Component2 = defineComponent();

  function withTestMixin1() {
    this.testVal = 69;
    this.after('initialize', (function () {
      testString = testString || "";
      testString += "-initTestMixin1-";
    }).bind(this));
  }

  ;

  function withTestMixin2(input) {
    this.testArray = [24, 79];
    this.testFunction = function () {
      return input;
    }
    this.after('initialize', function () {
      testString = testString || "";
      testString += "-initTestMixin2-";
    });
  }

  ;

  describe('(Core) instance', function () {
    beforeEach(function () {
      window.outerDiv = document.createElement('div');
      window.innerDiv = document.createElement('div');
      window.outerDiv.className = window.innerDiv.className = "test-node";
      window.outerDiv.appendChild(window.innerDiv);
      document.body.appendChild(window.outerDiv);
    });
    afterEach(function () {
      document.body.removeChild(window.outerDiv);
      window.outerDiv = null;
      window.innerDiv = null;
      Component.teardownAll();
      Component2.teardownAll();
    });

    it('should reference supplied node in new instance', function () {
      var instance = new Component(window.outerDiv);
      expect(instance.node).toBe(window.outerDiv);
    });

    it('should throw an exception if .on is given an invalid callback', function () {
      var instance = new Component(window.outerDiv);

      function definedCallback() {
      }

      expect(function () {
        instance.on('click', definedCallback);
      }).not.toThrow();

      expect(function () {
        instance.on('click', undefinedCallback);
      }).toThrow();
    });

    it('should create instances for each element matching the given selector', function () {
      var registryTestComponentInfo = registry.findComponentInfo(Component);
      var sizeThen = registryTestComponentInfo ? registryTestComponentInfo.instances.length : 0;
      Component.attachTo('.test-node');
      var sizeNow = Object.keys(registry.findComponentInfo(Component).instances).length;
      expect(sizeNow).toBe(sizeThen + 2);
    });

    it('references expected nodes when we attach to div', function () {
      Component.attachTo('.test-node');
      expect(registry.findInstanceInfoByNode(window.outerDiv)).toBeTruthy();
      expect(registry.findInstanceInfoByNode(window.innerDiv)).toBeTruthy();
    });

    it('calls initializers in the correct order', function () {
      testString = "";
      var instance = new Component(window.outerDiv);
      expect(testString).toBe("-initBase--initTestMixin1--initTestMixin2-");
    });

    describe('multiple instances', function () {
      it('should only attach once when multiple instances of the same Component are attached to the same DOM node', function () {
        Component.attachTo('body');
        Component.attachTo('body');
        expect(Object.keys(registry.findComponentInfo(Component).instances).length).toBe(1);
      });

      it('should attach all instances when the same Component is attached to different nodes', function () {
        Component.attachTo('body');
        Component.attachTo(document);
        expect(Object.keys(registry.findComponentInfo(Component).instances).length).toBe(2);
      });

      it('should attach all instances when different Components are attached to the same node', function () {
        Component.attachTo('body');
        Component2.attachTo('body');
        expect(Object.keys(registry.findComponentInfo(Component).instances).length).toBe(1);
        expect(Object.keys(registry.findComponentInfo(Component2).instances).length).toBe(1);
      });

      it('should merge multiple options arguments correctly', function () {
        Component.attachTo('.test-node', {foo: 46}, {bar: 48});
        var firstKey = Object.keys(registry.findComponentInfo(Component).instances)[0];
        var c = registry.findComponentInfo(Component).instances[firstKey].instance;
        expect(c.attr.foo).toBe(46);
        expect(c.attr.bar).toBe(48);
      });
    });
  });

});
