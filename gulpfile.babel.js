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
import cleancss from "gulp-clean-css";
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';


gulp.task('bower-files', () => {
  var angularFilter = filter(['**/angular*/*'], {restore: true}),
    eeFilter = filter(['**/epiceditor/**'], {restore: true}),
    mdlFilter = filter(['**/material-design-lite/*'], {restore: true});

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
    .pipe(replace(/\/\/# sourceMappingURL=.*/, ''))
    //.pipe(debug({title: 'angular'}))
    .pipe(angularFilter.restore)
    .pipe(eeFilter)
    .pipe(rename(path => path.dirname = path.dirname.replace(/^epiceditor/, '')))
    //.pipe(debug({title: 'ee'}))
    .pipe(eeFilter.restore)
    .pipe(mdlFilter)
    .pipe(rename(path => path.dirname = '/material'))
    .pipe(replace(/\/\/# sourceMappingURL=.*/, ''))
    .pipe(mdlFilter.restore)
    .pipe(gulp.dest('app/static/lib'));
});

gulp.task('copy-to-dist', () => {
  gulp.src(['app/**',
      '!app/blog/__init__.py',
      '!app/blog/static/*/css', '!app/blog/static/*/css/*.css',
      '!app/blog/static/*/js', '!app/blog/static/*/js/*.js',
      '!app/lib/*.*-info', '!app/lib/*.*-info/**',
      '!app/lib/flask/{testsuite,testsuite/**}',
      '!app/lib/werkzeug/{debug,debug/**}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('cleancss-blog', () => {
  gulp.src('app/blog/static/*/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('all.min.css'))
    .pipe(cleancss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/blog/static/'));
});

gulp.task('cleancss-online-tools', () => {
  gulp.src('app/online_tools/static/css/*.css')
    .pipe(sourcemaps.init())
    .pipe(concate('styles.all.min.css'))
    .pipe(cleancss())
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('app/online_tools/static/'));
});

gulp.task('cleancss', ['cleancss-blog', 'cleancss-online-tools']);

var uglify_uv = (u, v = '') => () => {
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

gulp.task('build', ['cleancss', 'uglify', 'copy-to-dist']);

/*
 gulp.task('watch', function () {
 gulp.watch('app/static/!*.css', ['css-preprocessor']);
 });*/
