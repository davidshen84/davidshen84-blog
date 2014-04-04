module.exports = {
  "main": {
    "expand": true,
    "cwd": 'src/main/',
    "src": '**',
    "dest": 'build/'
  },
  "static": {
    "expand": true,
    "cwd": 'lib/EpicEditor-v0.1.1.1/',
    "src": 'epiceditor/**',
    "dest": 'build/static/admin/'
  },
  "test": {
    "expand": true,
    "cwd": 'src/',
    "src": 'test/**',
    "dest": 'build/'
  }
};
