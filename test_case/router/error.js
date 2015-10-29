'use strict';

exports.info = {
	url: '/error',
	method: 'get'
};

exports.preMiddleware = [];

exports.postMiddleware = [];

exports.main = function(req, res, next) {
	var foo = {};
	foo['bar']();
	next();
};
