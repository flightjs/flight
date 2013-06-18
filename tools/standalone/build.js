var builder = require('loadbuilder'),
    uglify  = require('uglify-js'),
    version = require('../../package.json').version,
    path    = require('path'),
    fs      = require('fs');

var rootPath           = path.join(__dirname, '..', '..'),
    shimPath           = path.join(__dirname, 'amd-shim.js'),
    bannerPath         = path.join(__dirname, 'banner.txt'),
    buildDir           = path.join(__dirname, '..', '..', 'build'),
    flightPath         = path.join(buildDir, 'flight.js'),
    flightPathMin      = path.join(buildDir, 'flight.min.js'),
    modulePlaceholder  = '{{ module }}',
    versionPlaceholder = '{{ version }}';

var flightSource = builder({
  docRoot: rootPath,
  path: '.'
}).include('lib/index').toSource();

var amdShim = fs.readFileSync(shimPath, 'utf8');
var banner = fs.readFileSync(bannerPath, 'utf8').split(versionPlaceholder).join(version);
var bundle = amdShim.split(modulePlaceholder).join(flightSource);
var bundleMin = uglify.minify(bundle, {fromString: true}).code;

// prepend the version / licence banner to the files
bundle = [banner, bundle].join('');
bundleMin = [banner, bundleMin].join('');

fs.writeFileSync(flightPath, bundle, 'utf8');
fs.writeFileSync(flightPathMin, bundleMin, 'utf8');
