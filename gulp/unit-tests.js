'use strict';

var gulp = require('gulp');
var karma = require('karma').server;
var $ = require('gulp-load-plugins')({
  pattern: ['wiredep', 'gulp-coveralls', 'gulp-notify', 'gulp-angular-filesort', 'minimist', 'browser-sync']
});

//Read CLI arguments & populate variables
var ARGV = $.minimist(process.argv),
  ENVIRONMENT = ARGV.environment || 'development',
  GENERATE_COVERAGE_REPORT = ARGV['generate-coverage-report'] && ARGV['generate-coverage-report'] !== 'false' && ARGV['generate-coverage-report'] !== '0',
  COVERAGE_FORMAT = ARGV['coverage-format'] ? ARGV['coverage-format'] : 'html';

/**
 * Cli options for the tests
 */
var cliTestOptions = {
  options : {
    'environment [development]' : 'The environment under which the tests are running [development|ci]. Use ci for continuous integration builds',
    'generate-coverage-report [false]' : 'Whether to generate code coverage report along with the tests [boolean]',
    'coverage-format [html]' : 'Code-coverage report format [html|lcov|lcovonly|text|text-summary|cobertura]'
  }
};

/**
 * Retrieve list of bower dependencies + application files + test files
 * We need to recover all our application js files and concatenate them with the bower dependencies and pass them to the
 * karma configuration
 */
function buildTestFilelist() {
  var bowerDeps = $.wiredep({
    directory: 'src/bower_components',
    dependencies: true,
    devDependencies: true
  });

  var testFiles = bowerDeps.js.concat([
    'test/unit/**/*.js',
    'src/*.js',
    'test/mocks/**/*.js', //put mocks last cause we mock app config
  ]);

  return testFiles;
}

/**
 * Whether the current environment is a continuous integration
 * @returns {boolean}
 */
function isEnvironmentContinuousIntegration() {
  return ENVIRONMENT === 'ci';
}

/**
 * Trigger notification indicating test results
 *
 * @param exitCode
 */
function notifyTestDone(exitCode) {

  var success = (exitCode === 0),
      notification = {
        title : success ? 'Unit test completed' : 'Unit test failed!!!',
        message : success ? 'Success' : 'Errors ocurred',
        icon : success ? __dirname + '/icons/pass.png' : __dirname + '/icons/fail.png'
      };

  if(!isEnvironmentContinuousIntegration()) {
    gulp.src('src').pipe($.notify(notification));
  } else {
    return exitCode;
  }

}

/**
 * Generates the standard karma config based on defaults + cli parameters
 *
 * @param overrideOptions
 * @returns {object}
 */
function buildKarmaConfig(overrideOptions)
{
  overrideOptions = overrideOptions || {};

  //Default options
  var options = {
    configFile: __dirname + '/../test/karma.conf.js',
    files : buildTestFilelist(),
    singleRun: true,
    reporters : ['progress']
  };

  //Code coverage configuration
  if(GENERATE_COVERAGE_REPORT) {

    options.preprocessors = {
      // source files, that you wanna generate coverage for
      // do not include tests or libraries
      // (these files will be instrumented by Istanbul)
      'src/*.js': ['coverage']
    };

    options.reporters.push('coverage');

    // optionally, configure the reporter
    options.coverageReporter = {
      type : COVERAGE_FORMAT,
      dir : 'coverage/'
    };
  }

  //Merge object & overrides
  for (var attrname in overrideOptions) {
    options[attrname] = overrideOptions[attrname];
  }

  return options;
}

/**
 * Show code coverage html in browser after it's been generated
 */
function launchCodeCoverageViewerAfterGenerated()
{
  if(GENERATE_COVERAGE_REPORT && COVERAGE_FORMAT === 'html' && !isEnvironmentContinuousIntegration()) {
    gulp.start('test-view-coverage-report');
  }
}

/**
* Run test once and exit
*/
gulp.task('test', 'Run the tests once and exit', function () {
  karma.start(buildKarmaConfig(), function(exitCode) {
    notifyTestDone(exitCode);
    launchCodeCoverageViewerAfterGenerated();
  });
}, cliTestOptions);

/**
* Watch for file changes and re-run tests on each change
*/
gulp.task('tdd', 'Watch for test file changes and re-run tests on each change', function () {
  gulp.watch( buildTestFilelist(), ['test']);
}, cliTestOptions);


// Static server to view coverage reports
gulp.task('test-view-coverage-report', null, function() {

  $.browserSync({
    server: {
      baseDir: './coverage/',
      index: 'index.html',
      directory: true
    }
  });
});


// Submit generated code coverage information to coveralls
gulp.task('coveralls', 'Submit generated code coverage information to coveralls', function() {

  GENERATE_COVERAGE_REPORT = true;
  COVERAGE_FORMAT = 'lcov';

  return karma.start(buildKarmaConfig(), function(exitCode) {

    gulp.src('coverage/**/lcov.info')
      .pipe($.coveralls());
  });

});



//Task to fix the karma-runner jasmine version
//We need this because we can't get working v0.3.0 of karma-jasmine, which has the newer version.
//Once that's fixed, we don't need this
gulp.task('fixKarmaRunnerJasmineVersion', null, function() {

  var del = require('del');
  var oldVersion = 'node_modules/karma-jasmine/lib/jasmine.js';
  var newVersion = 'node_modules/jasmine-core/lib/jasmine-core/jasmine.js';
  var destinationFolder = oldVersion.replace('jasmine.js','');

  //Delete old version and copy over new one
  del([oldVersion], function(){
    gulp.src(newVersion).pipe(gulp.dest(destinationFolder));
  });
});
