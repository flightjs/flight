/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

define(function() {
  'use strict';

  var FlightEvent = (function () {
    function FlightEvent(originalEvent) {
      Object.defineProperty(this, 'originalEvent', {
        value: originalEvent
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
        if (typeof this.originalEvent[k] === 'undefined') {
          return;
        }
        var override;
        var overrideSet = false;
        Object.defineProperty(this, k, {
          configurable: true,
          enumerable: true,
          get: function () {
            return (overrideSet ? override : this.originalEvent[k]);
          },
          set: function (v) {
            override = v;
            overrideSet = true;
          }
        });
      }, this);

      if (this.detail === null) {
        this.detail = undefined;
      }
    }

    var hooks = {
      stopPropagation: function () {
        this.propagationStopped = true;
      }
    };

    ['preventDefault', 'stopPropagation'].forEach(function (k) {
      FlightEvent.prototype[k] = function () {
        if (hooks[k]) {
          hooks[k].apply(this, arguments);
        }
        return this.originalEvent[k].apply(this.originalEvent, arguments);
      };
    });

    FlightEvent.prototype.isPropagationStopped = function () {
      return this.propagationStopped;
    };

    return FlightEvent;

  }());

  // Elements that can be jumped to directly from a string
  var selectorShortcut = {
    document: document.documentElement,
    body: document.body,
    head: document.head
  };

  function select(selector, context) {
    context = context || document;
    if (typeof selector === 'undefined' || selector === null) {
      throw new Error('Undefined or null selector passed to dom.select');
    }

    // CSS Selector
    if (typeof selector === 'string') {
      var trimmedSelector = selector.trim();
      return (
        selectorShortcut.hasOwnProperty(trimmedSelector) ?
          selectorShortcut[trimmedSelector] :
          context.querySelector(selector)
      );
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
      var trimmedSelector = selector.trim();
      return (
        selectorShortcut.hasOwnProperty(trimmedSelector) ?
          [selectorShortcut[trimmedSelector]] :
          [].slice.call(context.querySelectorAll(selector))
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

  // Create a callback that lifts the DOM event into a FlightEvent, so we can detect when
  // propagation has been stopped.
  function wrapCallback(callback, ctx) {
    return function wrappedCallback(originalEvent) {
      var event = new FlightEvent(originalEvent);
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
    // Find all the matching elements within the context
    var matchingElements = selectAll(selector, contextElement);
    // Is the node that the event was fired on the node we're looking for?
    if (matchingElements.indexOf(target) > -1) {
      return target;
    }
    // Otherwise, we have to walk back up the DOM.
    // First, gather all the parents of the target.
    var targetParents = parents(target);
    // Using the selector-matching elements, look to see if any of the parents match. This is
    // bounded to within the contextElement because the matchingElements only come from within that
    // node. Imperitive loop here because we can't guarantee Array#find.
    var match;
    var i = 0;
    var l = matchingElements.length;
    for (; i < l; i++) {
      if (targetParents.indexOf(matchingElements[i]) > -1) {
        match = matchingElements[i];
        break;
      }
    }
    return match;
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
