var builder = require('loadbuilder'),
	path    = require('path'),
	fs      = require('fs');

var rootPath    = path.join(__dirname, '..', '..'),
	shimPath    = path.join(__dirname, 'amd-shim.min.js'),
	builtPath   = path.join(__dirname, '..', '..', 'build', 'flight.js'),
	placeholder = '{{ module }}';

var flightSource = builder({
	docRoot: rootPath,
	path: '.'
}).include('lib/index').minify().toSource();

var amdShim = fs.readFileSync(shimPath, 'utf8');

fs.writeFileSync(builtPath, amdShim.split(placeholder).join(flightSource), 'utf8');
