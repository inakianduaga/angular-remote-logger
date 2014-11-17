angular-remote-logger  
=====================

[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Code Climate][code-climate-image]][code-climate-url] [![Dependency Status][depstat-image]][depstat-url] [![Dev Dependency Status][depstat-dev-image]][depstat-dev-url] [![Bower version][bower-image]][bower-url]


> Angular Exception/XHR ($log todo) remote logger

# Installation

#### Bower

- Add `angular-remote-logger` as a bower dependency (with the desired version). 
- Reference `angular-remote-logger.min.js` file (or better use a bower script injector `main-bower-files` using grunt/gulp)  
 
#### Manually
 
Copy the file angular `dist/angular-remote-logger.min.js` into your project 

# Usage

Add module `angular-remote-logger` as a dependency to your app. For example:

```js
angular.module('myApp', ['angular-remote-logger', ...]);
```

This will:

- register an `httpInterceptor` to log all failed xhr requests
- register a decorator for the `$exceptionHandler` provider to log all app exceptions.

---

# Exception logger

> Log all application exceptions remotely, with a configurable throttle interval. 

#### Configuration

The parameters can be modified by changing the values of the constant `EXCEPTION_LOGGER_CONFIG`, as follows

```js
angular.module('angular-remote-logger')
  .config(
    function (EXCEPTION_LOGGER_CONFIG) {
      EXCEPTION_LOGGER_CONFIG.windowInSeconds = 5; //defines the window interval for the throttle checking
      EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow = 4; //how many exceptions per window are logged before throttling
      EXCEPTION_LOGGER_CONFIG.remoteLogUrl = 'exception/Logger/Config/Remote/Url'; //remote log endpoint
    }
  );
```

---

# Http Xhr error logger

> Log all non-200 xhr responses remotely

#### Configuration

The parameters can be modified by changing the values of the constant `XHR_LOGGER_CONFIG`, as follows

```js
angular.module('angular-remote-logger')
  .config(
    function (XHR_LOGGER_CONFIG) {
      XHR_LOGGER_CONFIG.remoteLogUrl = 'xhr/Logger/Config/Remote/Url'; //remote log endpoint
    }
  );
```

---

# Contributing

#### Setup Environment
1. Install `node.js`, `npm` for package management
1. Install `bower` globally.
1. Run `npm install`, `bower install` to install the build/app dependencies

#### Tasks
 
- Run `gulp` from the root installation folder to retrieve a list of the available tasks 

[travis-url]: https://travis-ci.org/inakianduaga/angular-remote-logger
[travis-image]: https://travis-ci.org/inakianduaga/angular-remote-logger.svg?branch=master

[coveralls-url]: https://coveralls.io/r/inakianduaga/angular-remote-logger
[coveralls-image]: https://coveralls.io/repos/inakianduaga/angular-remote-logger/badge.png

[code-climate-url]: https://codeclimate.com/github/inakianduaga/angular-remote-logger
[code-climate-image]: https://codeclimate.com/github/inakianduaga/angular-remote-logger/badges/gpa.svg

[depstat-url]: https://david-dm.org/inakianduaga/angular-remote-logger
[depstat-image]: https://david-dm.org/inakianduaga/angular-remote-logger.png?theme=shields.io

[depstat-dev-url]: https://david-dm.org/inakianduaga/angular-remote-logger#info=devDependencies&view=table
[depstat-dev-image]: https://david-dm.org/inakianduaga/angular-remote-logger/dev-status.svg?theme=shields.io

[bower-url]: http://badge.fury.io/bo/angular-remote-logger
[bower-image]: https://badge.fury.io/bo/angular-remote-logger.svg
