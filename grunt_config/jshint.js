module.exports = {
  "options": {
    "multistr": true,
    "expr": true
  },
  "main": {
    "options": {
      "globalstrict": true,
      "globals": {
        "window": true,
        "angular": true,
        "EpicEditor": true,
        "$": true,
        "document": true,
        "console": true
      }
    },
    "files":{
      "src": ['src/main/static/*/js/*.js']
    }
  },
  "test": {
    "options": {
      "globalstrict": false,
      "globals": {
        "afterEach": true,
        "angular": true,
        "beforeEach": true,
        "describe": true,
        "expect": true,
        "inject": true,
        "it": true,
        "module": true,
        "sinon": true            
      }
    },
    "files": {
      src: ['src/test/clientside/**/*.js']
    }
  }
};