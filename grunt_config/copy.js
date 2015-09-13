module.exports = {
  "epiceditor": {
    "expand": true,
    "cwd": 'bower_components/epiceditor/epiceditor',
    "src": '**',
    "dest": 'app/static/epiceditor'
  },
  "angular-ui": {
    "expand": true,
    "cwd": 'bower_components/angular-ui-bootstrap/dist/',
    "src": [ '*.min.js' ],
    "dest": 'app/static/angular-ui/js'
  },
  "angular-ui-template": {
    "expand": true,
    "cwd": 'bower_components/angular-ui-bootstrap/template',
    "src": [ 'accordion' ],
    "dest": 'app/static/angular-ui/template'
  }
};

