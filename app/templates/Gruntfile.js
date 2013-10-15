'use strict';

var LIVERELOAD_PORT = 35729,
	lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT}),
	gateway = require('gateway'),
	mountFolder = function (connect, dir) {
		return connect.static(require('path').resolve(dir));
	};


module.exports = function (grunt) {

	// show elapsed time at the end
	require('time-grunt')(grunt);
	// load all grunt tasks
	require('load-grunt-tasks')(grunt);


	// configurable paths
	var yeomanConfig = {
		app: 'app',
		dist: 'dist'
	};


	grunt.initConfig({
		yeoman: yeomanConfig,
		watch: {
			bower: {
				files: ['<%%= yeoman.app %>/scripts/vendor/**/*.js'],
				tasks: ['bower']
			},
			javascript: {
				files: [
					'<%%= yeoman.app %>/scripts/**/*.js',
					'!<%%= yeoman.app %>/scripts/vendor'
				],
				tasks: ['jshint']
			},
			//styles: {
			//	files: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
			//	tasks: ['copy:styles', 'autoprefixer']
			//},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%%= yeoman.app %>/{,*/}*.html',
					'<%%= yeoman.app %>/{,*/}*.php',
					'<%%= yeoman.app %>/scripts/src/{,*/}*.js',
					'<%%= yeoman.app %>/styles/{,*/}*.{css,less,scss,sass}',
					'<%%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		},

		php2html: {
			all: {
				options: {
					// relative links should be renamed from .php to .html
					processLinks: true
				},
				files: [
					{expand: true, cwd: yeomanConfig.app, src: ['**/*.php'], dest: yeomanConfig.dist, ext: '.html' }
				]
			}
		},

		clean: {
			server: '.tmp',
			dist: ['<%%= yeoman.dist %>/scripts/main.js','<%%= yeoman.dist %>/scripts/main.js.map'],
			bower: ['<%%= yeoman.app %>/scripts/vendor/*']
		},

		// Testing Tools
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: [
				'Gruntfile.js',
				'<%%= yeoman.app %>/scripts/**/*.js',
				'!<%%= yeoman.app %>/scripts/config.js',
				// no tests on external code,
				// won't make you happy
				'!<%%= yeoman.app %>/scripts/vendor/**/*.js'
				//     'test/{,*/}*.js'
			]
		},<% if (testFramework === 'qunit') { %>
		qunit: {
			all: {
				options: {
					// Pipe output console.log from your JS to grunt. False by default.
					log: true,
					urls: ['http://localhost:<%%= connect.options.port %>/test/qunit.html']
				}
			}
		},<% } else if (testFramework === 'mocha') { %>
		mocha: {
			all: {
				options: {
					log: true,
					// Select a Mocha reporter
					// http://visionmedia.github.com/mocha/#reporters
					// Pipe output console.log from your JS to grunt. False by default.
					reporter: 'Spec',
					urls: ['http://localhost:<%%= connect.options.port %>/test/mocha.html']
				}
			}
		},<% } else if (testFramework === 'jasmine') { %>

		jasmine: {
			all: {
				options: {
					specs: '<%%= yeoman.app %>/test/jasmine/spec/*Spec.js',
					host: 'http://localhost:<%%= connect.options.port %>/',
					template: require('grunt-template-jasmine-requirejs'),
					templateOptions: {
						requireConfigFile: '<%%= yeoman.app %>/scripts/config.js',
						requireConfig: {
							baseUrl: '<%%= yeoman.app %>/scripts/'
						}
					}
				}
			}
		},<% } %><% if (includeRequireJS) { %>
		requirejs: {
			all: {
				// Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
				options: {
					baseUrl                 : '<%%= yeoman.app %>/scripts',
					name                    : 'vendor/requirejs/require',
					include                 : 'main',
					out                     : '<%%= yeoman.dist %>/scripts/main.js',
					mainConfigFile          : '<%%= yeoman.app %>/scripts/config.js',
					preserveLicenseComments : false,
					useStrict               : true,
					wrap                    : true,
					optimize                : 'uglify2',
					generateSourceMaps      : true,
					useSourceUrl            : true
				}
			}
		},
		bower: {
			options: {
				exclude: [
					'modernizr',<% if (testFramework === 'qunit') { %>
					'qunit',<% } else if (testFramework === 'mocha') { %>
					'mocha',
					'chai',<% } else if (testFramework === 'jasmine') { %>
					'jasmine'<% } %>
				]
			},
			all: {
				rjsConfig: '<%%= yeoman.app %>/scripts/config.js'
			}
		},<% } %>
		open: {
			server: {
				path: 'http://localhost:<%%= connect.options.port %>'
			}
		},
		connect: {
			options: {
				port: 9000,
				// change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [
							lrSnippet,
							gateway(__dirname + '/' + yeomanConfig.app, {
								'.php': 'php-cgi'
							}),
							mountFolder(connect, '.tmp'),
							mountFolder(connect, yeomanConfig.app)
						];
					}
				}
			},
			test: {
				options: {
					middleware: function (connect) {
						return [
							gateway(__dirname + '/' + yeomanConfig.app, {
								'.php': 'php-cgi'
							}),
							mountFolder(connect, '.tmp'),
							mountFolder(connect, 'test')
						];
					}
				}
			},

			dist: {
				options: {
					middleware: function (connect) {
						return [
							mountFolder(connect, yeomanConfig.dist)
						];
					}
				}
			}
		}
	});

	grunt.registerTask('server', function (target) {
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			'connect:livereload',
			'open',
			'watch'
		]);
	});



	grunt.registerTask('test',  function () {
		grunt.task.run(['jshint:all']);
<% if (testFramework === 'mocha' || testFramework === 'jasmine' || testFramework === 'qunit') { %>
		// testserver
		grunt.task.run(['clean:server', 'connect:test']);
<% } %>
<% if (testFramework === 'mocha') { %>
		// mocha
		grunt.task.run(['mocha']);
<% } else if (testFramework === 'jasmine') { %>
		// jasmine
		grunt.task.run(['jasmine']);
<% } else if (testFramework === 'qunit') { %>
		// qunit
		grunt.task.run(['qunit']);
<% } %>
	});

	grunt.registerTask('build', [
		'bower',
		'requirejs'
	]);

	grunt.registerTask('default', [
		'test',
		'build'
	]);
};


