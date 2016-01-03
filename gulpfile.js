/**
 * Created by david on 11/21/2015.
 *
 * define gulp build script
 */

var gulp = require('gulp'),
  minifycss = require('gulp-minify-css'),
  concate = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  uglifyjs = require('gulp-uglify');

gulp.task('copy-to-dist', function () {
  return gulp.src(['app/**',
      '!app/blog/static/*/css', '!app/blog/static/*/css/*.css',
      '!app/blog/static/*/js', '!app/blog/static/*/js/*.js',
      '!app/lib/flask/{testsuite,testsuite/**}',
      '!app/lib/werkzeug/{debug,debug/**}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('css-preprocessor-blog', function () {
  return gulp.src('app/blog/static/*/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('all.min.css'))
    .pipe(minifycss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/blog/static/'));
});

gulp.task('css-preprocessor-online-tools', function () {
  return gulp.src('app/online_tools/static/css/*.css')
    .pipe(concate('styles.all.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('app/online_tools/static/'));
});

gulp.task('css-preprocessor', ['css-preprocessor-blog', 'css-preprocessor-online-tools']);

var uglifyjs_u = function (u, v) {
  return function () {
    var path = 'app/' + u + '/static/' + v;

    return gulp.src(path + '/js/*.js')
      .pipe(concate((v ? v : u) + '.all.min.js'))
      .pipe(uglifyjs())
      .pipe(gulp.dest(path + '/'));
  };
};

gulp.task('uglifyjs-admin', uglifyjs_u('blog', 'admin'));
gulp.task('uglifyjs-blog', uglifyjs_u('blog', 'blog'));
gulp.task('uglifyjs-shared', uglifyjs_u('blog', '_shared'));
gulp.task('uglifyjs-online-tools', uglifyjs_u('online_tools', ''));

gulp.task('uglifyjs', ['uglifyjs-admin', 'uglifyjs-blog', 'uglifyjs-shared']);

/*
 gulp.task('watch', function () {
 gulp.watch('app/static/!*.css', ['css-preprocessor']);
 });*/

gulp.task('build', ['css-preprocessor', 'uglifyjs', 'copy-to-dist']);
