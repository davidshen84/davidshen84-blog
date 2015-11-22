/**
 * Created by david on 11/21/2015.
 */

var gulp = require('gulp'),
  minifycss = require('gulp-minify-css'),
  concate = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
  return gulp.src('app/static/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('all.min.css'))
    .pipe(minifycss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('dist'));
  /*
   return gulp.src(['app/!**',
   '!app/lib/{*.egg-info,*.egg-info/!**}',
   '!app/lib/{*.dist-info,*.dist-info/!**}',
   '!app/lib/flask/{testsuite,testsuite/!**}',
   '!app/lib/werkzeug/{debug,debug/!**}'])
   .pipe(gulp.dest('dist'));
   */
});

gulp.task('css-preprocessor', function () {
  return gulp.src('app/static/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('all.min.css'))
    .pipe(minifycss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/static/'));
});

gulp.task('watch', function () {
  return gulp.watch('app/static/*.css', ['css-preprocessor']);
});