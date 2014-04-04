module.exports = {
  "werkzeug": {
    "cwd": '/usr/lib/python2.7/dist-packages/',
    "src": [ '/usr/lib/python2.7/dist-packages/werkzeug/*.py',
             '/usr/lib/python2.7/dist-packages/werkzeug/contrib/*.py' ],
    "dest": 'build/werkzeug.zip'
  },
  "flask": {
    "cwd": '/usr/lib/python2.7/dist-packages/',
    "src": '/usr/lib/python2.7/dist-packages/flask/**/*.py',
    "dest": "build/flask.zip"
  },
  "bloglib": {
    "cwd": "bloglib/src/",
    "src": "bloglib/src/bloglib/*.py",
    "dest": "build/bloglib.zip"
  }
};
