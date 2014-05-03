module.exports = {
  "main": {
    "expand": true,
    "cwd": 'src/main/',
    "src": '**',
    "dest": 'build/'
  },
  "epiceditor": {
    "expand": true,
    "cwd": 'lib',
    "src": 'epiceditor/**',
    "dest": 'build/static/admin/'
  },
  "angular-ui": {
    "expand": true,
    "flatten": true,
    "cwd": 'bower_components/angular-ui-bootstrap/',
    "src": [ 'dist/*.min.js', 'template/accordion/*.js' ],
    "dest": 'build/static/angular-ui'
  },
  "test": {
    "expand": true,
    "cwd": 'src/',
    "src": 'test/**',
    "dest": 'build/'
  }
};

