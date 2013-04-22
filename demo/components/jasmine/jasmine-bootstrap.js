jasmine.BootstrapReporter = function(doc) {
  this.document = doc || document;
  this.suiteDivs = {};
  this.logRunningSpecs = false;
  var self = this;
  //automatically use the spec filter supplied by the reporter
  jasmine.getEnv().specFilter = function(){return self.specFilter.apply(self, arguments);};
};

jasmine.BootstrapReporter.prototype.createDom = function(type, attrs, childrenVarArgs) {
  var el = document.createElement(type);

  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];

    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else {
      if (child) { el.appendChild(child); }
    }
  }

  for (var attr in attrs) {
    if (attr == "className") {
      el[attr] = attrs[attr];
    } else {
      el.setAttribute(attr, attrs[attr]);
    }
  }

  return el;
};

jasmine.BootstrapReporter.prototype.reportRunnerStarting = function(runner) {
  var showPassed, showSkipped;
  this.checkPassed = !!this.getLocation().search.match("showPassed=true");
  this.checkSkipped = !!this.getLocation().search.match("showSkipped=true");

  this.outerDiv = this.createDom('div', { className: 'jasmine_reporter container' },
      this.createDom('h1', { className: 'banner well' },
        this.createDom('span', { className: 'logo' },
            this.createDom('span', { className: 'title' }, "Jasmine"),
            this.createDom('small', { className: 'version' }, runner.env.versionString())),
        this.createDom('span', { className: 'options' },
            this.createDom('label', {},
                showPassed = this.createDom('input', this.checkPassed ? { type: 'checkbox', checked: 'true' } : { type: 'checkbox' }),
                this.createDom('span', {}, " show passed ")),

            this.createDom('label', {},
                showSkipped = this.createDom('input', this.checkSkipped ? { type: 'checkbox', checked: 'true' } : { type: 'checkbox' }),
                this.createDom('span', {}, " show skipped"))
        )
      ),

      this.runnerDiv = this.createDom('div', { className: 'alert-message warning runner running' },
          this.createDom('a', { className: 'run_spec btn mini info', href: '?' }, "run all"),
          this.runnerMessageSpan = this.createDom('span', {}, "Running..."),
          this.finishedAtSpan = this.createDom('span', { className: 'finished-at' }, ""))
      );

  this.document.body.appendChild(this.outerDiv);

  var suites = runner.suites();
  for (var i = 0; i < suites.length; i++) {
    var suite = suites[i];
    var suiteDiv = this.createDom('div', { className: 'suite alert-message block-message' },
        this.createDom('a', { className: 'run_spec btn mini info', href: this.specHref(suite) }, "run"),
        this.createDom('a', { className: 'description', href: this.specHref(suite) }, suite.description));

    this.suiteDivs[suite.id] = suiteDiv;
    var parentDiv = this.outerDiv;
    if (suite.parentSuite) {
      parentDiv = this.suiteDivs[suite.parentSuite.id];
    }
    parentDiv.appendChild(suiteDiv);
  }

  this.startedAt = new Date();

  if (this.checkPassed) {
    this.outerDiv.className += ' show-passed';
  }
  if (this.checkSkipped) {
    this.outerDiv.className += ' show-skipped';
  }

  var self = this;
  showPassed.onclick = function(evt) {
    if (showPassed.checked) {
      window.location = window.location.href.replace(/#$/, '').replace(/\?$/, '') + (self.document.location.search.length ? "&showPassed=true" : "?showPassed=true");
    } else {
      window.location = window.location.href.replace(/&?showPassed=true|\?showPassed=true$/, '');
    }
  };

  showSkipped.onclick = function(evt) {
    if (showSkipped.checked) {
      window.location = window.location.href.replace(/#$/, '').replace(/\?$/, '') + (self.document.location.search.length ? "&showSkipped=true" : "?showSkipped=true");
    } else {
      window.location = window.location.href.replace(/&?showSkipped=true|\?showSkipped=true$/, '');
    }
  };
};

jasmine.BootstrapReporter.prototype.reportRunnerResults = function(runner) {
  var results = runner.results();
  var className = (results.failedCount > 0) ? "alert-message error runner failed" : "alert-message success runner passed";
  this.runnerDiv.setAttribute("class", className);
  //do it twice for IE
  this.runnerDiv.setAttribute("className", className);
  var specs = runner.specs();
  var specCount = 0;
  for (var i = 0; i < specs.length; i++) {
    if (this.specFilter(specs[i])) {
      specCount++;
    }
  }
  var message = "" + specCount + " spec" + (specCount == 1 ? "" : "s" ) + ", " + results.failedCount + " failure" + ((results.failedCount == 1) ? "" : "s");
  message += " in " + ((new Date().getTime() - this.startedAt.getTime()) / 1000) + "s";
  this.runnerMessageSpan.replaceChild(this.createDom('a', { className: 'description', href: '?'}, message), this.runnerMessageSpan.firstChild);

  this.finishedAtSpan.appendChild(document.createTextNode("Finished at " + new Date().toString()));
};

jasmine.BootstrapReporter.prototype.reportSuiteResults = function(suite) {
  var results = suite.results();
  var status = results.passed() ? 'passed success' : 'failed error';
  if (results.totalCount === 0) { // todo: change this to check results.skipped
    status = 'skipped info';
  }
  this.suiteDivs[suite.id].className += " " + status;
};

jasmine.BootstrapReporter.prototype.reportSpecStarting = function(spec) {
  if (this.logRunningSpecs) {
    this.log('>> Jasmine Running ' + spec.suite.description + ' ' + spec.description + '...');
  }
};

jasmine.BootstrapReporter.prototype.reportSpecResults = function(spec) {
  var results = spec.results();
  var status = results.passed() ? 'passed success' : 'failed error';
  if (results.skipped) {
    status = 'skipped info';
  }
  var specDiv = this.createDom('div', { className: 'spec alert-message '  + status },
      this.createDom('a', { className: 'run_spec btn mini info', href: this.specHref(spec) }, "run"),
      this.createDom('a', {
        className: 'description',
        href: this.specHref(spec),
        title: spec.getFullName()
      }, spec.description));


  var resultItems = results.getItems();
  var messagesDiv = this.createDom('div', { className: 'messages' });
  for (var i = 0; i < resultItems.length; i++) {
    var result = resultItems[i];

    if (result.type == 'log') {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage log'}, result.toString()));
    } else if (result.type == 'expect' && result.passed && !result.passed()) {
      messagesDiv.appendChild(this.createDom('div', {className: 'resultMessage fail'}, result.message));

      if (result.trace.stack) {
        messagesDiv.appendChild(this.createDom('pre', {className: 'stackTrace'}, result.trace.stack));
      }
    }
  }

  if (messagesDiv.childNodes.length > 0) {
    specDiv.appendChild(messagesDiv);
  }

  this.suiteDivs[spec.suite.id].appendChild(specDiv);
};

jasmine.BootstrapReporter.prototype.log = function() {
  var console = jasmine.getGlobal().console;
  if (console && console.log) {
    if (console.log.apply) {
      console.log.apply(console, arguments);
    } else {
      console.log(arguments); // ie fix: console.log.apply doesn't exist on ie
    }
  }
};

jasmine.BootstrapReporter.prototype.specHref = function(spec) {
  return '?spec=' + encodeURIComponent(spec.getFullName()) + (this.checkPassed ? '&showPassed=true': '') + (this.checkSkipped ? '&showSkipped=true' : '');
}

jasmine.BootstrapReporter.prototype.getLocation = function() {
  return this.document.location;
};

jasmine.BootstrapReporter.prototype.getParamMap = function() {
  var paramMap = {};
  var params = this.getLocation().search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var p = params[i].split('=');
    paramMap[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
  }
  return paramMap;
}

jasmine.BootstrapReporter.prototype.specFilter = function(spec) {
  var paramMap = this.getParamMap();

  if (!paramMap.spec) {
    return true;
  }
  return spec.getFullName().indexOf(paramMap.spec) === 0;
};