// ==========================================
// Copyright 2013 Twitter, Inc
// Licensed under The MIT License
// http://opensource.org/licenses/MIT
// ==========================================

define(

  [
    './utils'
  ],

  function(utils) {
    'use strict';

    var dontLock = ['mixedIn'];

    function setWritability(obj, writable) {
      var props = Object.create(null);

      Object.keys(obj).forEach(function (key) {
        if (dontLock.indexOf(key) < 0) {
          utils.propertyWritability(obj, key, writable);
        }
      });
    }

    function mixin(base, mixins) {
      base.mixedIn = base.hasOwnProperty('mixedIn') ? base.mixedIn : [];

      for (var i=0; i<mixins.length; i++) {
        if (base.mixedIn.indexOf(mixins[i]) == -1) {
          setWritability(base, false);
          mixins[i].call(base);
          base.mixedIn.push(mixins[i]);
        }
      }

      setWritability(base, true);
    }

    return {
      mixin: mixin
    };

  }
);
