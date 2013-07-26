// Karma configuration file
//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54


// base path, that will be used to resolve files and exclude
basePath = '';

// list of files / patterns to load in the browser
files = [
  // loaded without require
  'bower_components/es5-shim/es5-shim.js',
  'bower_components/es5-shim/es5-sham.js',

  // frameworks
  JASMINE,
  JASMINE_ADAPTER,
  REQUIRE,
  REQUIRE_ADAPTER,

  // loaded without require
  'bower_components/jquery/jquery.js',
  'build/flight.js',

  // loaded with require
  {pattern: 'lib/**/*.js', included: false},
  {pattern: 'test/spec/**/*_spec.js', included: false},

  'test/test-main.js'
];

// use dots reporter, as travis terminal does not support escaping sequences
// possible values: 'dots', 'progress', 'junit', 'teamcity'
// CLI --reporters progress
reporters = [
  'dots'
];

// enable / disable watching file and executing tests whenever any file changes
// CLI --auto-watch --no-auto-watch
autoWatch = true;

// start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
// CLI --browsers Chrome,Firefox,Safari
browsers = [
  'Chrome',
  'Firefox'
];

// auto run tests on start (when browsers are captured) and exit
// CLI --single-run --no-single-run
singleRun = false;
