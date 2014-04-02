var formats = require('util').format,
  shell = require('shelljs');

module.exports = function(grunt) {
  grunt.registerMultiTask('pythonmodule', 'copy a single python module file', function () {
    var module = this.target,
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
};
