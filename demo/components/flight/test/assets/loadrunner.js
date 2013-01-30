(function(context, document) {
  var useInteractive = context.attachEvent && !context.opera,
      scripts = document.getElementsByTagName('script'),
      scriptTag, scriptTemplate = document.createElement('script'),
      currentProvide, currentScript, activeScripts = {}, oldUsing = context.using,
      oldProvide = context.provide, oldLoadrunner = context.loadrunner;

  var pausedDependencies = {}, metDependencies = {}, inProgressDependencies = {};

  for (var i=0, s; s = scripts[i]; i++) {
    if (s.src.match(/loadrunner\.js(\?|#|$)/)) {
      scriptTag = s;
      break;
    }
  }

  var uuid = (function () {
    var _uuid = 0;

    return function () {
      return _uuid++;
    };
  })();

  function aug(target) {
    for (var i = 1, o; o = arguments[i]; i++) {
      for (var key in o) {
        target[key] = o[key];
      }
    }
    return target;
  }
  function makeArray(o) {
    return Array.prototype.slice.call(o);
  }

  var isArray = Array.isArray || function(obj) {
    return obj.constructor == Array;
  }

  function indexOf(arr, thing) {
    for (var i=0, item; item = arr[i]; i++) {
      if (thing == item) {
        return i;
      }
    }

    return -1;
  }

  function path() {
    var parts = makeArray(arguments), normalized = [];
    for (var i=0, len = parts.length; i < len; i++) {
      if (parts[i].length > 0) {
        normalized.push(parts[i].replace(/\/$/, ''));
      }
    }
    return normalized.join('/');
  }

  function pushObjPath(obj, path, newobj) {
    var names = path.split('/'), cursor = obj;
    while (names.length > 1) {
      var name = names.shift();
      cursor = cursor[name] = cursor[name] || {};
    }
    cursor[names[0]] = newobj;
  }

  function Dependency() {}

  Dependency.prototype.then = function(cb) {
    this.callbacks = this.callbacks || [];
    this.callbacks.push(cb);

    if (this.completed) {
      cb.apply(context, this.results);
    } else {
      if (this.callbacks.length == 1) {
        this.start();
      }
    }

    return this;
  };
  Dependency.prototype.key = function() {
    if (!this.id) {
      this.id = uuid();
    }

    return 'dependency_' + this.id;
  };
  Dependency.prototype.start = function() {
    var dep = this, met, inProgress;

    this.startTime = (new Date).getTime();

    if (met = metDependencies[this.key()]) {
      this.complete.apply(this, met.results);
    } else if (inProgress = inProgressDependencies[this.key()]) {
        inProgress.then(function() {
          dep.complete.apply(dep, arguments);
        });
    } else {
      if (this.shouldFetch()) {
        inProgressDependencies[this.key()] = this;
        this.fetch();
      } else {
        pausedDependencies[this.key()] = pausedDependencies[this.key()] || [];
        pausedDependencies[this.key()].push(this);
      }
    }
  };
  Dependency.prototype.shouldFetch = function() {
    return true;
  }
  Dependency.prototype.complete = function() {
    var paused;

    this.endTime = (new Date).getTime();

    delete inProgressDependencies[this.key()];

    if (!metDependencies[this.key()]) {
      metDependencies[this.key()] = this;
    }

    if (!this.completed) {
      this.results = makeArray(arguments);
      this.completed = true;

      if (this.callbacks) {
        for (var i=0, cb; cb = this.callbacks[i]; i++) {
          cb.apply(context, this.results);
        }
      }

      if (paused = pausedDependencies[this.key()]) {
        for (var i=0, p; p = paused[i]; i++) {
          p.complete.apply(p, arguments);
        }

        delete pausedDependencies[this.key()];
      }
    }
  };

  function Script(path, force) {
    if (path) {
      this.id = this.path = this.resolvePath(path);
    }

    this.force = !!force;
  }
  Script.autoFetch = true;

  Script.prototype.start = function() {
    var me = this, bundle;
    if (bundle = findBundle(this.id)) {
      bundle.then(function() {
        me.start();
      });
    } else {
      Dependency.prototype.start.call(this);
    }
  };

  Script.xhrTransport = function() {
    var xhr;

    var me = this;

    if(window.XMLHttpRequest) {
      xhr = new window.XMLHttpRequest();
    } else {
      try {
        xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
      } catch(e) {
        //  Eep
        return new Error('XHR not found.');
      }
    }

    xhr.onreadystatechange = function() {
      var result;

      if(xhr.readyState == 4) {
        me.loaded(xhr.responseText);
      }
    };

    xhr.open('GET', this.path, true);
    xhr.send(null);
  };

  Script.scriptTagTransport = function() {
    var script = scriptTemplate.cloneNode(false), me = this;

    this.scriptId = 'LR' + uuid();
    script.id = this.scriptId;
    script.type = 'text/javascript';
    script.async = true;

    script.onerror = function() {
      throw new Error(me.path + ' not loaded');
    }

    script.onreadystatechange = script.onload = function (e) {
      e = context.event || e;

      if (e.type == 'load' || indexOf(['loaded', 'complete'], this.readyState) > -1) {
        this.onreadystatechange = null;
        me.loaded();
      }
    };

    script.src = this.path;

    currentScript = this;
    scripts[0].parentNode.insertBefore(script, scripts[0]);
    currentScript = null;

    activeScripts[this.scriptId] = this;
  }

  Script.prototype = new Dependency;
  Script.prototype.resolvePath = function(filePath) {
    filePath = filePath.replace(/^\$/, using.path.replace(/\/$/, '') + '/');
    return filePath;
  }
  Script.prototype.key = function() {
    return "script_" + this.id;
  };
  Script.prototype.shouldFetch = function() {
    return Script.autoFetch || this.force;
  };
  Script.prototype.fetch = Script.scriptTagTransport;
  Script.prototype.loaded = function() {
    this.complete();
  }

  function Module(id, force) {
    this.id = id;
    this.path = this.resolvePath(id);
    this.force = force;
  }
  Module.exports = {};
  Module.prototype = new Script;
  Module.prototype.start = function() {
    var me = this, def, bundle;

    if (def = Definition.provided[this.id]) {
      def.then(function(exports) {
        me.complete.call(me, exports);
      });
    } else if (bundle = findBundle(this.id)) {
      bundle.then(function() {
        me.start();
      });
    } else {
      Script.prototype.start.call(this);
    }
  };
  Module.prototype.key = function() {
    return 'module_' + this.id;
  };
  Module.prototype.resolvePath = function(id) {
    return path(using.path, id + '.js');
  };
  Module.prototype.loaded = function() {
    var p, exports, me = this;
    if (!useInteractive) {
      p = currentProvide;
      currentProvide = null;

      if (p) {
        p.setId(this.id);
        p.then(function(exports) {
          me.complete.call(me, exports);
        });
      } else if (!Definition.provided[this.id]) {
        throw new Error("Tried to load '" + this.id +"' as a module, but it didn't have a 'provide()' in it.");
      }
    }
  };
  function Bundle(id, contents) {
    this.id = id;
    this.contents = contents;
    this.dep = createDependency(id);
    this.deps = [];
    this.path = this.dep.path;
  }
  Bundle.prototype = new Script;
  Bundle.prototype.start = function() {
    var me = this, def, dep, key;
    for (var i=0, l=this.contents.length; i<l; i++) {
      dep = createDependency(this.contents[i]);
      this.deps.push(dep);
      key = dep.key();

      if (!metDependencies[key] && !inProgressDependencies[key] && !pausedDependencies[key]) {
        pausedDependencies[key] = this;
      }
    }
    Script.prototype.start.call(this);
  };
  Bundle.prototype.loaded = function() {
    var p, exports, me = this, dep, key;
    for (var i=0, l=this.deps.length; i<l; i++) {
      dep = this.deps[i];
      key = dep.key();

      delete pausedDependencies[key];
      metDependencies[key] = this;
    }
    Script.prototype.loaded.call(this);
  };

  function Definition(id, body) {
    var module;

    this.body = body;

    if (!id) {
      if (useInteractive) {
        module = currentScript || interactiveScript();


        if (module) {
          this.setId(module.id);
          delete activeScripts[module.scriptId];

          this.then(function(exports) {
            module.complete.call(module, exports);
          });
        }
      } else {
        currentProvide = this;
      }
    } else {
      this.setId(id);

      if (module = inProgressDependencies['module_' + this.id]) {
       this.then(function(exports) {
         module.complete.call(module, exports);
       });
      }
    }
  }
  Definition.provided = {};
  Definition.prototype = new Dependency;
  Definition.prototype.key = function() {
    if (!this.id) this.id = "anon_" + uuid();
    return 'definition_' + this.id;
  };
  Definition.prototype.setId = function(id) {
    this.id = id;
    Definition.provided[id] = this;
  }
  Definition.prototype.fetch = function() {
    var me = this;

    if (typeof this.body == 'object') {
      this.complete(this.body);
    } else if (typeof this.body == 'function') {
      this.body(function(exports) {
        me.complete(exports);
      });
    }
  }
  Definition.prototype.complete = function(exports) {
    exports = exports || {};

    if (this.id) {
      this.exports = Module.exports[this.id] = exports;
    }

    Dependency.prototype.complete.call(this, exports);
  }

  function flattenDeps(deps) {
    var flat = [];

    for (var i=0, d; d = deps[i]; i++) {
      if (d instanceof Sequence) {
        flat = flat.concat(flattenDeps(d.deps));
      } else if (d instanceof Module) {
        flat.push(d);
      }
    }

    return flat;
  }

  function forceFetch() {
    for (var i=0, d; d = this.deps[i]; i++) {
      if (d.forceFetch) {
        d.forceFetch();
      } else {
        d.force = true;
        d.start();
      }
    }

    return this;
  }

  function Collection(deps) {
    this.deps = deps;
    if (this.deps.length == 0) {
      this.complete();
    }
  }
  Collection.prototype = new Dependency;
  Collection.prototype.fetch = function() {
    var me = this;

    function depComplete() {
      var results = [];

      for (var i=0, d; d = me.deps[i]; i++) {
        if (!d.completed) return;
        if (d.results.length > 0) {
          results = results.concat(d.results);
        }
      }

      me.complete.apply(me, results);
    }

    for (var i=0, d; d = this.deps[i]; i++) {
      d.then(depComplete);
    }

    return this;
  };
  Collection.prototype.forceFetch = forceFetch;
  Collection.prototype.as = function(cb) {
    var me = this;

    return this.then(function() {
      var flatDeps = flattenDeps(me.deps), obj = {};

      for (var i=0, d; d = flatDeps[i]; i++) {
        pushObjPath(obj, d.id, arguments[i]);
      }

      cb.apply(this, [obj].concat(makeArray(arguments)));
    });
  };

  function Sequence(deps) {
    this.deps = deps;
  }
  Sequence.prototype = new Dependency;
  Sequence.prototype.fetch = function() {
    var me = this, nextDep = 0, allResults = [];

    (function next() {
      var dep = me.deps[nextDep++];
      if (dep) {
        dep.then(function(results) {
          if (dep.results.length > 0) {
            allResults = allResults.concat(dep.results);
          }
          next();
        });
      } else {
        me.complete.apply(me, allResults);
      }
    }());

    return this;
  }
  Sequence.prototype.forceFetch = forceFetch;

  var definedBundles = [];
  function Manifest() {
    this.entries = {};
  }
  Manifest.prototype.push = function(bundle) {
    for (var file in bundle) {
      definedBundles[file] = new Bundle(file, bundle[file]);
      for (var i=0, alias; alias = bundle[file][i]; i++) {
        this.entries[alias] = definedBundles[file];
      }
    }
  }
  Manifest.prototype.get = function(key) {
    return this.entries[key];
  }


  function interactiveScript() {
    for (var i in scripts) {
      if (scripts[i].readyState == 'interactive') {
        return activeScripts[scripts[i].id];
      }
    }
  }

  function provide() {
    var args = makeArray(arguments), name, body;

    if (typeof args[0] == 'string') {
      name = args.shift();
    }

    body = args.shift();

    return new Definition(name, body);
  }

  function using() {
    var deps = makeArray(arguments), callback;

    if (typeof deps[deps.length-1] == 'function') {
      callback = deps.pop();
    }

    var combi = new Collection(mapDependencies(deps));

    if (callback) {
      combi.then(callback);
    }

    return combi;
  }

  function mapDependencies(deps) {
    var mapped = [];

    for (var i=0, dep; dep = deps[i]; i++) {
      if (typeof dep == 'string') {
        dep = createDependency(dep);
      }

      if (isArray(dep)) {
        dep = new Sequence(mapDependencies(dep));
      }

      mapped.push(dep);
    }

    return mapped;
  }

  function createDependency(id) {
    var m, dep;

    for (var i=0, matcher; matcher = using.matchers[i]; i++) {
      var regex = matcher[0], factory = matcher[1];
      if (m = id.match(regex)) {
        return factory(id);
      }
    }
    throw new Error(id + ' was not recognised by loader');
  }

  var loadrunner = function(f) {
    return f(using, provide, loadrunner);
  }

  function noConflict() {
    context.using = oldUsing;
    context.provide = oldProvide;
    context.loadrunner = oldLoadrunner;
    return loadrunner;
  }

  function debug(key) {
    var dep, log = {};

    function pushLog(dep, status) {
      log[status] = log[status] || {};
      log[status][key] = {
        key: key,
        start: dep.startTime,
        end: dep.endTime,
        duration: dep.endTime - (dep.startTime || (new Date).getTime()),
        status: status,
        origin: dep
      };
    }

    if (key && ((dep = metDependencies[key]) || (dep = inProgressDependencies[key]) ||
          (dep = pausedDependencies[key]))) {
      return {
        start: dep.startTime,
        end: dep.endTime,
        duration: dep.endTime - (dep.startTime || (new Date).getTime()),
        origin: dep
      };
    } else {
      for (var key in metDependencies) {
        pushLog(metDependencies[key], 'met');
      }

      for (var key in inProgressDependencies) {
        pushLog(inProgressDependencies[key], 'inProgress');
      }

      for (var key in pausedDependencies) {
        pushLog(pausedDependencies[key], 'paused');
      }

      return log;
    }
  }

  function reset() {
    pausedDependencies = {};
    metDependencies = {};
    inProgressDependencies = {};
    using.bundles = new Manifest;
    Module.exports = {};
    Definition.provided = {};
  }

  loadrunner.Script = Script;
  loadrunner.Module = Module;
  loadrunner.Collection = Collection;
  loadrunner.Sequence = Sequence;
  loadrunner.Definition = Definition;
  loadrunner.Dependency = Dependency;
  loadrunner.noConflict = noConflict;
  loadrunner.debug = debug;
  loadrunner.reset = reset;

  context.loadrunner = loadrunner;
  context.using   = using;
  context.provide = provide;

  using.path = '';

  using.bundles = new Manifest();

  // Append your bundle manifests to this array
  // using.bundles.push( { "bundlename" : ["modulename", "modulename2", "script"], "bundle2": ["script2"] });
  // Loadbuilder can generate your bundles and manifests
  function findBundle(id) {
    return using.bundles.get(id) || undefined;
  }

  using.matchers = [];
  using.matchers.add = function(regex, factory) {
    this.unshift([regex, factory]);
  }

  using.matchers.add(/^(lr!)?[a-zA-Z0-9_\/.-]+$/, function(id) {
    var mod = new Module(id.replace(/^lr!/, ''));
    return mod;
  });

  using.matchers.add(/(^script!|\.js$)/, function(path) {
    var script = new Script(path.replace(/^script!/, ''));
    return script;
  });

  if (scriptTag) {
    using.path = scriptTag.getAttribute('data-path') || scriptTag.src.split(/loadrunner\.js/)[0] || '';

    if (main = scriptTag.getAttribute('data-main')) {
      using.apply(context, main.split(/\s*,\s*/)).then(function() {});
    }
  }
}(this, document));
(function(context, document) {
  var useInteractive = context.attachEvent && !context.opera,
      scripts = document.getElementsByTagName('script'),
      scriptTag, scriptTemplate = document.createElement('script'),
      currentProvide, currentScript, activeScripts = {}, oldUsing = context.using,
      oldProvide = context.provide, oldLoadrunner = context.loadrunner;

  var pausedDependencies = {}, metDependencies = {}, inProgressDependencies = {};

  for (var i=0, s; s = scripts[i]; i++) {
    if (s.src.match(/loadrunner\.js(\?|#|$)/)) {
      scriptTag = s;
      break;
    }
  }

  var uuid = (function () {
    var _uuid = 0;

    return function () {
      return _uuid++;
    };
  })();

  function aug(target) {
    for (var i = 1, o; o = arguments[i]; i++) {
      for (var key in o) {
        target[key] = o[key];
      }
    }
    return target;
  }
  function makeArray(o) {
    return Array.prototype.slice.call(o);
  }

  var isArray = Array.isArray || function(obj) {
    return obj.constructor == Array;
  }

  function indexOf(arr, thing) {
    for (var i=0, item; item = arr[i]; i++) {
      if (thing == item) {
        return i;
      }
    }

    return -1;
  }

  function path() {
    var parts = makeArray(arguments), normalized = [];
    for (var i=0, len = parts.length; i < len; i++) {
      if (parts[i].length > 0) {
        normalized.push(parts[i].replace(/\/$/, ''));
      }
    }
    return normalized.join('/');
  }

  function pushObjPath(obj, path, newobj) {
    var names = path.split('/'), cursor = obj;
    while (names.length > 1) {
      var name = names.shift();
      cursor = cursor[name] = cursor[name] || {};
    }
    cursor[names[0]] = newobj;
  }

  function Dependency() {}

  Dependency.prototype.then = function(cb) {
    this.callbacks = this.callbacks || [];
    this.callbacks.push(cb);

    if (this.completed) {
      cb.apply(context, this.results);
    } else {
      if (this.callbacks.length == 1) {
        this.start();
      }
    }

    return this;
  };
  Dependency.prototype.key = function() {
    if (!this.id) {
      this.id = uuid();
    }

    return 'dependency_' + this.id;
  };
  Dependency.prototype.start = function() {
    var dep = this, met, inProgress;

    this.startTime = (new Date).getTime();

    if (met = metDependencies[this.key()]) {
      this.complete.apply(this, met.results);
    } else if (inProgress = inProgressDependencies[this.key()]) {
        inProgress.then(function() {
          dep.complete.apply(dep, arguments);
        });
    } else {
      if (this.shouldFetch()) {
        inProgressDependencies[this.key()] = this;
        this.fetch();
      } else {
        pausedDependencies[this.key()] = pausedDependencies[this.key()] || [];
        pausedDependencies[this.key()].push(this);
      }
    }
  };
  Dependency.prototype.shouldFetch = function() {
    return true;
  }
  Dependency.prototype.complete = function() {
    var paused;

    this.endTime = (new Date).getTime();

    delete inProgressDependencies[this.key()];

    if (!metDependencies[this.key()]) {
      metDependencies[this.key()] = this;
    }

    if (!this.completed) {
      this.results = makeArray(arguments);
      this.completed = true;

      if (this.callbacks) {
        for (var i=0, cb; cb = this.callbacks[i]; i++) {
          cb.apply(context, this.results);
        }
      }

      if (paused = pausedDependencies[this.key()]) {
        for (var i=0, p; p = paused[i]; i++) {
          p.complete.apply(p, arguments);
        }

        delete pausedDependencies[this.key()];
      }
    }
  };

  function Script(path, force) {
    if (path) {
      this.id = this.path = this.resolvePath(path);
    }

    this.force = !!force;
  }
  Script.autoFetch = true;

  Script.prototype.start = function() {
    var me = this, bundle;
    if (bundle = findBundle(this.id)) {
      bundle.then(function() {
        me.start();
      });
    } else {
      Dependency.prototype.start.call(this);
    }
  };

  Script.xhrTransport = function() {
    var xhr;

    var me = this;

    if(window.XMLHttpRequest) {
      xhr = new window.XMLHttpRequest();
    } else {
      try {
        xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
      } catch(e) {
        //  Eep
        return new Error('XHR not found.');
      }
    }

    xhr.onreadystatechange = function() {
      var result;

      if(xhr.readyState == 4) {
        me.loaded(xhr.responseText);
      }
    };

    xhr.open('GET', this.path, true);
    xhr.send(null);
  };

  Script.scriptTagTransport = function() {
    var script = scriptTemplate.cloneNode(false), me = this;

    this.scriptId = 'LR' + uuid();
    script.id = this.scriptId;
    script.type = 'text/javascript';
    script.async = true;

    script.onerror = function() {
      throw new Error(me.path + ' not loaded');
    }

    script.onreadystatechange = script.onload = function (e) {
      e = context.event || e;

      if (e.type == 'load' || indexOf(['loaded', 'complete'], this.readyState) > -1) {
        this.onreadystatechange = null;
        me.loaded();
      }
    };

    script.src = this.path;

    currentScript = this;
    scripts[0].parentNode.insertBefore(script, scripts[0]);
    currentScript = null;

    activeScripts[this.scriptId] = this;
  }

  Script.prototype = new Dependency;
  Script.prototype.resolvePath = function(filePath) {
    filePath = filePath.replace(/^\$/, using.path.replace(/\/$/, '') + '/');
    return filePath;
  }
  Script.prototype.key = function() {
    return "script_" + this.id;
  };
  Script.prototype.shouldFetch = function() {
    return Script.autoFetch || this.force;
  };
  Script.prototype.fetch = Script.scriptTagTransport;
  Script.prototype.loaded = function() {
    this.complete();
  }

  function Module(id, force) {
    this.id = id;
    this.path = this.resolvePath(id);
    this.force = force;
  }
  Module.exports = {};
  Module.prototype = new Script;
  Module.prototype.start = function() {
    var me = this, def, bundle;

    if (def = Definition.provided[this.id]) {
      def.then(function(exports) {
        me.complete.call(me, exports);
      });
    } else if (bundle = findBundle(this.id)) {
      bundle.then(function() {
        me.start();
      });
    } else {
      Script.prototype.start.call(this);
    }
  };
  Module.prototype.key = function() {
    return 'module_' + this.id;
  };
  Module.prototype.resolvePath = function(id) {
    return path(using.path, id + '.js');
  };
  Module.prototype.loaded = function() {
    var p, exports, me = this;
    if (!useInteractive) {
      p = currentProvide;
      currentProvide = null;

      if (p) {
        p.setId(this.id);
        p.then(function(exports) {
          me.complete.call(me, exports);
        });
      } else if (!Definition.provided[this.id]) {
        throw new Error("Tried to load '" + this.id +"' as a module, but it didn't have a 'provide()' in it.");
      }
    }
  };
  function Bundle(id, contents) {
    this.id = id;
    this.contents = contents;
    this.dep = createDependency(id);
    this.deps = [];
    this.path = this.dep.path;
  }
  Bundle.prototype = new Script;
  Bundle.prototype.start = function() {
    var me = this, def, dep, key;
    for (var i=0, l=this.contents.length; i<l; i++) {
      dep = createDependency(this.contents[i]);
      this.deps.push(dep);
      key = dep.key();

      if (!metDependencies[key] && !inProgressDependencies[key] && !pausedDependencies[key]) {
        pausedDependencies[key] = this;
      }
    }
    Script.prototype.start.call(this);
  };
  Bundle.prototype.loaded = function() {
    var p, exports, me = this, dep, key;
    for (var i=0, l=this.deps.length; i<l; i++) {
      dep = this.deps[i];
      key = dep.key();

      delete pausedDependencies[key];
      metDependencies[key] = this;
    }
    Script.prototype.loaded.call(this);
  };

  function Definition(id, body) {
    var module;

    this.body = body;

    if (!id) {
      if (useInteractive) {
        module = currentScript || interactiveScript();


        if (module) {
          this.setId(module.id);
          delete activeScripts[module.scriptId];

          this.then(function(exports) {
            module.complete.call(module, exports);
          });
        }
      } else {
        currentProvide = this;
      }
    } else {
      this.setId(id);

      if (module = inProgressDependencies['module_' + this.id]) {
       this.then(function(exports) {
         module.complete.call(module, exports);
       });
      }
    }
  }
  Definition.provided = {};
  Definition.prototype = new Dependency;
  Definition.prototype.key = function() {
    if (!this.id) this.id = "anon_" + uuid();
    return 'definition_' + this.id;
  };
  Definition.prototype.setId = function(id) {
    this.id = id;
    Definition.provided[id] = this;
  }
  Definition.prototype.fetch = function() {
    var me = this;

    if (typeof this.body == 'object') {
      this.complete(this.body);
    } else if (typeof this.body == 'function') {
      this.body(function(exports) {
        me.complete(exports);
      });
    }
  }
  Definition.prototype.complete = function(exports) {
    exports = exports || {};

    if (this.id) {
      this.exports = Module.exports[this.id] = exports;
    }

    Dependency.prototype.complete.call(this, exports);
  }

  function flattenDeps(deps) {
    var flat = [];

    for (var i=0, d; d = deps[i]; i++) {
      if (d instanceof Sequence) {
        flat = flat.concat(flattenDeps(d.deps));
      } else if (d instanceof Module) {
        flat.push(d);
      }
    }

    return flat;
  }

  function forceFetch() {
    for (var i=0, d; d = this.deps[i]; i++) {
      if (d.forceFetch) {
        d.forceFetch();
      } else {
        d.force = true;
        d.start();
      }
    }

    return this;
  }

  function Collection(deps) {
    this.deps = deps;
    if (this.deps.length == 0) {
      this.complete();
    }
  }
  Collection.prototype = new Dependency;
  Collection.prototype.fetch = function() {
    var me = this;

    function depComplete() {
      var results = [];

      for (var i=0, d; d = me.deps[i]; i++) {
        if (!d.completed) return;
        if (d.results.length > 0) {
          results = results.concat(d.results);
        }
      }

      me.complete.apply(me, results);
    }

    for (var i=0, d; d = this.deps[i]; i++) {
      d.then(depComplete);
    }

    return this;
  };
  Collection.prototype.forceFetch = forceFetch;
  Collection.prototype.as = function(cb) {
    var me = this;

    return this.then(function() {
      var flatDeps = flattenDeps(me.deps), obj = {};

      for (var i=0, d; d = flatDeps[i]; i++) {
        pushObjPath(obj, d.id, arguments[i]);
      }

      cb.apply(this, [obj].concat(makeArray(arguments)));
    });
  };

  function Sequence(deps) {
    this.deps = deps;
  }
  Sequence.prototype = new Dependency;
  Sequence.prototype.fetch = function() {
    var me = this, nextDep = 0, allResults = [];

    (function next() {
      var dep = me.deps[nextDep++];
      if (dep) {
        dep.then(function(results) {
          if (dep.results.length > 0) {
            allResults = allResults.concat(dep.results);
          }
          next();
        });
      } else {
        me.complete.apply(me, allResults);
      }
    }());

    return this;
  }
  Sequence.prototype.forceFetch = forceFetch;

  var definedBundles = [];
  function Manifest() {
    this.entries = {};
  }
  Manifest.prototype.push = function(bundle) {
    for (var file in bundle) {
      definedBundles[file] = new Bundle(file, bundle[file]);
      for (var i=0, alias; alias = bundle[file][i]; i++) {
        this.entries[alias] = definedBundles[file];
      }
    }
  }
  Manifest.prototype.get = function(key) {
    return this.entries[key];
  }


  function interactiveScript() {
    for (var i in scripts) {
      if (scripts[i].readyState == 'interactive') {
        return activeScripts[scripts[i].id];
      }
    }
  }

  function provide() {
    var args = makeArray(arguments), name, body;

    if (typeof args[0] == 'string') {
      name = args.shift();
    }

    body = args.shift();

    return new Definition(name, body);
  }

  function using() {
    var deps = makeArray(arguments), callback;

    if (typeof deps[deps.length-1] == 'function') {
      callback = deps.pop();
    }

    var combi = new Collection(mapDependencies(deps));

    if (callback) {
      combi.then(callback);
    }

    return combi;
  }

  function mapDependencies(deps) {
    var mapped = [];

    for (var i=0, dep; dep = deps[i]; i++) {
      if (typeof dep == 'string') {
        dep = createDependency(dep);
      }

      if (isArray(dep)) {
        dep = new Sequence(mapDependencies(dep));
      }

      mapped.push(dep);
    }

    return mapped;
  }

  function createDependency(id) {
    var m, dep;

    for (var i=0, matcher; matcher = using.matchers[i]; i++) {
      var regex = matcher[0], factory = matcher[1];
      if (m = id.match(regex)) {
        return factory(id);
      }
    }
    throw new Error(id + ' was not recognised by loader');
  }

  var loadrunner = function(f) {
    return f(using, provide, loadrunner);
  }

  function noConflict() {
    context.using = oldUsing;
    context.provide = oldProvide;
    context.loadrunner = oldLoadrunner;
    return loadrunner;
  }

  function debug(key) {
    var dep, log = {};

    function pushLog(dep, status) {
      log[status] = log[status] || {};
      log[status][key] = {
        key: key,
        start: dep.startTime,
        end: dep.endTime,
        duration: dep.endTime - (dep.startTime || (new Date).getTime()),
        status: status,
        origin: dep
      };
    }

    if (key && ((dep = metDependencies[key]) || (dep = inProgressDependencies[key]) ||
          (dep = pausedDependencies[key]))) {
      return {
        start: dep.startTime,
        end: dep.endTime,
        duration: dep.endTime - (dep.startTime || (new Date).getTime()),
        origin: dep
      };
    } else {
      for (var key in metDependencies) {
        pushLog(metDependencies[key], 'met');
      }

      for (var key in inProgressDependencies) {
        pushLog(inProgressDependencies[key], 'inProgress');
      }

      for (var key in pausedDependencies) {
        pushLog(pausedDependencies[key], 'paused');
      }

      return log;
    }
  }

  function reset() {
    pausedDependencies = {};
    metDependencies = {};
    inProgressDependencies = {};
    using.bundles = new Manifest;
    Module.exports = {};
    Definition.provided = {};
  }

  loadrunner.Script = Script;
  loadrunner.Module = Module;
  loadrunner.Collection = Collection;
  loadrunner.Sequence = Sequence;
  loadrunner.Definition = Definition;
  loadrunner.Dependency = Dependency;
  loadrunner.noConflict = noConflict;
  loadrunner.debug = debug;
  loadrunner.reset = reset;

  context.loadrunner = loadrunner;
  context.using   = using;
  context.provide = provide;

  using.path = '';

  using.bundles = new Manifest();

  // Append your bundle manifests to this array
  // using.bundles.push( { "bundlename" : ["modulename", "modulename2", "script"], "bundle2": ["script2"] });
  // Loadbuilder can generate your bundles and manifests
  function findBundle(id) {
    return using.bundles.get(id) || undefined;
  }

  using.matchers = [];
  using.matchers.add = function(regex, factory) {
    this.unshift([regex, factory]);
  }

  using.matchers.add(/^(lr!)?[a-zA-Z0-9_\/.-]+$/, function(id) {
    var mod = new Module(id.replace(/^lr!/, ''));
    return mod;
  });

  using.matchers.add(/(^script!|\.js$)/, function(path) {
    var script = new Script(path.replace(/^script!/, ''));
    return script;
  });

  if (scriptTag) {
    using.path = scriptTag.getAttribute('data-path') || scriptTag.src.split(/loadrunner\.js/)[0] || '';

    if (main = scriptTag.getAttribute('data-main')) {
      using.apply(context, main.split(/\s*,\s*/)).then(function() {});
    }
  }
}(this, document));
