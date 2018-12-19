/**
 * Created by david on 11/21/2015.
 *
 * Define gulp build script.
 */

import del = require('del');
import {dest, series, src} from 'gulp';
import filter = require('gulp-filter');
import replace = require('gulp-replace');

export function copyToDist() {
  const appYamlFilter = filter(['app/app.yaml'], {restore: true});
  // noinspection JSDeprecatedSymbols, TypeScriptValidateJSTypes
  return src([
    'app/**',
    '!app/lib/*.*-info/**', '!app/lib/*.*-info',
    '!app/lib/requirements.txt'])
    .pipe(appYamlFilter)
    .pipe(replace('debug: True', 'debug: False'))
    .pipe(appYamlFilter.restore)
    .pipe(dest('dist'));
}

export function clean() {
  return del(['dist']);
}

exports.default = series(clean, copyToDist);
