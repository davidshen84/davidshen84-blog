module.exports = {
  "clean": {
    "command": 'rm -rf build'
  },
  "testapp": {
    "options": {
      "stdout": true,
      "execOptions": {
        "cwd": 'src/test/python/'
      }
    },
    "command": ['python testmyblogapi.py <%= gaeDir %>', 'python testmycommentapi.py <%= gaeDir %>'].join(' && ')
  },
  "testapi": {
    "options": {
      "stdout": true,
      "execOptions": {
        "cwd": 'src/test/python'
      }
    },
    "command": ['python testblog.py <%= gaeDir %>', 'python testcomment.py <%= gaeDir %>'].join(' && ')
  }
};
