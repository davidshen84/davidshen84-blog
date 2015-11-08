(function (angular) {
  'use strict';

  angular.module('app.factory', [])
    .factory('editor', function () {
      var epiceditor;

      return function (opt) {
        if (opt) {
          epiceditor = new EpicEditor(opt);
        } else if (!epiceditor) {
          throw 'option is required for initialization.';
        }

        return epiceditor;
      };
    })
    .directive('eeditor', function () {
      return {
        "restrict": 'E',
        "scope": {
          isclean: '='
        },
        "template": '<div></div>',
        "replace": true,
        "controller": ['$scope', '$element', 'editor', function ($scope, $element, editor) {
          var opt = {
              container: $element[0],
              basePath: '/static/lib/epiceditor',
              clientSideStorage: false
            },
            ctrl = editor(opt).load();

          ctrl.on('update', function () {
            $scope.$apply(function (scope) {
              scope.isclean = false;
            });
          });
        }]
      };
    });
})(angular);
