(function (angular) {
  'use strict';

  angular.module('admin.directive', [])
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
        "template": '<div style="height: 500px;"></div>',
        "replace": true,
        "controller": ['$scope', '$element', 'editor', function ($scope, $element, editor) {
          var opt = {
              container: $element[0],
              basePath: '/static/lib/epiceditor',
              clientSideStorage: false
            },
            eeditor = editor(opt).load();

          eeditor.on('update', function () {
            $scope.$apply(function (scope) {
              scope.isclean = false;
            });
          });
        }]
      };
    })
    .directive('comment', function () {
      return {
        restrict: 'E',
        scope: {
          'blogUrlsafe': '='
        },
        templateUrl: '/blog/static/admin/comment.html',
        replace: true,
        controller: ['$scope', 'BlogComment', function ($scope, BlogComment) {
          $scope.comments = BlogComment.query({urlsafe: $scope.blogUrlsafe});
        }]
      };
    });
})(angular);
