'use strict';

module.exports = function(config) {

  config.set({
    basePath : '..',

    files : [ //generated dynamically by gulp task
    ],

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'coverage'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [], // generated dynamically by gulp task

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },

    // configure the  code coverage reporter
    coverageReporter: { // generated automatically by gulp task
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    autoWatch : false,

    frameworks: ['jasmine', 'angular-filesort'],

    //Add automatic angular filesorting before running the tests
    angularFilesort: {
      whitelist: [
        'src/app/**/*.js',
        'src/components/**/*.js'
      ]
    },

    plugins : [
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-growl-reporter',
        'karma-coverage',
        'karma-angular-filesort',
        //'karma-chrome-launcher',
        //'karma-firefox-launcher',
    ],

    browsers : ['PhantomJS']
  });

};
