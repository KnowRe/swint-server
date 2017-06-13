# swint-server

[![Greenkeeper badge](https://badges.greenkeeper.io/Knowre-Dev/swint-server.svg)](https://greenkeeper.io/)
Swint web server based on expressJS

**Warning: This is not the final draft yet, so do not use this until its official version is launched**

## Installation
```sh
$ npm install --save swint-server
```

## Usage
```javascript
var server = new swintServer({
	http: {
		mode: 'redirect'
	},
	https: {
		mode: 'enabled'
	},
	middleware: {
		loader: [{
			dir: path.join(__dirname, '../test_case/test_middleware')
		}],
		pre: [
			'pre-middleware1', // for the middlewares don't need options or want to run with default ones
			{
				name: 'pre-middleware2', // for the middlewares need options
				options: {
					string: 'middlewareOptionString'
				}
			}
		],
		post: [
			'post-middleware'
		]
	},
	static: [
		{
			url: 'static',
			path: path.join(__dirname, 'static')
		}
	]
}, function() {
	done();
});
```
