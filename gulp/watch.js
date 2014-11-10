'use strict';

var gulp = require('gulp');

gulp.task('watch', 'Watches for changes in JS/Jade/Less files and triggers a rebuild', function () {
  gulp.watch(['src/{app,components}/**/*.jade', 'src/{app,components}/**/*.js', 'src/{app,components}/**/*.less' ], ['build']);
});
