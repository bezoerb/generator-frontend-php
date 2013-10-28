# generator-frontend [![Build Status](https://secure.travis-ci.org/bezoerb/generator-frontend.png?branch=master)](https://travis-ci.org/bezoerb/generator-frontend)

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

### Yeoman Generators

Yeoman travels light. He didn't pack any generators when he moved in. You can think of a generator like a plug-in. You get to choose what type of application you wish to create, such as a Backbone application or even a Chrome extension.

To install generator-frontend-php from npm, run:

```
$ npm install -g generator-frontend-php
```

Finally, initiate the generator:

```
$ yo frontend-php
```

### What's inside
* Local Connect web-server
* Live reloading
* Compiling PHP templates to HTML
* Compiling Sass and Less
* RequireJS
* JS testing with Mocha, Qunit or Jasmine
* HTML5 Boilerplate
* Integration of PureCSS, Bootstrap or Foundation
* CSS and JS minification (`usemin`)


## License

[MIT License](bezoerb.mit-license.org)
