'use strict';

var swintHelper = require('swint-helper'),
	defaultize = swintHelper.defaultize,
	swintMiddleware = require('swint-middleware'),
	swintRouter = require('swint-router'),
	swintQuery = require('swint-query'),
	express = require('express'),
	sprintf = require('sprintf').sprintf,
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	os = require('os'),
	path = require('path');

module.exports = function(options, callback) {
	var that = this;

	defaultize({
		mode: 'local',
		http: {
			port: 8080,
			mode: 'disabled', // 'disabled', 'enabled', 'redirect'
			http2: false,
			validHost: ['localhost']
		},
		https: {
			port: 8443,
			mode: 'disabled', // 'disabled', 'enabled', 'redirect'
			http2: false,
			validHost: ['localhost'],
			certs: {
				key: fs.readFileSync(path.join(__dirname, '../test_certs/localhost.key'), 'utf-8'),
				cert: fs.readFileSync(path.join(__dirname, '../test_certs/localhost.crt'), 'utf-8'),
				ca: []
			}
		},
		exceptDir: path.join(__dirname, 'exception'),
		autorun: true,
		router: {},
		orm: {},
		middleware: {
			loader: [],
			pre: [],
			post: []
		}
	}, options);

	var addresses = this._getIPAddress();
	options.http.validHost = options.http.validHost.concat(addresses);
	options.https.validHost = options.https.validHost.concat(addresses);

	this.options = options;
	this.router = new swintRouter(this.options.router);
	this.orm = new swintQuery.Manager(this.options.orm, function(err) {
		if(err) {
			print(4, err);
			process.exit(-1);
			return;
		}
		that._start(callback);
	});

};

var _ = module.exports.prototype;

_._start = function(callback) {
	this.app = express();

	this.setORM();
	this.validateProtocol();
	this.validateHost();
	this.loadMiddlewares();
	this.setPreMiddlewares();
	this.setApp();
	this.setException();
	this.setPostMiddlewares();
	this.setLastMiddleware();
	if(this.options.autorun) {
		this.run();
	}
	callback(null, true);
};

_.setORM = function() {
	this.app.set('orm', this.orm);
	if(this.orm.hasOwnProperty('models')) {
		this.app.set('models', this.orm.models);
	}
};

_.validateProtocol = function() {
	var that = this;

	if(this.options.http.mode === 'redirect') {
		this.app.all('*', function(req, res, next) {
			if(req.protocol === 'http') {
				res.redirect(sprintf('https://%s:%d/%s', req.hostname, that.options.https.port, req.url));
			} else {
				next();
			}
		});
	}

	if(this.options.https.mode === 'redirect') {
		this.app.all('*', function(req, res, next) {
			if(req.protocol === 'https') {
				res.redirect(sprintf('http://%s:%d/%s', req.hostname, that.options.http.port, req.url));
			} else {
				next();
			}
		});
	}
};

_.validateHost = function() {
	var that = this;

	this.app.get('*', function(req, res, next) {
		if(that.options[req.protocol].validHost.indexOf(req.hostname) === -1) {
			res.redirect(sprintf('%s://%s:%d/%s', req.protocol, that.options[req.protocol].validHost[0], that.options[req.protocol].port, req.url));
		} else {
			next();
		}
	});
};

_.loadMiddlewares = function() {
	var middlewares = this.options.middleware.loader.map(function(l) {
		return swintMiddleware.loader(l);
	});

	this.loadedMiddlewares = {};

	for(var i = 0; i < middlewares.length; i++) {
		for(var key in middlewares[i]) {
			this.loadedMiddlewares[key] = middlewares[i][key];
		}
	}
};

_.setPreMiddlewares = function() {
	var that = this;

	this.options.middleware.pre.forEach(function(m) {
		if(typeof m === 'object') {
			that.app.use(that.loadedMiddlewares[m.name](m.options));
		} else {
			that.app.use(that.loadedMiddlewares[m]);
		}
	});
};

_.setApp = function() {
	this.router.load(this.loadedMiddlewares);
	this.app.use(this.router.expRouter);
};

_.setException = function() {
	var that = this;

	this.app.all('*', function(req, res, next) {
		if(req.not404 === undefined) {
			res.status(404);
			if(req.accepts('html')) {
				res.type('html').sendFile(path.join(that.options.exceptDir, '404.html'));
			} else if(req.accepts('json')) {
				res.type('json').sendFile(path.join(that.options.exceptDir, '404.json'));
			} else {
				res.type('text').send('Swint - 404 Not found');
			}
		}
		next();
	});

	this.app.use(function(err, req, res, next) {
		print(4, err.stack);
		res.status(500);
		if(req.accepts('html')) {
			res.type('html').sendFile(path.join(that.options.exceptDir, '500.html'));
		} else if(req.accepts('json')) {
			res.type('json').sendFile(path.join(that.options.exceptDir, '500.json'));
		} else {
			res.type('text').send('Swint - 500 Internal server error');
		}
		next();
	});
};

_.setPostMiddlewares = function() {
	var that = this;

	this.options.middleware.post.forEach(function(m) {
		if(typeof m === 'object') {
			that.app.use(that.loadedMiddlewares[m.name](m.options));
		} else {
			that.app.use(that.loadedMiddlewares[m]);
		}
	});
};

_.setLastMiddleware = function() {
	this.app.use(function() { });
};

_.run = function() {
	if(this.options.http.mode !== 'disabled') {
		this.httpServer = http.createServer(this.app);
		this.httpServer.listen(this.options.http.port);
		print(2, sprintf('HTTP server listening on port %s', this.options.http.port));
	}

	if(this.options.https.mode !== 'disabled') {
		this.httpsServer = https.createServer(this.options.https.certs, this.app);
		this.httpsServer.listen(this.options.https.port);
		print(2, sprintf('HTTPS server listening on port %s', this.options.https.port));
	}
};

_._getIPAddress = function() {
	var interfaces = os.networkInterfaces(),
		addresses = [];

	for(var k in interfaces) {
		for(var k2 in interfaces[k]) {
			var address = interfaces[k][k2];
			if(address.family === 'IPv4' && !address.internal) {
				addresses.push(address.address);
			}
		}
	}

	return addresses;
};
