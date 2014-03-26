var
formats = require('util').format,
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
         "ListCtrl": true,
         "CreateEditCtrl": true,
         "EpicEditor": true,
         "$": true,
         "document": true,
         "console": true
       }
     },
     "all": ['src/main/static/*/js/*.js']
   },
   "shell": {
     "mkdir": {
       "command": [ '( [ -e build ] && rm -rf build )',
                    'mkdir build',
                    'mkdir build/app',
                    'mkdir build/static',
                    'mkdir build/static/admin' ].join(' && ')
     },
     "copy-src": {
       "options": { "stdout": true },
       "command": 'cp -rv src/main/* build'
     },
     "copy-bloglib": {    
       "options": { "stdout": true },
       "command": 'cp -r lib/bloglib build/app/'
     },
     "copy-static": {
       "options": { "stdout": true },
       "command": 'cp -r lib/EpicEditor-v0.1.1.1/epiceditor/ build/static/admin/'
     },
     "copy-test" : {
       "command": 'cp -r src/test/ build/'
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
       "src": [ '/usr/lib/python2.7/dist-packages/werkzeug/*.py',
                '/usr/lib/python2.7/dist-packages/werkzeug/contrib/*.py' ],
       "dest": 'build/werkzeug.zip',
       "router": function (filepath) {
         return filepath.indexOf('test') == -1
           ? filepath.replace(/.*dist-packages\//, '')
           : null;
       }
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

  grunt.registerTask('shell-build', ['shell:mkdir', 'shell:copy-src', 'shell:copy-bloglib', 'shell:copy-static']);
  grunt.registerTask('default', ['jshint', 'shell-build', 'zip', 'pythonmodule']);
  grunt.registerTask('test', ['shell:copy-test', 'shell:test']);

};

