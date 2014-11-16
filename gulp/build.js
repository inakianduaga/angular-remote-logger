'use strict';

//Dependencies
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')({
      pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'lazypipe', 'minimist', 'del']
    }),
    pkg = require('../package.json');

//Read CLI arguments & populate variables
var ARGV = $.minimist(process.argv),
    ENVIRONMENT = ARGV.environment || 'development',
    DATE = new Date().toISOString(),
    IS_PRODUCTION = (ENVIRONMENT === 'production');


// Tasks //

gulp.task('scripts', false, function () {

  var buildFilename = IS_PRODUCTION ? pkg.name + '.min.js' : pkg.name + '.js';

  var lintJs = $.lazypipe()
    .pipe(function() { return $.jshint(); })
    .pipe(function() { return $.jshint.reporter('jshint-stylish'); })

  var minifyJs = $.lazypipe()
    .pipe(function() { return $.ngAnnotate(); })
    .pipe(function() { return $.uglify(); })

  return gulp.src('src/*.js')
    .pipe($.angularFilesort())
    .pipe(lintJs())
    .pipe($.if(IS_PRODUCTION, minifyJs()))
    .pipe($.concat(buildFilename))
    .pipe(gulp.dest('dist'))
    .pipe($.size());

});

gulp.task('clean', false, function () {
  return $.del(['dist']);
});

gulp.task('build', 'Build the application, accepts environment parameter', ['clean','scripts'], function() {

  //Notified of build
  gulp.src('src') //Dummy stream so we can trigger notification
    .pipe($.notify({
    title : 'Build completed',
    subtitle: 'success',
    message : '',
    icon : __dirname + '/icons/pass.png'
  }));

}, {
  options : {
    'environment [development]' : 'Environment under which we build the application [development|production]'
  }
});
