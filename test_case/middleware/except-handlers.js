'use strict';

module.exports = function(err, req, res, next) {
	print('except-handlers',err.message);
	if(err.message === 'message503'){
		res.status(503);
		res.type('text').send('503 except-handlers test');
		return;
	}
	next(err);
};
