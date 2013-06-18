(function(context) {
  var factories = {}, loaded = {};
  var isArray = Array.isArray || function(obj) {
    return obj.constructor == Array;
  };

  var map = Array.map || function(arr, fn, scope) {
    for (var i = 0, len = arr.length, result = []; i < len; i++) {
      result.push(fn.call(scope, arr[i]));
    }
    return result;
  };

  function define() {
    var args = Array.prototype.slice.call(arguments), dependencies = [], id, factory;
    if (typeof args[0] == 'string') {
      id = args.shift();
    }
    if (isArray(args[0])) {
      dependencies = args.shift();
    }
    factory = args.shift();
    factories[id] = [dependencies, factory];
  }

  function require(id) {
    function resolve(dep) {
      var relativeParts = id.split('/'), depParts = dep.split('/'), relative = false;
      relativeParts.pop();
      while (depParts[0] == '..' && relativeParts.length) {
        relativeParts.pop();
        depParts.shift();
        relative = true;
      }
      if (depParts[0] == '.') {
        depParts.shift();
        relative = true;
      }
      if (relative) {
        depParts = relativeParts.concat(depParts);
      }
      return depParts.join('/');
    }

    var unresolved, factory, dependencies;
    if (typeof loaded[id] == 'undefined') {
      unresolved = factories[id];
      if (unresolved) {
        dependencies = unresolved[0];
        factory = unresolved[1];
        loaded[id] = factory.apply(undefined, map(dependencies, function(id) {
          return require(resolve(id));
        }));
      }
    }

    return loaded[id];
  }

{{ module }}

  context.flight = require('lib/index');
}(this));
