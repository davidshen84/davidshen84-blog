var path = require('path');

module.exports = function(grunt) {

  require('load-grunt-config')(grunt, {
    "configPath": path.join(process.cwd(), 'grunt_config'),
    "config": {
      "gaeDir": '~/google_appengine/',
      "unzip":{
        "epiceditor": {
          "src": 'lib/EpicEditor-v0.2.2.zip',
          "dest": 'lib/'
        }
      },
      "pythonmodule": {
        "markdown2": 'build',
        "itsdangerous": 'build'
      }
  }});
  // TODO: js-minify

  grunt.loadTasks('grunt_tasks');
  grunt.registerTask('default', ['jshint',
                                 'shell:clean', 'copy:main', 'copy:static',
                                 'zip', 'pythonmodule']);
  grunt.registerTask('test', ['copy:test', 'shell:testapi', 'shell:testapp']);
  grunt.registerTask('bloglib', ['zip:bloglib'])
  grunt.registerTask('resolve', ['curl:epiceditor', 'unzip:epiceditor']);
  grunt.registerTask('setup-test', ['curl:angular']);
};
