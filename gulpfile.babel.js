/**
 * Created by david on 11/21/2015.
 *
 * define gulp build script
 */

import concate from 'gulp-concat';
//import debug from 'gulp-debug';
import filter from 'gulp-filter';
import flatten from 'gulp-flatten';
import gulp from 'gulp';
import mainBowerFiles from 'main-bower-files';
import minifycss from 'gulp-minify-css';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';


gulp.task('bower-files', () => {
  var angularFilter = filter(['**/angular*/*.js'], {restore: true}),
    eeFilter = filter(['**/epiceditor/**'], {restore: true}),
    mdlFilter = filter(['**/material-design-lite/**'], {restore: true});

  return gulp.src(mainBowerFiles({
    overrides: {
      angular: {
        main: 'angular.min.js'
      },
      "angular-resource": {
        main: 'angular-resource.min.js'
      },
      "angular-route": {
        main: 'angular-route.min.js'
      },
      epiceditor: {
        main: ['epiceditor/js/*.min.js', 'epiceditor/themes/**']
      }
    }
  }), {base: './bower_components'})
    .pipe(angularFilter)
    .pipe(flatten())
    .pipe(rename(path => path.dirname += '/angular'))
    //.pipe(debug({title: 'angular'}))
    .pipe(angularFilter.restore)
    .pipe(eeFilter)
    .pipe(rename(path => path.dirname = path.dirname.replace(/^epiceditor/, '')))
    //.pipe(debug({title: 'ee'}))
    .pipe(eeFilter.restore)
    .pipe(mdlFilter)
    .pipe(rename(path => path.dirname = '/material'))
    .pipe(mdlFilter.restore)
    .pipe(gulp.dest('app/static/lib'));
});

gulp.task('copy-to-dist', () => {
  gulp.src(['app/**',
      '!app/blog/static/*/css', '!app/blog/static/*/css/*.css',
      '!app/blog/static/*/js', '!app/blog/static/*/js/*.js',
      '!app/lib/*.*-info', '!app/lib/*.*-info/**',
      '!app/lib/flask/{testsuite,testsuite/**}',
      '!app/lib/werkzeug/{debug,debug/**}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('minifycss-blog', () => {
  gulp.src('app/blog/static/*/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('all.min.css'))
    .pipe(minifycss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/blog/static/'));
});

gulp.task('minifycss-online-tools', () => {
  gulp.src('app/online_tools/static/css/*.css')
    .pipe(concate('styles.all.min.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('app/online_tools/static/'));
});

gulp.task('minifycss', ['minifycss-blog', 'minifycss-online-tools']);

var uglify_uv = (u, v = '') =>  () => {
  var path = `app/${u}/static/${v}`;

  return gulp.src(`${path}/js/*.js`)
    .pipe(concate(`${(v || u)}.all.min.js`))
    .pipe(uglify())
    .pipe(gulp.dest(`${path}/`));
};

gulp.task('uglify-admin', uglify_uv('blog', 'admin'));
gulp.task('uglify-blog', uglify_uv('blog', 'blog'));
gulp.task('uglify-shared', uglify_uv('blog', '_shared'));
gulp.task('uglify-online-tools', uglify_uv('online_tools'));

gulp.task('uglify', ['uglify-admin', 'uglify-blog', 'uglify-shared']);

gulp.task('disable-debug-flag', () => {
  gulp.src('app/blog/__init__.py')
    .pipe(replace('debug_flag = False', 'debug_flag = True'))
    .pipe(gulp.dest('dist/blog/'));
});

gulp.task('build', ['minifycss', 'uglify', 'copy-to-dist', 'disable-debug-flag']);

/*
 gulp.task('watch', function () {
 gulp.watch('app/static/!*.css', ['css-preprocessor']);
 });*/
