# generator-frontend-php [![Build Status](https://secure.travis-ci.org/bezoerb/generator-frontend-php.png?branch=master)](https://travis-ci.org/bezoerb/generator-frontend-php)

A generator for [Yeoman](http://yeoman.io).


## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```
$ npm install -g yo
```

### PHP Frontend Generator

Generate static html files using php with the power of that nice gentleman.

* Local Connect web-server
* Live reloading
* HTML5 Boilerplate
* Integration of PureCSS, Bootstrap or Foundation
* Compiling PHP templates to HTML
* Compiling Sass and Less
* RequireJS
* JS testing with Mocha, Qunit or Jasmine
* CSS and JS minification
* Strip unused CSS with grunt-uncss
* Image optimization
* HTML and JS linting


To install generator-frontend-php from npm, run:

```
$ npm install -g generator-frontend-php
```

To make this work you need the `php-cgi` binaray in your PATH.

Finally, initiate the generator:

```
$ yo frontend-php
```

Make shure you have php-cgi installed and in your Path

## License

[MIT License](bezoerb.mit-license.org)
