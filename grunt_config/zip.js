var shell = require('shelljs');

module.exports = {
  "werkzeug": {
    "cwd": '<%= pythonPackageDir %>',
    "src": [ '<%= pythonPackageDir %>/werkzeug/*.py',
             '<%= pythonPackageDir %>/werkzeug/contrib/*.py' ],
    "dest": 'src/main/werkzeug.zip'
  },
  "flask": {
    "cwd": '<%= pythonPackageDir %>',
    "src": [ '<%= pythonPackageDir %>/flask/*.py',
             '<%= pythonPackageDir %>/flask/ext/*.py' ],
    "dest": "src/main/flask.zip"
  },
/*  "bloglib": {
    "cwd": "bloglib/src/",
    "src": "bloglib/src/bloglib/*.py",
    "dest": "src/main/app/bloglib.zip"
  }*/
};
