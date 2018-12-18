/**
 * Created by david on 11/21/2015.
 *
 * Define gulp build script.
 */

'use strict';

import gulp from 'gulp';
import del from 'del';
import filter from 'gulp-filter';
import replace from 'gulp-string-replace';

gulp.task('copy-to-dist', () => {
  let appYamlFilter = filter(['app/app.yaml'], {restore: true});
  return gulp.src([
    'app/**',
    '!app/lib/*.*-info/**', '!app/lib/*.*-info',
    '!app/lib/requirements.txt'])
    .pipe(appYamlFilter)
    .pipe(replace('debug: True', 'debug: False'))
    .pipe(appYamlFilter.restore)
    .pipe(gulp.dest('dist'));
});

gulp.task('build:clean', () => del(['dist/**']));

gulp.task('build', ['build:clean', 'copy-to-dist']);
