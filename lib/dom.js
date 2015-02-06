/* Copyright 2013 Twitter, Inc. Licensed under The MIT License. http://opensource.org/licenses/MIT */

define(function(require) {
  'use strict';

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

  function selectAll(selector) {
    if (typeof selector === 'undefined' || selector === null) {
      throw new Error('Undefined or null selector passed to dom.select');
    }

    // CSS Selector
    if (typeof selector === 'string') {
      return [].slice.call(
        document.querySelectorAll(selector)
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
    var callback = normalizeCallbackArgument(callback);

    return elements.map(function (element) {
      element.addEventListener(type, callback);
      return element;
    });
  }

  function off(elementsOrSelector, type, callback) {
    var elements = normalizeElementArgument(elementsOrSelector);
    var eventType = normalizeTypeArgument(type);
    var callback = normalizeCallbackArgument(callback);

    return elements.map(function (element) {
      element.removeEventListener(type, callback);
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

  return {
    select: select,
    selectAll: selectAll,
    on: on,
    off: off,
    trigger: trigger
  };

});
