module.exports = {
  werkzeug: {
    options: {
      archive: 'app/blog/module/werkzeug.zip',
      level: 9
    },
    expand: true,
    cwd: '<%= pythonPackageDir %>',
    src: [
      'werkzeug/*.py',
      'werkzeug/contrib/*.py'
    ],
    dest: '/'
  },
  flask: {
    options: {
      archive: 'app/blog/module/flask.zip',
      level: 9
    },
    expand: true,
    cwd: '<%= pythonPackageDir %>',
    src: [ 'flask/*.py',
           'flask/ext/*.py' ],
    dest: '/'
  }
}