'use strict';

module.exports = function(options) {
	return function(req, res, next) {
		res.append('x-pre-middleware4', options.string);
		next();
	};
};
