/**
 * Created by david on 11/21/2015.
 *
 * define gulp build script
 */

import gulp from 'gulp';
// import debug from 'gulp-debug';

gulp.task('copy-to-dist', () => {
  gulp.src(['app/**',
    '!app/app.debug.yaml',
    '!app/lib/*.*-info', '!app/lib/*.*-info/**',
    '!app/lib/flask/{testsuite,testsuite/**}',
    '!app/lib/flask_restful/{testsuite,testsuite/**}',
    '!app/lib/werkzeug/{debug,debug/**}'])
    .pipe(gulp.dest('dist'));
});

gulp.task('build', ['copy-to-dist']);
