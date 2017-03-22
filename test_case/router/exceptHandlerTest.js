'use strict';

exports.info = {
	url: '/exceptHandlerTest/:statusCode',
	method: 'get'
};

exports.preMiddleware = [];

exports.postMiddleware = [];

exports.main = function(req, res, next) {
	print('exceptHandlerTest');
	next(new Error('message'+req.params.statusCode));
};
