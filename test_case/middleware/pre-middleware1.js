'use strict';

module.exports = function(req, res, next) {
	res.append('x-pre-middleware1', 'middleware1');
	next();
};
