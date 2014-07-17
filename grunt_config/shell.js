module.exports = {
  "clean": {
    "command": 'rm -rf build'
  },
  "testpython": {
    "options": {
      "stdout": true,
      "stderr": true,
      "failOnError": true,
      "execOptions": {
        "cwd": 'src/test/python/'
      }
    },
    "command": ['python testmyblogapi.py <%= gaeDir %>', 'python testmycommentapi.py <%= gaeDir %>',
                'python testblog.py <%= gaeDir %>', 'python testcomment.py <%= gaeDir %>'].join(' && ')
  }
};
