/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('assert');


describe('frontend-php generator', function () {
	beforeEach(function (done) {
		helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
			if (err) {
				return done(err);
			}

			this.app = helpers.createGenerator('frontend-php:app', [
				'../../app'
			]);
			done();
		}.bind(this));
	});

	it('creates expected files', function (done) {
		var expected = [
			// add files you expect to exist here.
			'.jshintrc',
			'.editorconfig',
			'.bowerrc',
			'bower.json',
			'Gruntfile.js',
			'package.json',
			'app/.htaccess',
			'app/index.php',
			'app/404.php',
			'app/robots.txt',
			'app/styles/main.css',
			'app/scripts/config.js',
			'app/scripts/app.js',
			'app/scripts/main.js',
			'app/scripts/component/dummy.js',
			'app/scripts/library/polyfills.js'
		];

		helpers.mockPrompt(this.app, {
			'someOption': true
		});
		this.app.options['skip-install'] = true;
		this.app.run({}, function () {
			assert.file(expected);
			done();
		});
	});
});
