var gulp = require('gulp'),
  jshint = require('gulp-jshint');

gulp.task('default', function() {
  gulp.watch(['src/*.js', 'gulpfile.js'], ['jshint']);
});

gulp.task('jshint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
});
