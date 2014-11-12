'use strict';

var gulp = require('gulp');

gulp.task('watch', 'Watches for changes in JS files and triggers a rebuild', function () {
  gulp.watch(['src/*.js'], ['build']);
});
