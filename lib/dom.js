/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

define(function() {
  'use strict';

  var FlightEvent = (function () {
    function FlightEvent(nativeEvent) {
      Object.defineProperty(this, 'nativeEvent', {
        value: nativeEvent
      });

      Object.defineProperty(this, 'propagationStopped', {
        value: false,
        enumerable: false,
        writable: true
      });

      var eventKeys = [
        'bubbles', 'cancelable', 'currentTarget',
        'detail', 'eventPhase', 'defaultPrevented',
        'isTrusted', 'target', 'timeStamp', 'type',
        // clipboard events
        'clipboardData',
        // keyboard events
        'altKey', 'charCode', 'ctrlKey', 'key',
        'keyCode', 'locale', 'location', 'metaKey',
        'repeat', 'shiftKey', 'which',
        // focus events
        'relatedTarget',
        // mouse events
        'altKey', 'button', 'buttons', 'clientX', 'clientY',
        'ctrlKey', 'metaKey', 'pageX', 'pageY', 'relatedTarget',
        'screenX', 'screenY', 'shiftKey',
        // touch events
        'altKey', 'changedTouches', 'ctrlKey', 'metaKey',
        'shiftKey', 'targetTouches', 'touches',
        // ui events
        'view',
        // wheel events
        'deltaMode', 'deltaX', 'deltaY', 'deltaZ'
      ];

      eventKeys.forEach(function (k) {
        if (typeof this.nativeEvent[k] === 'undefined') {
          return;
        }
        var override;
        var overrideSet = false;
        Object.defineProperty(this, k, {
          configurable: true,
          enumerable: true,
          get: function () {
            return (overrideSet ? override : this.nativeEvent[k]);
          },
          set: function (v) {
            override = v;
            overrideSet = true;
          }
        });
      }, this);
    }

    var hooks = {
      'stopPropagation': function () {
        this.propagationStopped = true;
      }
    };

    ['preventDefault', 'stopPropagation'].forEach(function (k) {
      FlightEvent.prototype[k] = function () {
        if (hooks[k]) {
          hooks[k].apply(this, arguments);
        }
        this.nativeEvent[k].apply(this.nativeEvent, arguments);
      };
    });

    FlightEvent.prototype.isPropagationStopped = function () {
      return this.propagationStopped;
    };

    return FlightEvent;

  }());

  function select(selector) {
    if (typeof selector === 'undefined' || selector === null) {
      throw new Error('Undefined or null selector passed to dom.select');
    }

    // CSS Selector
    if (typeof selector === 'string') {
      if (selector === 'document') {
        return document.documentElement;
      }

      return document.querySelector(selector);
    }

    // Element
    if (selector.nodeType) {
      return selector;
    }

    throw new Error('Cannot use given selector');
  }

  function selectAll(selector, context) {
    context = context || document;
    if (typeof selector === 'undefined' || selector === null) {
      throw new Error('Undefined or null selector passed to dom.select');
    }

    // CSS Selector
    if (typeof selector === 'string') {
      return [].slice.call(
        context.querySelectorAll(selector)
      );
    }

    // Element
    if (selector.nodeType) {
      return [selector];
    }

    // Nodelist
    if ('length' in selector) {
      return [].slice.call(selector);
    }

    throw new Error('Cannot use given selector');
  }

  function normalizeElementArgument(elementsOrSelector) {
    // Useless argument
    if (!elementsOrSelector) {
      throw new Error('Unknown element or selector');
    }

    // Selector passed as first argument
    if (typeof elementsOrSelector === 'string') {
      elementsOrSelector = selectAll(elementsOrSelector);
    }

    // Convert NodeList to array
    if ('length' in elementsOrSelector) {
      elementsOrSelector = [].slice.call(elementsOrSelector);
    }

    // Convert single Node to array
    if (!('length' in elementsOrSelector)) {
      elementsOrSelector = [elementsOrSelector];
    }

    return elementsOrSelector;
  }

  function normalizeTypeArgument(type) {
    // Handle 'event object'
    if (typeof type === 'object') {
      type = type.type;
    }

    if (typeof type !== 'string') {
      throw new Error('Event type is not a string');
    }

    return '' + type;
  }

  function normalizeCallbackArgument(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback is not a function');
    }

    return callback;
  }

  function on(elementsOrSelector, type, callback) {
    var elements = normalizeElementArgument(elementsOrSelector);
    var eventType = normalizeTypeArgument(type);
    callback = normalizeCallbackArgument(callback);

    return elements.map(function (element) {
      element.addEventListener(eventType, callback);
      return callback;
    });
  }

  function off(elementsOrSelector, type, callback) {
    var elements = normalizeElementArgument(elementsOrSelector);
    var eventType = normalizeTypeArgument(type);
    callback = normalizeCallbackArgument(callback);

    return elements.map(function (element) {
      element.removeEventListener(eventType, callback);
      return element;
    });
  }

  function trigger(elementsOrSelector, type, data) {
    var elements = normalizeElementArgument(elementsOrSelector);
    var eventType = normalizeTypeArgument(type);

    return elements.map(function (element) {
      element.dispatchEvent(
          new CustomEvent(eventType, {
              detail: data,
              bubbles: true,
              cancelable: true
          })
      );
      return element;
    });
  }

  function wrapCallback(callback, ctx) {
    return function wrappedCallback(nativeEvent) {
        var event = new FlightEvent(nativeEvent);
        return callback.call(ctx, event, event.detail);
      };
  }

  function parents(node) {
    if (!node.parentNode) {
      return [];
    }
    return [node.parentNode].concat(parents(node.parentNode));
  }

  function closest(contextElement, target, selector) {
    var matchingElements = selectAll(selector, contextElement);
    if (matchingElements.indexOf(target) > -1) {
      return target;
    }
    var targetParents = parents(target);
    return matchingElements.reduce(function (found, matchingElement) {
      if (!found && targetParents.indexOf(matchingElement) > -1) {
        return matchingElement;
      }
      return found;
    }, undefined);
  }

  return {
    select: select,
    selectAll: selectAll,
    on: on,
    off: off,
    trigger: trigger,
    wrapCallback: wrapCallback,
    closest: closest,
    FlightEvent: FlightEvent
  };

});
