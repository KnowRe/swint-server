'use strict';

module.exports = function(req, res, next) {
	res.append('x-pre-middleware3', 'middleware3');
	next();
};
