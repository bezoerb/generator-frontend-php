'use strict';

var LIVERELOAD_PORT = 35729,
    lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT}),
    gateway = require('gateway'),
    path = require('path'),<% if (moduleLoader === 'browserify') { %>
    remapify = require('remapify'),<% } %>
    mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };


module.exports = function (grunt) {

    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    <% if (jasmineTest) { %>
    require('load-grunt-tasks')(grunt, {pattern: ['grunt-*', '!grunt-template-jasmine-requirejs']});<% } else { %>
    require('load-grunt-tasks')(grunt);<% } %>

    // configurable paths
    var yeomanConfig = {
        app: 'app',
        dist: 'dist'
    };


    grunt.initConfig({
        yeoman: yeomanConfig,
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%%= yeoman.dist %>/*',
                        '!<%%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'<% if (moduleLoader === 'browserify') { %>,
            test: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%%= yeoman.app %>/test/**/*-build.js'
                    ]
                }]
            }
            <% } %>
        },
        watch: {
            javascript: {
                files: ['<%%= yeoman.app %>/scripts/**/*.js'],
                tasks: ['jshint']
            },<% if (preprocessorSelected === 'less') { %>
            less: {
                files: ['<%%= yeoman.app %>/styles/{,*/}*.less'],
                tasks: ['less']
            },<% } else if (preprocessorSelected === 'sass') { %>
            sass: {
                files: ['<%%= yeoman.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass']
            },<% } %>
            bower: {
                files: ['<%%= yeoman.app %>/bower_components/**/*.js'],
                tasks: ['bower']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%%= yeoman.app %>/{,*/}*.html',
                    '<%%= yeoman.app %>/{,*/}*.php',
                    '{.tmp,<%%= yeoman.app %>}/scripts/{,*/}*.js',
                    '{.tmp,<%%= yeoman.app %>}/styles/{,*/}*.css',
                    '<%%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        /**
         * Compiling sources
         */
        <% if (preprocessorSelected === 'sass') { %>
        sass: {
            all: {
                options: {
                    sourceMap: true
                },
                files: {
                    '.tmp/styles/main.css': '<%%= yeoman.app %>/styles/main.scss'
                }
            }
        },<% } else if (preprocessorSelected === 'less') { %>
        less: {
            options: {
                paths: ['<%%= yeoman.app %>/styles'],
                optimization: 0
            },
            all: {
                files: [
                    {expand: true, cwd:  '<%%= yeoman.app %>/styles', src: ['*.less'], dest: '.tmp/styles', ext: '.css'}
                ]
            }
        },<% } %>
        uncss: {
            options: {
                verbose:true,
                ignore: [/dropdown-menu/,/\.collapsing/,/\.collapse/] // ignore css selectors for async content with complete selector or regexp
            },
            main: {
                files: {
                    '.tmp/uncss/styles/main.css': ['.tmp/index.html']
                }
            }
        },
        autoprefixer: {
            dist: {
                options: {
                    // Target-specific options go here.
                },
                expand: true,
                flatten: true,
                src: '.tmp/uncss/styles/*.css',
                dest: '.tmp/autoprefixer/styles/'
            }
        },
        cssmin: {
            dist: {
                expand: true,
                cwd: '<%%= autoprefixer.dist.dest %>',
                src: ['*.css'],
                dest: '<%%= yeoman.dist %>/styles/'
            }
        },
        php2html: {
            all: {
                options: {
                    // relative links should be renamed from .php to .html
                    processLinks: true,
                    htmlhint: true,
                    docroot: '<%%= yeoman.app %>'
                },
                files: [
                    {expand: true, cwd: yeomanConfig.app, src: ['**/*.php','!includes/**/*.php','!bower_components/**/*.php'], dest: '.tmp', ext: '.html' }
                ]
            }
        },



        /**
         * Testing Tools
         */
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%%= yeoman.app %>/scripts/**/*.js',
                '!<%%= yeoman.app %>/scripts/config.js',
                // no tests on external code, won't make you happy
                '!<%%= yeoman.app %>/scripts/vendor/**/*.js'
            ]
        },<% if (qunitTest) { %>
        qunit: {
            all: {
                options: {
                    // Pipe output console.log from your JS to grunt. False by default.
                    log: true,
                    urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/test/qunit.html']
                }
            }
        },<% } if (mochaTest && moduleLoader === 'requirejs') { %>
        mocha: {
            all: {
                options: {
                    log: true,
                    // Select a Mocha reporter
                    // http://visionmedia.github.com/mocha/#reporters
                    // Pipe output console.log from your JS to grunt. False by default.
                    reporter: 'Spec',
                    urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/test/mocha.html']
                }
            }
        },<% } else if (mochaTest && moduleLoader === 'browserify') { %>
        mocha: {
            all: {
                options: {
                    reporter: 'Spec',
                    // URLs passed through as options
                    urls: ['http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/test/mocha.html'],
                    // Indicates whether 'mocha.run()' should be executed in
                    // 'bridge.js'
                    run: true,
                    log: true,
                    // mocha options
                    mocha: {
                        ignoreLeaks: false
                    }
                }
            }
        },<% } if (jasmineTest && moduleLoader === 'requirejs') { %>
        jasmine: {
            all: {
                options: {
                    specs: '<%%= yeoman.app %>/test/jasmine/spec/*Spec.js',
                    host: 'http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/',
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: '<%%= yeoman.app %>/scripts/config.js',
                        requireConfig: {
                            baseUrl: '<%%= yeoman.app %>/bower_components'
                        }
                    }
                }
            }
        },<% } else if (jasmineTest && moduleLoader === 'browserify') { %>
        jasmine: {
            all: {
                options: {
                    specs: '<%%= yeoman.app %>/test/jasmine/specs-build.js',
                    host: 'http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>/'
                }
            }
        },<% } if (dalekTest) { %>
        dalek: {
            options: {
                // invoke phantomjs, chrome & chrome canary
                browser: ['phantomjs'],
                // generate an console & an jUnit report
                reporter: ['console', 'junit'],
                // don't load config from an Dalekfile
                dalekfile: false,
                // specify advanced options (that else would be in your Dalekfile)
                advanced: {
                    // is not supported in dalekjs 0.0.8
                    <% if (moduleLoader === 'requirejs') { %>baseUrl: 'http://<%%= connect.testPhp.options.hostname %>:<%%= connect.testPhp.options.port %>'
                    <% } else if (moduleLoader === 'browserify') { %>baseUrl: 'http://<%%= connect.test.options.hostname %>:<%%= connect.test.options.port %>'<% } %>
                }
            },
            dist: {
                src: ['app/test/dalek/test-page.js']

            }
        },<% } %>

        /**
         * Scripts
         */<% if (moduleLoader === 'requirejs') { %>
        bower: {
            options: {
                baseUrl: '<%%= yeoman.app %>/bower_components',
                exclude: [
                    'almond',
                    'requirejs',<% if (qunitTest) { %>
                    'qunit',<% } if (mochaTest) { %>
                    'mocha',
                    'chai',<% } if (jasmineTest) { %>
                    'jasmine',<% } %>
                    'modernizr'
                ]
            },
            all: {
                rjsConfig: '<%%= yeoman.app %>/scripts/config.js'
            }
        },
        requirejs: {
            all: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl                 : '<%%= yeoman.app %>/bower_components',
                    name                    : 'almond/almond',
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
        },<% } else if (moduleLoader === 'browserify') { %>
        browserify: {
            options: {
                bundleOptions: {
                    standalone: 'main'
                },
                preBundleCB: function (b) {
                    b.plugin(remapify, [
                        {
                            src: './**/*.js',
                            expose: 'component',
                            cwd: __dirname + '/' + yeomanConfig.app + '/scripts/component'
                        },
                        {
                            src: './**/*.js',
                            expose: 'library',
                            cwd: __dirname + '/' + yeomanConfig.app + '/scripts/library'
                        }
                    ]);
                },
                transform: ['debowerify', 'deglobalify', 'deamdify']
            },
            dist: {
                src: '<%%= yeoman.app %>/scripts/app.js',
                dest: '.tmp/browserify/main.js'
            },
            dev: {
                src: '<%%= yeoman.app %>/scripts/app.js',
                dest: '.tmp/scripts/main.js',
                options: {
                    watch: true,
                    bundleOptions: {
                        standalone: 'main',
                        debug: true
                    }
                }
            }<% if (jasmineTest) { %>,
            jasmine: {
                src: '<%%= yeoman.app %>/test/jasmine/specs.js',
                dest: '<%%= yeoman.app %>/test/jasmine/specs-build.js'
            }<% } %><% if (qunitTest) { %>,
            qunit: {
                src: '<%%= yeoman.app %>/test/qunit/specs.js',
                dest: '<%%= yeoman.app %>/test/qunit/specs-build.js'
            }<% } %><% if (mochaTest) { %>,
            mocha: {
                src: '<%%= yeoman.app %>/test/mocha/specs.js',
                dest: '<%%= yeoman.app %>/test/mocha/specs-build.js'
            }<% } %>
        },

        uglify: {
            dist: {
                files: {
                    '<%%= yeoman.dist %>/scripts/main.js': ['<%%= browserify.dist.dest %>']
                }
            }
        },<% } %>
        modernizr: {
            dist: {
                // [REQUIRED] Path to the build you're using for development.
                'devFile': '.tmp/concat/scripts/vendor/modernizr.js',

                // [REQUIRED] Path to save out the built file.
                'outputFile': '.tmp/concat/scripts/vendor/modernizr.js',

                // Based on default settings on http://modernizr.com/download/
                'extra': {
                    'shiv': true,
                    'printshiv': false,
                    'load': true,
                    'mq': false,
                    'cssclasses': true
                },

                // Based on default settings on http://modernizr.com/download/
                'extensibility': {
                    'addtest': false,
                    'prefixed': false,
                    'teststyles': false,
                    'testprops': false,
                    'testallprops': false,
                    'hasevents': false,
                    'prefixes': false,
                    'domprefixes': false
                },

                // By default, source is uglified before saving
                'uglify': true,

                // Define any tests you want to implicitly include.
                'tests': [],

                // By default, this task will crawl your project for references to Modernizr tests.
                // Set to false to disable.
                'parseFiles': true,

                // When parseFiles = true, this task will crawl all *.js, *.css, *.scss files, except files that are in node_modules/.
                // You can override this by defining a 'files' array below.
                'files': {src: ['<%%= requirejs.all.options.out %>', '.tmp/uncss/**/*.css'] },

                // When parseFiles = true, matchCommunityTests = true will attempt to
                // match user-contributed tests.
                'matchCommunityTests': false,

                // Have custom Modernizr tests? Add paths to their location here.
                'customTests': []
            }
        },

        /**
         * Performance optimization
         */
        processhtml: {
            dist: {
                files: [<% if (php2htmlChoice === true) { %>
                    {expand: true, cwd: '.tmp', src: ['**/*.html', '!bower_components/**/*.html'], dest: '.tmp'}<% } else { %>
                    {expand: true, cwd: yeomanConfig.app, src: ['**/*.php', '!bower_components/**/*.php'], dest: '.tmp'}<% } %>
                ]
            }
        },
        useminPrepare: {
            options: {
                dest: '<%%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: { 'js': ['concat', 'uglifyjs'], 'css': []},
                        post: {}
                    }
                }
            },<% if (php2htmlChoice === true) { %>
            html: ['.tmp/**/*.html', '!.tmp/includes/**/*.html', '!bower_components/**/*.html']<% } else { %>
            html: ['.tmp/**/*.php', '!bower_components/**/*.php']<% } %>
        },
        usemin: {
            options: {
                dirs: ['<%%= yeoman.dist %>'],
                assetsDirs: ['<%%= yeoman.dist %>']
            },<% if (php2htmlChoice === true) { %>
            html: ['<%%= yeoman.dist %>/**/*.html'],<% } else { %>
            html: ['<%%= yeoman.dist %>/**/*.php'],<% } %>
            css: ['<%%= yeoman.dist %>/styles/{,*/}*.css']
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%%= yeoman.dist %>/images'
                }]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%%= yeoman.dist %>',
                        src: '**/*.html',
                        dest: '<%%= yeoman.dist %>'
                    }
                ]
            }
        },
        prettify: {
            options: {
                prettifyrc: '.prettifyrc'
            },
            all: {
                expand: true,
                cwd: '<%%= yeoman.dist %>',
                ext: <% if (php2htmlChoice === true) { %>'.html'<% } else { %>'.php'<% } %>,
                src: [<% if (php2htmlChoice === true) { %>'**/*.html'<% } else { %>'**/*.php'<% } %>],
                dest: '<%%= yeoman.dist %>'
            }
        },

        /**
         * File based Cache busting
         */
        rev: {
            dist: {
                files: {
                    src: [
                        '<%%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },

        /**
         * Copy && Concurrent
         */
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%%= yeoman.app %>',
                    dest: '<%%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%%= yeoman.dist %>/images',
                    src: [
                        'generated/*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp',
                    dest: '<%%= yeoman.dist %>',
                    src: [
                        <% if (php2htmlChoice === true) { %>'**/*.html'<% } else { %>'**/*.php'<% } %>
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/concat/styles',
                    dest: '<%%= yeoman.dist %>/styles',
                    src: [
                        '{,*/}*.css'
                    ]
                }<% if (frameworkSelected === 'bootstrap') { %>, {
                    expand: true,
                    cwd: '<%%= yeoman.app %>/fonts',
                    dest: '<%%= yeoman.dist %>/fonts',
                    src: [
                        '*.*'
                    ]
                }<% } %>]
            },
            prepare: {
                expand: true,
                cwd: '<%%= yeoman.app %>',
                dest: '.tmp/',
                src: [
                    'styles/**/*.{css,js}',
                    'bower_components/**/*.{css,js}'
                ]
            }
        },
        concurrent: {
            server: [<% if (preprocessorSelected === 'sass') { %>
                'sass'<% } else if (preprocessorSelected === 'less') { %>
                'less'<% } %>
            ],
            test: [<% if (preprocessorSelected === 'sass') { %>
                'sass'<% } else if (preprocessorSelected === 'less') { %>
                'less'<% } %>
            ],
            dist: [<% if (preprocessorSelected === 'sass') { %>
                'sass',<% } else if (preprocessorSelected === 'less') { %>
                'less',<% } %>
                'imagemin',
                'svgmin'
            ]
        },

        /**
         * Server
         */
        open: {
            app: {
                path: 'http://<%%= connect.options.hostname %>:<%%= connect.options.port %>/index.php'
            },
            dist: {<% if (php2htmlChoice === true) { %>
                path: 'http://<%%= connect.options.hostname %>:<%%= connect.options.port %>/index.html'<% } else { %>
                path: 'http://<%%= connect.options.hostname %>:<%%= connect.options.port %>/index.php'<% } %>
            }
        },
        connect: {
            options: {
                port: 9000,
                // change this to '0.0.0.0' to access the server from outside
                hostname: '127.0.0.1'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            gateway(__dirname + path.sep + yeomanConfig.app, {
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
                    hostname: '127.0.0.1',
                    port: 9999,
                    middleware: function (connect) {
                        return [<% if (moduleLoader === 'browserify') { %>
                            lrSnippet,
                            gateway(__dirname + path.sep + yeomanConfig.app, {
                                '.php': 'php-cgi'
                            }),<% } %>
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)<% if (jasmineTest) { %>,
                            mountFolder(connect, '.')<% } %>
                        ];
                    }
                }
            },<% if (dalekTest && moduleLoader === 'requirejs') { %>
            // mocha has problems with gateway, so keep this one separate
            testPhp: {
                options: {
                    hostname: '127.0.0.1',
                    port: 9998,
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            gateway(__dirname + path.sep + yeomanConfig.app, {
                                '.php': 'php-cgi'
                            }),
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.app)<% if (jasmineTest) { %>,
                            mountFolder(connect, '.')<% } %>
                        ];
                    }
                }
            },<% } %>
            dist: {
                options: {
                    middleware: function (connect) {
                        return [<% if (php2htmlChoice === false) { %>
                            gateway(__dirname + path.sep + yeomanConfig.dist, {
                                '.php': 'php-cgi'
                            }),<% } %>
                            mountFolder(connect, yeomanConfig.dist)
                        ];
                    }
                }
            }
        },

        /**
         * Documentation
         */
        plato: {
            options : {
                jshint : grunt.file.readJSON('.jshintrc')
            },
            all: {
                'src': ['Gruntfile.js','<%%= yeoman.app %>/scripts/**/*.js','test/spec/**/*.js'],
                'dest': 'docs/complexity'
            }
        }
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('This task is deprecated. Use `grunt serve` instead.');

        if (target === 'dist') {
            grunt.task.run(['serve:dist']);
        } else {
            grunt.task.run(['serve']);
        }

    });


    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:dist', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'connect:livereload',<% if (moduleLoader === 'browserify') { %>
            'browserify:dev',<% } %>
            'open:app',
            'watch'
        ]);
    });


<% if (moduleLoader === 'requirejs') { %>
    grunt.registerTask('test',  function () {
        grunt.task.run(['jshint:all']);
<% if (mochaTest || jasmineTest || qunitTest || dalekTest) { %>
        // testserver
        grunt.task.run(['clean:server', 'connect:test']);

<% } %>
<% if (mochaTest) { %>
        // mocha
        grunt.task.run(['mocha']);
<% } if (jasmineTest) { %>
        // jasmine
        grunt.task.run(['jasmine']);
<% } if (qunitTest) { %>
        // qunit
        grunt.task.run(['qunit']);
<% } if (dalekTest) { %>
        // testserver php
        grunt.task.run(['clean:server', 'connect:testPhp']);
        // dalekjs
        grunt.task.run(['dalek']);
<% } %>
    });
<% } else if (moduleLoader === 'browserify') { %>
    grunt.registerTask('test',  function () {
        grunt.task.run(['jshint:all']);
<% if (mochaTest || jasmineTest || qunitTest || dalekTest) { %>
        // testserver
        grunt.task.run(['connect:test']);
<% } %>
<% if (mochaTest) { %>
        // mocha
        grunt.task.run(['browserify:mocha','mocha']);
<% } if (jasmineTest) { %>
        // jasmine
        grunt.task.run(['browserify:jasmine','jasmine']);
<% } if (qunitTest) { %>
        // qunit
        grunt.task.run(['browserify:qunit','qunit']);
<% } if (dalekTest) { %>
        // dalekjs
        grunt.task.run(['dalek']);
<% } if (mochaTest || jasmineTest || qunitTest || dalekTest) { %>

        grunt.task.run(['clean:test']);
<% } %>
    });
<% } %>

    grunt.registerTask('build', [
        'clean:dist',<% if (moduleLoader === 'requirejs') { %>
        'bower',<% } %>
		    'test',
        'php2html',
        'copy:prepare',
        'processhtml',
        'useminPrepare',
        'concurrent:dist',
        'uncss',
        'autoprefixer',
        'concat',<% if (moduleLoader === 'requirejs') { %>
        'requirejs',<% } else if (moduleLoader === 'browserify') { %>
        'browserify:dist',
        'uglify:dist',<% } %>
        'modernizr',
        'uglify',
        'copy:dist',
        'uglify',
        'cssmin:dist',
        'rev',
        'usemin',
        'prettify'<% if (php2htmlChoice === true) { %>,
        'htmlmin'<% } %>
    ]);

    grunt.registerTask('default', [<% if (moduleLoader === 'requirejs') { %>
        'bower',<% } %>
        'test',
        'server'
    ]);
};
