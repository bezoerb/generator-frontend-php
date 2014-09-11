'use strict';
var util = require('util');
var fs = require('fs.extra');
var path = require('path');
var yeoman = require('yeoman-generator');
var cheerio = require('cheerio');

var FrontendGenerator = module.exports = function FrontendGenerator(args, options, config) {
	yeoman.generators.Base.apply(this, arguments);

    this.domUpdate = function domUpdate(html, tagName, content, mode) {
        var $ = cheerio.load(html),
            container = tagName ? $(tagName) : $.root();


        if (content !== undefined) {
            if (mode === 'a') {
                container.append(content);
            } else if (mode === 'p') {
                container.prepend(content);
            } else if (mode === 'r') {
                container.html(content);
            } else if (mode === 'd') {
                container.remove();
            }
            return $.html();
        } else {
            console.error('Please supply valid content to be updated.');
        }
    };

    /**
     * Generate a ProcessHtml-handler block.
     * Needed for requirejs integration
     *
     * @param {String} blockType
     * @param {String} optimizedPath
     * @param {String} filesBlock
     * @param {String|Array} searchPath
     */
    this.generateRequireBlock = function generateBlock(blockType, optimizedPath, filesBlock, searchPath) {
        var blockStart;
        var blockEnd;
        var blockSearchPath = '';

        if (searchPath !== undefined) {
            if (util.isArray(searchPath)) {
                searchPath = '{' + searchPath.join(',') + '}';
            }
            blockSearchPath = '(' + searchPath +  ')';
        }

        blockStart = '\n        <!-- build:' + blockType + blockSearchPath + ' ' + optimizedPath + ' -->\n';
        blockEnd = '        <!-- /build -->\n';
        return blockStart + filesBlock + blockEnd;
    };

	/**
     * Append files
     * overwrite to add special requirejs block because usemin does not support requirejs anymore
     *
     * @param {String|Object} htmlOrOptions
     * @param {String} fileType
     * @param {String} optimizedPath
     * @param {Array}  sourceFileList
     * @param {Object} attrs
     * @param {String} searchPath
     */
	this.appendFiles = function appendFiles(htmlOrOptions, fileType, optimizedPath, sourceFileList, attrs, searchPath) {
		var blocks, updatedContent;
		var html = htmlOrOptions;
		var files = '';

		if (typeof htmlOrOptions === 'object') {
			html = htmlOrOptions.html;
			fileType = htmlOrOptions.fileType;
			optimizedPath = htmlOrOptions.optimizedPath;
			sourceFileList = htmlOrOptions.sourceFileList;
			attrs = htmlOrOptions.attrs;
			searchPath = htmlOrOptions.searchPath;
		}

		attrs = this.attributes(attrs);

        if (fileType === 'require') {
            sourceFileList.forEach(function (el) {
                files += '<script ' + attrs + ' src="' + el + '"></script>\n';
            });
            blocks = this.generateRequireBlock('js', optimizedPath, files, searchPath);
            updatedContent = this.append(html, '', blocks);
        } else if (fileType === 'js' && optimizedPath) {
			sourceFileList.forEach(function (el) {
				files += '<script ' + attrs + ' src="' + el + '"></script>\n';
			});
			blocks = this.generateBlock(fileType, optimizedPath, files, searchPath);
			updatedContent = this.append(html, '', blocks);
		} else if (fileType === 'js' && !optimizedPath) {
		sourceFileList.forEach(function (el) {
			files += '<script ' + attrs + ' src="' + el + '"></script>\n';
		});
		updatedContent = this.append(html, '', files);
		} else if (fileType === 'css') {
			sourceFileList.forEach(function (el) {
				files += '<link ' + attrs + ' rel="stylesheet" href="' + el  + '">\n';
			});
			blocks = this.generateBlock('css', optimizedPath, files, searchPath);
			updatedContent = this.append(html, '', blocks);
		}

		// cleanup trailing whitespace
		return updatedContent.replace(/[\t ]+$/gm, '');
	};

	this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), 'index.html'));
	this.headerFile = this.readFileAsString(path.join(this.sourceRoot(),'includes', 'head.php'));
	this.footerFile = this.readFileAsString(path.join(this.sourceRoot(),'includes', 'footer.php'));
	this.mainJsFile = '';

	this.skipInstall = options['skip-install'];


	this.on('end', function () {
		this.installDependencies({ skipInstall: options['skip-install'], callback: function(){
            // if using bootstrap, copy icon fonts from bower directory to app
            if (this.frameworkSelected === 'bootstrap' && !this.skipInstall) {
								var pkg = this.preprocessorSelected === 'sass' ? 'sass-bootstrap' : 'bootstrap',
                 		src = path.join(this.destinationRoot(),'app/bower_components/'+pkg+'/fonts'),
                    dest = path.join(this.destinationRoot(),'app/fonts');

                fs.copyRecursive(src,dest, function(){});
            }
		}.bind(this)});
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));

	this.config.save();
};

util.inherits(FrontendGenerator, yeoman.generators.Base);



FrontendGenerator.prototype.askFor = function askFor() {
	var cb = this.async();

	// have Yeoman greet the user.
	console.log(this.yeoman);
	console.log('Out of the box I include HTML5 Boilerplate, jQuery and Modernizr.');

	var prompts = [
		{
		    type: 'confirm',
		    name: 'php2htmlChoice',
		    message: 'Would you like to convert PHP files to static HTML?',
		    default: true
		},{
			type: 'list',
			name: 'frameworkChoice',
			message: 'Would you like to include a CSS framework?',
			choices: [
				{
					name: 'No Framework',
					value: 'noframework'
				},
				{
					name: 'Twitter Bootstrap',
					value: 'bootstrap'
				},
				{
					name: 'PureCSS',
					value: 'pure'
				},
				{
					name: 'Foundation',
					value: 'foundation'
				}
			]
		},
		{
			type: 'list',
			name: 'preprocessorChoice',
			message: 'Would you like to use a CSS preprocessor?',
			choices: [
				{
					name: 'No Preprocessor',
					value: 'nopreprocessor'
				},
				{
					name: 'Less',
					value: 'less'
				},
				{
					name: 'Sass',
					value: 'sass'
				}
			]
		},
		{
			type: 'list',
			name: 'loaderChoice',
			message: 'Which module loader would you like to use?',
			choices: [
				{
					name: 'RequireJS',
					value: 'requirejs',
					checked: true
				},
				{
					name: 'Browserify',
					value: 'browserify'
				}
			]
		},
		{
			type: 'checkbox',
			name: 'testChoice',
			message: 'Which test framework would you like to use?',
			choices: [
				{
					name: 'Mocha',
					value: 'mocha',
					checked: true
				},
				{
					name: 'Jasmine',
					value: 'jasmine'
				},
				{
					name: 'Qunit',
					value: 'qunit'
				},
				{
					name: 'DalekJS',
					value: 'dalek'
				}
			]
		}
	];

	function getChoice(props, key, def) {
		var choices = props[key] || [],
			result = def || null;

		for (var i = 0; i < prompts.length; i++) {
			var p = prompts[i];
			if (p.name === key && p.type === 'list') {
				for (var j = 0; j < p.choices.length; j++) {
					if (choices.indexOf(p.choices[j].value) !== -1) {
						return p.choices[j].value;
					}
				}
			}
		}
		return result;
	}

	this.prompt(prompts, function (props) {

		// manually deal with the response, get back and store the results.
		// we change a bit this way of doing to automatically do this in the self.prompt() method.
		this.moduleLoader = getChoice(props,'loaderChoice','requirejs');
		this.frameworkSelected = getChoice(props, 'frameworkChoice', 'noframework');
		this.preprocessorSelected = getChoice(props, 'preprocessorChoice', 'nopreprocessor');
		this.mochaTest = this.jasmineTest = this.qunitTest = this.dalekTest = false;
		for (var i in props.testChoice) {
			this[props.testChoice[i] + 'Test'] = true;
		}

		this.layoutChoice = props.layoutChoice;
		this.php2htmlChoice = props.php2htmlChoice;

		cb();
	}.bind(this));
};


// ----------------------------------------------------------------
// Layouts
// ----------------------------------------------------------------


// ----------------------------------------------------------------

FrontendGenerator.prototype.gruntfile = function gruntfile() {
	this.template('Gruntfile.js');
};

FrontendGenerator.prototype.packageJSON = function packageJSON() {
	this.template('_package.json', 'package.json');
};


FrontendGenerator.prototype.git = function git() {
	this.copy('gitignore', '.gitignore');
	this.copy('gitattributes', '.gitattributes');
};

FrontendGenerator.prototype.bower = function bower() {
	this.copy('bowerrc', '.bowerrc');
	this.copy('_bower.json', 'bower.json');
};

FrontendGenerator.prototype.prettifyconfig = function editorConfig() {

};

FrontendGenerator.prototype.h5bp = function h5bp() {
	this.copy('404.php', 'app/404.php');
	this.copy('robots.txt', 'app/robots.txt');
	this.copy('htaccess', 'app/.htaccess');
};

FrontendGenerator.prototype.projectfiles = function projectfiles() {
	this.copy('editorconfig', '.editorconfig');
	this.copy('jshintrc', '.jshintrc');
	this.copy('prettifyrc', '.prettifyrc');
};

FrontendGenerator.prototype.mainStylesheet = function mainStylesheet() {
	if(this.preprocessorSelected == 'sass') {
		this.copy('_main.scss', 'app/styles/main.scss');
	} else if (this.preprocessorSelected == 'less') {
		this.copy('_main.less', 'app/styles/main.less');
	} else {
		this.copy('main.css', 'app/styles/main.css');
	}

};


FrontendGenerator.prototype.addLayout = function gruntfile() {
  var layoutStr = "<!--yeoman-welcome-->";

  if(this.frameworkSelected) {
    console.log(this.frameworkSelected +' was chosen');

    // a framework was chosen
    if(this.frameworkSelected == 'bootstrap'){
      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/bootstrap/index.html'));

    }else if(this.frameworkSelected == 'pure'){
      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/pure/index.html'));

    } else if(this.frameworkSelected == 'foundation'){
      layoutStr = this.readFileAsString(path.join(this.sourceRoot(), 'layouts/foundation/index.html'));
    }
  }

  // Replace the page logic comment with the layoutString
  this.indexFile = this.indexFile.replace("<!--your page logic-->", layoutStr);
};

FrontendGenerator.prototype.browserify = function browserify() {
	if (this.moduleLoader !== 'browserify') {
		return;
	}
	this.copy('scripts/'+this.moduleLoader+'/app.'+this.frameworkSelected+'.js','app/scripts/app.js');
  this.footerFile = this.appendFiles(this.footerFile, 'js',undefined, ['scripts/main.js']);

  // Adds picturefill as separate script
  // should be integrated in browserify when https://github.com/scottjehl/picturefill/pull/252 is resolved
	this.footerFile = this.appendFiles(this.footerFile, 'js','scripts/vendor/picturefill.js', ['bower_components/picturefill/dist/picturefill.js']);
};

FrontendGenerator.prototype.requirejs = function requirejs() {
	if (this.moduleLoader !== 'requirejs') {
		return;
	}
	var requiredScripts = ['app', 'jquery','picturefill'];
	var inlineRequire = '';
	var logCmd = '';
	var templateLibraryPath;
	var templateLibraryShim;
	if(this.frameworkSelected == 'bootstrap') {
		requiredScripts.push('bootstrap');
		logCmd = '            log.debug(\' + Bootstrap \', \'3.0.0\');';
		templateLibraryPath = ',\n        bootstrap: \'../bower_components/bootstrap/dist/js/bootstrap\'\n    },';
		templateLibraryShim = '        bootstrap: {deps: [\'jquery\'], exports: \'jquery\'}';
	} else if(this.frameworkSelected == 'foundation') {
		requiredScripts.push('foundation/foundation');
		logCmd = '            log.debug(\'  + Foundation %s\', Foundation.version);';
		templateLibraryPath = ',\n        foundation: \'../bower_components/foundation/js/foundation\'\n    },';
		templateLibraryShim = [
			'        \'foundation/foundation\' : { deps: [\'jquery\'], exports: \'Foundation\' },',
			'        \'foundation/foundation.alerts\': { deps: [\'jquery\'], exports: \'Foundation.libs.alerts\' },',
			'        \'foundation/foundation.clearing\': { deps: [\'jquery\'], exports: \'Foundation.libs.clearing\' },',
			'        \'foundation/foundation.cookie\': { deps: [\'jquery\'], exports: \'Foundation.libs.cookie\' },',
			'        \'foundation/foundation.dropdown\': { deps: [\'jquery\'], exports: \'Foundation.libs.dropdown\' },',
			'        \'foundation/foundation.forms\': { deps: [\'jquery\'], exports: \'Foundation.libs.forms\' },',
			'        \'foundation/foundation.joyride\': { deps: [\'jquery\'], exports: \'Foundation.libs.joyride\' },',
			'        \'foundation/foundation.magellan\': { deps: [\'jquery\'], exports: \'Foundation.libs.magellan\' },',
			'        \'foundation/foundation.orbit\': { deps: [\'jquery\'], exports: \'Foundation.libs.orbit\' },',
			'        \'foundation/foundation.placeholder\': { deps: [\'jquery\'], exports: \'Foundation.libs.placeholder\' },',
			'        \'foundation/foundation.reveal\': { deps: [\'jquery\'], exports: \'Foundation.libs.reveal\' },',
			'        \'foundation/foundation.section\': { deps: [\'jquery\'], exports: \'Foundation.libs.section\' },',
			'        \'foundation/foundation.tooltips\': { deps: [\'jquery\'], exports: \'Foundation.libs.tooltips\' },',
			'        \'foundation/foundation.topbar\': { deps: [\'jquery\'], exports: \'Foundation.libs.topbar\' }'
		].join('\n');
	} else {
		templateLibraryShim = '';
		templateLibraryPath = '\n    },';
	}

	var requiredScriptsString = '[';
	for(var i = 0; i < requiredScripts.length; i++) {
		requiredScriptsString += '\''+requiredScripts[i]+'\'';
		if((i+1) < requiredScripts.length) {
			requiredScriptsString += ', ';
		}
	}
	requiredScriptsString += ']';

	this.footerFile = this.appendFiles(this.footerFile, 'require','scripts/main.js', ['scripts/config.js','bower_components/requirejs/require.js'], {
		'data-main': 'main'
	});

	// add a basic config file, rest wiull be done by grunt bower task
	this.write('app/scripts/config.js',[
		'/* jshint -W098,-W079 */',
		'var require = {',
		'    baseUrl: \'../bower_components\',',
		'    paths: {',
		'        main: \'../scripts/main\',',
		'        app: \'../scripts/app\',',
		'        component: \'../scripts/component\',',
		'        library: \'../scripts/library\',',
		'        jquery: \'jquery/dist/jquery\',',
		'        loglevel: \'loglevel/dist/loglevel.min\''+templateLibraryPath,
		'    shim: {',
		templateLibraryShim,
		'    },',
    '    packages: [',
    '        {',
    '            name: \'picturefill\',',
    '            main: \'dist/picturefill.js\',',
    '            location: \'picturefill\'',
    '        }',
    '    ]',
		'};'
	].join('\n'));

	// add a basic amd module
	this.write('app/scripts/app.js', [
		'/*global define'+((this.frameworkSelected === 'foundation')?', Foundation':'')+' */',
		'define(function (require) {',
		'    \'use strict\';\n',
		'    // load dependencies',
		'    var $ = require(\'jquery\'),',
		'        log = require(\'loglevel\'),',
		'        components = {},',
		'        self = {};\n',
		((this.frameworkSelected === 'foundation')?'    require(\'foundation/foundation\');\n':
		((this.frameworkSelected === 'bootstrap')?'    require(\'bootstrap\');\n':'')),
		'    components.dummy = require(\'component/dummy\');\n',
		'    // API methods',
		'    $.extend(self, {\n',
		'       /**',
		'        * App initialization',
		'	     */',
		'        init: function init() {',
		'            log.setLevel(0);',
		'            log.debug(\'Running jQuery %s\', $().jquery);',
		logCmd,
		'            log.debug(\'\');',
		'            log.debug(\'Initializing components ...\');\n',
		'            for (var key in components) {',
		'                try {',
		'                    components[key].init();',
		'                } catch (err) {',
		'                    log.debug(\'initialization failed for component \\\'\' + key + \'\\\'\');',
		'                    log.error(err);',
		'                }',
		'            }',
		'        }',
		'    });\n',
		'    return self;',
		'});'
	].join('\n'));



	this.mainJsFile = [
		'require(' + requiredScriptsString + ', function (app) {',
		'    \'use strict\';',
		'    // use app here',

		'    app.init();',
		'});'
	].join('\n');
};


FrontendGenerator.prototype.writeIndex = function writeIndex() {
	// prepare default content text
	var defaults = ['HTML5 Boilerplate'];

	var titleClass = '';

	if(this.frameworkSelected == 'pure') {
		titleClass = 'splash-head';
	}

	var contentText = [
		'                <h1 class="'+titleClass+'">\'Allo, \'Allo!</h1>',
		'                <p>You now have</p>',
		'                <ul>'
	];


	// append styles
	// with preprocessor sass bootstrap.scss or foundation.scss get included in main.scss file
	// with preprocessor less bootstrap.less gets included
	if(this.preprocessorSelected == 'sass' && this.frameworkSelected == 'foundation' ) {
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'styles/main.css'
		]);
		defaults.push('Foundation');
	} else if(this.preprocessorSelected == 'sass' && this.frameworkSelected == 'bootstrap') {
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'styles/main.css'
		]);
		defaults.push('Bootrstrap');
	} else if (this.preprocessorSelected == 'less' && this.frameworkSelected == 'bootstrap') {
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'styles/main.css'
		]);
		defaults.push('Bootrstrap');
	} else if(this.frameworkSelected == 'bootstrap') {
		// Add Twitter Bootstrap scripts
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'bower_components/bootstrap/dist/bootstrap.css','styles/main.css'
		]);
		defaults.push('Bootrstrap');
	} else if(this.frameworkSelected == 'pure') {
        this.copy('layouts/pure/stylesheets/marketing.css', 'app/styles/marketing.css');
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'styles/marketing.css','bower_components/pure/pure-min.css','styles/main.css'
		]);
		defaults.push('Pure CSS');
	} else if(this.frameworkSelected == 'foundation') {
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'bower_components/bower-foundation-css/foundation.min.css','styles/main.css'
		]);
		defaults.push('Foundation');
	} else {
		this.headerFile = this.appendStyles(this.headerFile, 'styles/main.css', [
			'styles/main.css'
		]);
	}

	defaults.push('RequireJS');


	// iterate over defaults and create content string
	defaults.forEach(function (el) {
		contentText.push('                    <li>' + el  +'</li>');
	});


	contentText = contentText.concat([
		'                </ul>',
		'                <p>installed.</p>',
		'                <h3>Enjoy coding!</h3>',
		''
	]);


	// append the default content
	contentText = contentText.join('\n');
	if(this.frameworkSelected == 'noframework') {
		contentText = '<div class="hero-unit">\n' + contentText+'</div>\n';
	}
	this.indexFile = this.indexFile.replace('<!--yeoman-welcome-->', contentText);
};


FrontendGenerator.prototype.addTests = function gruntfile() {
	this.mkdir('app/test');

	// jasmine testframework selected
	if (this.jasmineTest) {
		this.directory('test/'+this.moduleLoader+'/jasmine', 'app/test/jasmine');
	}

	// qunit testframework selected
	if (this.qunitTest) {
		this.directory('test/'+this.moduleLoader+'/qunit', 'app/test/qunit');
		this.copy('test/'+this.moduleLoader+'/qunit.html', 'app/test/qunit.html');
	}

	// mocha selected
	if (this.mochaTest) {
		this.directory('test/'+this.moduleLoader+'/mocha', 'app/test/mocha');
		this.copy('test/'+this.moduleLoader+'/mocha.html', 'app/test/mocha.html');
	}

	// dalek selected
	if (this.dalekTest) {
		this.directory('test/'+this.moduleLoader+'/dalek', 'app/test/dalek');
	}
};

FrontendGenerator.prototype.app = function app() {
	this.config.save();
	this.mkdir('app');
	this.mkdir('app/scripts');
	this.mkdir('app/scripts/component');
	this.copy('scripts/'+this.moduleLoader+'/dummy.js','app/scripts/component/dummy.js');
	this.mkdir('app/scripts/library');
	this.copy('scripts/'+this.moduleLoader+'/polyfills.js','app/scripts/library/polyfills.js');

	// bootstrap variable tweaking
	if (this.preprocessorSelected === 'less' && this.frameworkSelected === 'bootstrap') {
		this.copy('less/bootstrap.less','app/styles/bootstrap.less');
		this.copy('less/variables.less','app/styles/variables.less');
	}


	this.mkdir('app/images');
	this.write('app/index.php', this.indexFile);
	this.write('app/includes/head.php', this.headerFile);
	this.write('app/includes/footer.php', this.footerFile);
	this.write('app/scripts/main.js', this.mainJsFile);
};
