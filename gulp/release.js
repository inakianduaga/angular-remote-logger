'use strict';

//Dependencies
var gulp = require('gulp'),
  $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'minimist']
  });
  $.fs = require('fs');
  $.environment = require('./lib/environment.js');
  $.changelog = require('conventional-changelog');

//CLI parameters
var VERSION_TYPE = $.environment.get('version', 'minor');
$.environment.set('environment', 'production'); //set environment to production

/**
 * Reads the package.json file
 * `fs` is used instead of require to prevent caching in watch (require caches)
 * @returns {json}
 */
function getPackageJson() {
  return JSON.parse($.fs.readFileSync('./package.json', 'utf-8'));
}

gulp.task('checkoutMasterBranch', false, ['build'], function() {

  return $.git.revParse({args:'--abbrev-ref HEAD'}, function(err, currentBranch) {

    if(currentBranch !== 'master') {
      $.git.checkout('master', function(err){
        $.util.log(err);
      });
    }

  });

});

gulp.task('bump', false, ['checkoutMasterBranch'], function() {

  return gulp.src(['./package.json', './bower.json'])
    .pipe($.bump({ type: VERSION_TYPE}))
    .pipe(gulp.dest('./'));

});

gulp.task('commit', false, ['bump'], function() {

  var pkg = getPackageJson();
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  return gulp.src('./')
    .pipe($.git.add())
    .pipe($.git.commit(message));

});

gulp.task('release', 'Bumps version, tags release using new version and pushes changes to git origin repo', ['commit'], function () {

  var pkg = getPackageJson();
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  $.git.tag(v, message, function(err){
    if (err) throw err;
  });
  $.git.push('origin', 'master', '--tags', function(err){
    if (err) throw err;
  });

}, {
  options: {
    'version [minor]': 'The semantic version type for this release [patch|minor|major]. See http://semver.org/ for information.'
  }
});


gulp.task('changelog', 'Generates a changelog from the last tagged release until now', function() {
  var pkg = getPackageJson();

  $.changelog({
    repository: 'https://github.com/inakianduaga/angular-remote-logger',
    version: pkg.version,
    file : 'CHANGELOG.md'
  }, function(err, log) {
    console.log('Here is your changelog!', log);
  });
});
