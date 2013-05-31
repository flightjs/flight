var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return (/_spec\.js$/.test(file));
});

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base',

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});

