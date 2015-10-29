'use strict';

var path = require('path'),
	fs = require('fs'),
	os = require('os');

module.exports = function(req, res, next) {
	fs.writeFileSync(path.join(os.tmpdir(), 'swint-server/post-middleware2.txt'), 'test', 'utf-8');
	next();
};
