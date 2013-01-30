"use strict";

provide(function(exports) {
  using('lib/component', 'lib/registry', function(defineComponent, registry) {

    var testString = "";
    var Component = (function() {
      function testComponent() {
        this.after('initialize', function() {
          testString = testString || "";
          testString += "-initBase-";
        });
      }

      return defineComponent(testComponent, withTestMixin1, withTestMixin2);
    })();


    var Component2 = defineComponent();

    function withTestMixin1() {
      this.testVal = 69;
      this.after('initialize', (function() {
        testString = testString || "";
        testString += "-initTestMixin1-";
      }).bind(this));
    };

    function withTestMixin2(input) {
      this.testArray = [24, 79];
      this.testFunction = function() {
        return input;
      }
      this.after('initialize', function() {
        testString = testString || "";
        testString += "-initTestMixin2-";
      });
    };

    describe('(Core) instance', function() {
      beforeEach(function() {
        window.outerDiv = document.createElement('div');
        window.innerDiv = document.createElement('div');
        window.outerDiv.className = window.innerDiv.className = "test-node";
        window.outerDiv.appendChild(window.innerDiv);
        document.body.appendChild(window.outerDiv);
      });
      afterEach(function() {
        document.body.removeChild(window.outerDiv);
        window.outerDiv = null;
        window.innerDiv = null;
        Component.teardownAll();
        Component2.teardownAll();
      });

      it('should reference supplied node in new instance', function() {
        var instance = new Component(window.outerDiv);
         expect(instance.node).toBe(window.outerDiv);
      });

      it('should throw an exception if .on is given an invalid callback', function() {
        var instance = new Component(window.outerDiv);

        function definedCallback() {}

        expect(function() {
          instance.on('click', definedCallback);
        }).not.toThrow();

        expect(function() {
          instance.on('click', undefinedCallback);
        }).toThrow();
      });

      it('should create instances for each element matching the given selector', function() {
        var registryTestComponentInfo = registry.findComponentInfo(Component);
        var sizeThen = registryTestComponentInfo ? registryTestComponentInfo.instances.length : 0;
        Component.attachTo('.test-node');
        var sizeNow = registry.findComponentInfo(Component).instances.length;
        expect(sizeNow).toBe(sizeThen + 2);
      });

      it('references expected nodes when we attach to div', function() {
        Component.attachTo('.test-node');
        expect(registry.findInstanceInfo(window.outerDiv)).toBeTruthy();
        expect(registry.findInstanceInfo(window.innerDiv)).toBeTruthy();
      });

      it('calls initializers in the correct order', function() {
        testString = "";
        var instance = new Component(window.outerDiv);
        expect(testString).toBe("-initBase--initTestMixin1--initTestMixin2-");
      });

      describe('multiple instances', function () {
        it('should throw an error if multiple instances of the same Component are attached to the same DOM node', function () {
          expect(function () {
            Component.attachTo('body');
            Component.attachTo('body');
          }).toThrow();
        });

        it('should not throw an error if multiple instances of the same Component are attached to different nodes', function () {
          expect(function () {
            Component.attachTo('body');
            Component.attachTo(document);
          }).not.toThrow();
        });

        it('should not throw an error if instances of different Components are attached to the same node', function () {
          expect(function () {
            Component.attachTo('body');
            Component2.attachTo('body');
          }).not.toThrow();
        });
      });
    });

    exports(1);
  });
});
