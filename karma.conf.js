// Karma configuration file
//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54

module.exports = function (config) {
  'use strict';

  config.set({

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // Start these browsers
    // CLI --browsers Chrome, Firefox, Safari
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // list of files to exclude
    exclude: [],

    // list of files / patterns to load in the browser
    files: [
      // jquery dependency
      'node_modules/jquery/dist/jquery.js',
      // source library
      'index.js',
      'lib/**/*.js',
      // standalone build
      'build/flight.js',
      // specs
      'test/**/*_spec.js'
    ],

    frameworks: [
      'commonjs',
      'jasmine'
    ],

    preprocessors: {
      'index.js': ['commonjs'],
      'lib/**/*.js': ['commonjs'],
      'test/**/*.js': ['commonjs']
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: [process.env.TRAVIS ? 'dots' : 'progress'],

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: false
  });
};
