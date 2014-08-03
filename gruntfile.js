var path = require('path'),
    shell = require('shelljs');

module.exports = function(grunt) {

  grunt.loadTasks('grunt_tasks');

  // TODO: js-minify
  require('load-grunt-config')(grunt, {
    "configPath": path.join(process.cwd(), 'grunt_config'),
    "config": {
      "gaeDir": '~/google_appengine/',
      "pythonPackageDir": (function() {
        var path = shell
          .exec('python -c "import flask; \
                print \'/\'.join(flask.__file__.split(\'/\')[0:-2]);"', {"silent": true})
          .output.trim();

        grunt.log.debug(path);

        return path;
      })()
  }});

/*  grunt.registerTask('default', ['jshint', 'shell:clean',
                                 'copy:main', 'copy:epiceditor', 'copy:angular-ui',
                                 'zip', 'pythonmodule']);*/

  grunt.registerTask('setup', ['pythonmodule', 'copy', 'zip']);
  grunt.registerTask('test', ['copy:test', 'shell:testapi', 'shell:testapp']);
  grunt.registerTask('bloglib', ['zip:bloglib']);
  grunt.registerTask('angular', ['curl-dir:angular']);
};

