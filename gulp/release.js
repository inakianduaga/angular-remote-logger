'use strict';

//Dependencies
var gulp = require('gulp'),
  $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'minimist']
  });
  $.fs = require('fs');

//Read CLI arguments & populate variables
var ARGV = $.minimist(process.argv),
  VERSION_TYPE = ARGV.version || 'minor';

/**
 * Reads the package.json file
 * `fs` is used instead of require to prevent caching in watch (require caches)
 * @returns {json}
 */
function getPackageJson() {
  return JSON.parse($.fs.readFileSync('./package.json', 'utf-8'));
}

gulp.task('checkoutMasterBranch', false, function() {

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

gulp.task('release', 'Bumps version, tags release using new version and pushes changes to git origin repo', ['bump'], function () {

  var pkg = getPackageJson();
  var v = 'v' + pkg.version;
  var message = 'Release ' + v;

  console.log(v);
  console.log(message);

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
