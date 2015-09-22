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
  material: {
    expand: true,
    cwd: 'bower_components/material-design-lite',
    src: [ 'material.min.js', 'material.min.css' ],
    dest: 'app/static/material'
  }
};

