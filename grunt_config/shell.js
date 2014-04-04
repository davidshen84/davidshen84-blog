module.exports = {
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
  "testapp": {
    "options": {
      "stdout": true,
      "execOptions": {
        "cwd": 'build/test/serverside/'
      }
    },
    "command": ['python testmyblogapi.py <%= gaeDir %>', 'python testmycommentapi.py <%= gaeDir %>'].join(' && ')
  },
  "testapi": {
    "options": {
      "stdout": true,
      "execOptions": {
        "cwd": 'bloglib/test'
      }
    },
    "command": ['python testblog.py <%= gaeDir %>', 'python testcomment.py <%= gaeDir %>'].join(' && ')
  }
};
