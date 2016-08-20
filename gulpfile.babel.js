/**
 * Created by david on 11/21/2015.
 *
 * define gulp build script
 */

import gulp from 'gulp';
import concate from 'gulp-concat';
// import debug from 'gulp-debug';
import filter from 'gulp-filter';
import flatten from 'gulp-flatten';
import mainBowerFiles from 'main-bower-files';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import sass from 'gulp-sass';

gulp.task('bower-files', () => {
  let angularFilter = filter(['**/angular*/*'], {restore: true});
  let eeFilter = filter(['**/epiceditor/**'], {restore: true});
  let mdlFilter = filter(['**/material-design-lite/*'], {restore: true});

  return gulp.src(mainBowerFiles({
    overrides: {
      "angular": {
        main: 'angular.min.js'
      },
      "angular-resource": {
        main: 'angular-resource.min.js'
      },
      "angular-route": {
        main: 'angular-route.min.js'
      },
      "epiceditor": {
        main: ['epiceditor/js/*.min.js', 'epiceditor/themes/**']
      }
    }
  }), {base: './bower_components'})
    .pipe(angularFilter)
    .pipe(flatten())
    .pipe(rename(path => (path.dirname += '/angular')))
    .pipe(replace(/\/\/# sourceMappingURL=.*/, ''))
    // .pipe(debug({title: 'angular'}))
    .pipe(angularFilter.restore)
    .pipe(eeFilter)
    .pipe(rename(path => path.dirname = path.dirname.replace(/^epiceditor/, '')))
    // .pipe(debug({title: 'ee'}))
    .pipe(eeFilter.restore)
    .pipe(mdlFilter)
    .pipe(rename(path => path.dirname = '/material'))
    .pipe(replace(/\/\/# sourceMappingURL=.*/, ''))
    .pipe(mdlFilter.restore)
    .pipe(gulp.dest('app/static/lib'));
});

gulp.task('copy-to-dist', () => {
  gulp.src(['app/**',
    '!app/blog/static/*/css', '!app/blog/static/*/css/*.sass',
    '!app/online_tools/static/css', '!app/online_tools/static/css/*.sass',
    '!app/blog/static/*/js', '!app/blog/static/*/js/*.js',
    '!app/lib/*.*-info', '!app/lib/*.*-info/**',
    '!app/lib/flask/{testsuite,testsuite/**}',
    '!app/lib/flask_restful/{testsuite,testsuite/**}',
    '!app/lib/werkzeug/{debug,debug/**}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('sass-blog', () => {
  "use strict";

  gulp.src(['app/blog/static/admin/css/*.sass',
    'app/blog/static/blog/css/*.sass'])
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concate('all.min.css'))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/blog/static/'));
});

gulp.task('sass-online-tools', () => {
  gulp.src('app/online_tools/static/css/*.sass')
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concate('all.min.css'))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/online_tools/static/'));
});

gulp.task('build-sass', ['sass-blog', 'sass-online-tools']);

let uglify_uv = (u, v = '') => () => {
  let path = `app/${u}/static/${v}`;

  return gulp.src(`${path}/js/*.js`)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(concate(`${(v || u)}.all.min.js`))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(`${path}/`));
};

gulp.task('uglify-admin', uglify_uv('blog', 'admin'));
gulp.task('uglify-blog', uglify_uv('blog', 'blog'));
gulp.task('uglify-shared', uglify_uv('blog', '_shared'));
gulp.task('uglify-online-tools', uglify_uv('online_tools'));

gulp.task('uglify-js', ['uglify-admin', 'uglify-blog', 'uglify-shared']);

gulp.task('build', ['build-sass', 'uglify-js', 'copy-to-dist']);

/*
 gulp.task('watch', function () {
 gulp.watch('app/static/!*.css', ['css-preprocessor']);
 });*/
