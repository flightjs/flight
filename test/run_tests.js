// Flight Test runner
// Loads the tests (as modules) with Loadrunner.
// Loadrunner won't start executing until all modules validly export, so no additional
// sanity check is needed.
var jasmineStarted;
var jasmineErrored;

function startJasmine() {
  if (!jasmineStarted) {

    afterEach(function(){
      using('lib/component', function(component){
        component.teardownAll()
      });
    });

    jasmine.getEnv().addReporter(new jasmine.BootstrapReporter());
    jasmine.getEnv().execute();
    jasmineStarted = true;
  }
}

function runTests(tests) {

  if (window.location.search.length > 1) {
    // this allows you to pass the module name in the querystring.  Used by the documentation HTML.
    // example: test.html?module=app/ui/design
    if (location.search.match('module=')) {
      var moduleId = location.getParameter('module');
      var testFile = 'test/' + moduleId + '_spec';
      tests = [testFile];
    }
  };

  using.apply(this, tests).then(startJasmine);
}


window.onerror = function(errorMsg, url, lineNumber) {
  if (errorMsg == 'setting a property that has only a getter') {
    //Selenium's plugin for Firefox 3.6 throws this error
    return;
  }

  //don't add more describes for additional cascading errors,
  //otherwise the suite that's already in progress will never end
  if (jasmineErrored) {
    return;
  } else {
    jasmineErrored = true; // :(
  }

  describe('JavaScript console error', function(){
    var urlString = url ? url : "unknown";
    it("was thrown in url '"+ urlString + "' at line '" + lineNumber + "'", function() {
      this.fail(new Error(errorMsg + " (Try looking in the console for more specific debug info; the stack trace below is not super helpful.)"));
    });
  });

  startJasmine();
}
