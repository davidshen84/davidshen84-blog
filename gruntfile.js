var formats = require('util').format,
    shell = require('shelljs');

module.exports = function(grunt) {
 
  grunt.initConfig({
    "pkg": 'my-blog',
    "gaeDir": '~/google_appengine/',
    "jshint": {
      "options": {
        "globalstrict": true,
        "multistr": true,
        "globals": {
          "window": true,
          "angular": true,
          "EpicEditor": true,
          "$": true,
          "document": true,
          "console": true
        }
      },
      "all": ['src/main/static/*/js/*.js']
    },
    "copy": {
      "main": {
        "expand": true,
        "cwd": 'src/main/',
        "src": '**',
        "dest": 'build/'
      },
      "bloglib": {
        "expand": true,
        "cwd": 'lib/',
        "src": 'bloglib/**',
        "dest": 'build/app/'
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
    },
    "shell": {
      "clean": {
        "command": 'rm -rf build'
      },
      "mkdir": {
        "command": [ '( [ -e build ] && rm -rf build )',
                     'mkdir build',
                     'mkdir build/app',
                     'mkdir build/static',
                     'mkdir build/static/admin' ].join(' && ')
      },
      "test": {
        "options": {
          "stdout": true,
          "execOptions": {
            "cwd": 'build/test/serverside/'
          }
        },
        "command": 'python testmyblogapi.py <%= gaeDir %>'
      }
    },
    "zip": {
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
      }
    },
    "pythonmodule": {
      "markdown2": 'build',
      "itsdangerous": 'build'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-zip');

  grunt.registerMultiTask('pythonmodule', 'copy a single python module file', function () {
    var
    module = this.target,
    command = formats('python -c "import %s; print %s.__file__[:-1]"', module, module),
    result = shell.exec(command),
    // make destination from module name
    dest = grunt.file.isDir(this.data)
      ? formats('%s/%s.py', this.data.trim('/'), this.target)
      : this.data;
    
    if(result.code != 0) {
      grunt.log.writeln('error executing command:');
      grunt.log.writeln(command);

      return result.code;
    }

    return grunt.file.copy(result.output.trim(), dest);
  });

  grunt.registerTask('default', ['jshint',
                                 'shell:clean', 'copy:main', 'copy:bloglib', 'copy:static',
                                 'zip', 'pythonmodule']);
  grunt.registerTask('test', ['copy:test', 'shell:test']);

};

