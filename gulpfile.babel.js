/**
 * Created by david on 11/21/2015.
 *
 * define gulp build script
 */

import gulp from 'gulp';
import minifycss from 'gulp-minify-css';
import concate from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import uglifyjs from 'gulp-uglify';
import replace from 'gulp-replace';

gulp.task('copy-to-dist', () => {
  gulp.src(['app/**',
      '!app/blog/static/*/css', '!app/blog/static/*/css/*.css',
      '!app/blog/static/*/js', '!app/blog/static/*/js/*.js',
      '!app/lib/flask/{testsuite,testsuite/**}',
      '!app/lib/werkzeug/{debug,debug/**}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('css-preprocessor-blog', () => {
  gulp.src('app/blog/static/*/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('all.min.css'))
    .pipe(minifycss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/blog/static/'));
});

gulp.task('css-preprocessor-online-tools', () => {
  gulp.src('app/online_tools/static/css/*.css')
    .pipe(concate('styles.all.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('app/online_tools/static/'));
});

gulp.task('css-preprocessor', ['css-preprocessor-blog', 'css-preprocessor-online-tools']);

var uglifyjs_uv = (u, v = '') =>  () => {
  var path = `app/${u}/static/${v}`;

  return gulp.src(`${path}/js/*.js`)
    .pipe(concate(`${(v || u)}.all.min.js`))
    .pipe(uglifyjs())
    .pipe(gulp.dest(`${path}/`));
};

gulp.task('uglifyjs-admin', uglifyjs_uv('blog', 'admin'));
gulp.task('uglifyjs-blog', uglifyjs_uv('blog', 'blog'));
gulp.task('uglifyjs-shared', uglifyjs_uv('blog', '_shared'));
gulp.task('uglifyjs-online-tools', uglifyjs_uv('online_tools'));

gulp.task('uglifyjs', ['uglifyjs-admin', 'uglifyjs-blog', 'uglifyjs-shared']);

gulp.task('disable-debug-flag', () => {
  gulp.src('app/blog/__init__.py')
    .pipe(replace('debug_flag = False', 'debug_flag = True'))
    .pipe(gulp.dest('dist/blog/'));
});

gulp.task('build', ['css-preprocessor', 'uglifyjs', 'copy-to-dist', 'disable-debug-flag']);

/*
 gulp.task('watch', function () {
 gulp.watch('app/static/!*.css', ['css-preprocessor']);
 });*/
