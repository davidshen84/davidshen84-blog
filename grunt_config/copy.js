module.exports = {
  epiceditor: {
    "expand": true,
    "cwd": 'bower_components/epiceditor/epiceditor',
    "src": '**',
    "dest": 'app/static/libs/epiceditor'
  },
  angular: {
    expand: true,
    cwd: 'bower_components/angular-latest/build',
    src: ['angular.min.js', 'angular-resource.min.js', 'angular-route.min.js'],
    dest: 'app/static/libs/angular'
  },
  material: {
    expand: true,
    cwd: 'bower_components/material-design-lite',
    src: [ 'material.min.js', 'material.min.css' ],
    dest: 'app/static/libs/material'
  }
};

