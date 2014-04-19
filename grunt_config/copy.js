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
  "test": {
    "expand": true,
    "cwd": 'src/',
    "src": 'test/**',
    "dest": 'build/'
  }
};

