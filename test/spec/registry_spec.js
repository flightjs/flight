"use strict";

var defineComponent = require('../../lib/component');
var registry = require('../../lib/registry');

var Component = (function () {
  function testComponent() {
  }

  return defineComponent(testComponent);
})();

describe('(Core) registry', function () {

  beforeEach(function () {
    window.outerDiv = document.createElement('div');
    window.innerDiv = document.createElement('div');
    window.outerDiv.appendChild(window.innerDiv);
    document.body.appendChild(window.outerDiv);
  });
  afterEach(function () {
    document.body.removeChild(window.outerDiv);
    window.outerDiv = null;
    window.innerDiv = null;
    Component.teardownAll();
  });

  it('registers new components', function () {
    var instance = (new Component).initialize(window.outerDiv);

    expect(registry.components.length).toBe(1);
    expect(Object.keys(registry.allInstances).length).toBe(1);

    expect(registry.allInstances[instance.identity].instance).toBe(instance);
  });

  it('has correct ComponentInfo', function () {
    var instance = (new Component).initialize(window.outerDiv);
    var firstKey = Object.keys(registry.findComponentInfo(Component).instances)[0];

    expect(registry.components.length).toBe(1);
    expect(registry.components[0].component).toBe(Component);
    expect(Object.keys(registry.components[0].instances).length).toBe(1);
    expect(registry.components[0].instances[firstKey].instance).toBe(instance);
  });

  it('has correct InstanceInfo', function () {
    var instance = (new Component).initialize(window.outerDiv);
    var instanceInfo = registry.allInstances[instance.identity];
    expect(instanceInfo.instance).toBe(instance);
  });

  it('registers/unregisters InstanceInfo events', function () {
    var instance = (new Component).initialize(window.outerDiv);
    var instanceInfo = registry.allInstances[instance.identity];

    var myFunction = $.noop;
    instance.on("myEvent", myFunction);
    expect(instanceInfo.events.length).toBe(1);

    var event = instanceInfo.events[0];
    expect(event.element).toBe(instance.node);
    expect(event.type).toBe("myEvent");
    expect(event.callback.target).toBe(myFunction);

    instance.off("myEvent");
    expect(instanceInfo.events.length).toBeFalsy();
  });

  it('removes instances when we call removeInstanceInfo', function () {
    var instance = (new Component).initialize(window.outerDiv);
    var instanceInfo = registry.allInstances[instance.identity];

    var previousNumberOfComponents = registry.components.length;
    var previousNumberOfInstances = Object.keys(registry.allInstances).length;

    registry.removeInstance(instance);

    expect(registry.components.length).toBe(previousNumberOfComponents - 1);
    expect(Object.keys(registry.allInstances).length).toBe(previousNumberOfInstances - 1);
  });

  it('can find components with findComponentInfo', function () {
    var instance = (new Component).initialize(window.outerDiv);

    //pass constructor
    expect(registry.findComponentInfo(Component).component).toBe(Component);
    //pass instance
    expect(registry.findComponentInfo(instance).component).toBe(Component);
  });

  it('can find instances with findInstanceInfo', function () {
    var instance = (new Component).initialize(window.outerDiv);

    //pass instance
    expect(registry.findInstanceInfo(instance).instance).toBe(instance);
    //pass node
    expect(registry.findInstanceInfoByNode(window.outerDiv)[0].instance).toBe(instance);
    //pass phoney instance, find nothing
    expect(registry.findInstanceInfo({node: window.outerDiv})).toBeNull();
    //pass phoney node, find nothing
    expect(registry.findInstanceInfoByNode(window.innerDiv).length).toBeFalsy();
  });

  it('generates correct boundEventNames when there are none', function () {
    var instance = (new Component).initialize(window.outerDiv);

    expect(registry.getBoundEventNames(instance).length).toBe(0);
  });

  it('generates correct boundEventNames when there are some', function () {
    var instance = (new Component).initialize(window.outerDiv);
    instance.on('click', function() {});
    instance.on(document, 'click', function() {});
    instance.on('customEvent', function() {});

    expect(registry.getBoundEventNames(instance).length).toBe(3);
    expect(registry.getBoundEventNames(instance)).toEqual(['click', 'click', 'customEvent']);
  });
});
