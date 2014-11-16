'use strict';

//Dependencies
var gulp = require('gulp'),
  $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'minimist']
  });

//Read CLI arguments & populate variables
var ARGV = $.minimist(process.argv),
  VERSION_TYPE = ARGV.version || 'minor';


gulp.task('checkoutMasterBranch', false, function() {

  $.git.revParse({args:'--abbrev-ref HEAD'}, function(err, currentBranch) {

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


gulp.task('release', 'Bumps version, tags release using new version and pushes changes to git origin repo', ['bump'], function () {

  var pkg = require('../package.json');
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  gulp.src('./*')
    .pipe($.git.add())
    .pipe($.git.commit(message));

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
