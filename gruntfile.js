
var path = require('path');

module.exports = function(grunt) {

  grunt.loadTasks('grunt_tasks');

  // TODO: js-minify
  require('load-grunt-config')(grunt, {
    "configPath": path.join(process.cwd(), 'grunt_config'),
    "config": {
      "gaeDir": '~/google_appengine/'
  }});

  grunt.registerTask('default', ['jshint',
                                 'shell:clean', 'copy:main', 'copy:epiceditor',
                                 'zip', 'pythonmodule']);

  grunt.registerTask('test', ['copy:test', 'shell:testapi', 'shell:testapp']);
  grunt.registerTask('bloglib', ['zip:bloglib']);
  grunt.registerTask('angular', ['curl-dir:angular']);
};

