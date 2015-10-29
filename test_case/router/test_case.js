'use strict';

exports.info = {
	url: '/test_case',
	method: 'get'
};

exports.preMiddleware = [
	'pre-middleware3',
	[
		'pre-middleware4',
		{
			string: 'middlewareOptionString'
		}
	]
];

exports.postMiddleware = [
	'post-middleware2'
];

exports.main = function(req, res, next) {
	res.send('');
	next();
};
