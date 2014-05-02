var shell = require('shelljs');

module.exports = {
  "werkzeug": {
    "cwd": '<%= pythonPackageDir %>',
    "src": [ '<%= pythonPackageDir %>/werkzeug/*.py',
             '<%= pythonPackageDir %>/werkzeug/contrib/*.py' ],
    "dest": 'build/werkzeug.zip'
  },
  "flask": {
    "cwd": '<%= pythonPackageDir %>',
    "src": [ '<%= pythonPackageDir %>/flask/*.py',
             '<%= pythonPackageDir %>/flask/ext/*.py' ],
    "dest": "build/flask.zip"
  },
  "bloglib": {
    "cwd": "bloglib/src/",
    "src": "bloglib/src/bloglib/*.py",
    "dest": "build/bloglib.zip"
  }
};
