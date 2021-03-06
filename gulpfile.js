var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  browserify = require('browserify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify');

gulp.task('default', function() {
  return gulp.watch(['./src/*.js', './gulpfile.js'], ['jshint', 'build']);
});

gulp.task('jshint', function() {
  return gulp.src('./src/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
});

gulp.task('build', function() {
  return browserify({
      entries: ['./src/index.js'],
      extensions: ['.js']
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('./dest'))
});
