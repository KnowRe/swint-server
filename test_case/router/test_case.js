'use strict';

exports.info = {
	url: '/test_case',
	method: 'get'
};

exports.preMiddleware = [
	'pre-middleware3',
	{
		name: 'pre-middleware4',
		options: {
			string: 'middlewareOptionString'
		}
	}
];

exports.postMiddleware = [
	'post-middleware2'
];

exports.main = function(req, res, next) {
	res.send('');
	next();
};
