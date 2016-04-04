(function (angular) {
  'use strict';

  angular.module('admin.directive', [])
    .constant('mathJaxSrc', '//cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML')
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
        "controller": 'EEditorDirectiveCtrl'
      };
    })
    .controller('EEditorDirectiveCtrl', ['$scope', '$element', 'editor', 'mathJaxSrc',
      function ($scope, $element, editor, mathJaxSrc) {
        var opt = {
            container: $element[0],
            basePath: '/static/lib/epiceditor',
            clientSideStorage: false
          },
          previewer = null,
          updatePreviewer = function () {
            var contentWindow = previewer.contentWindow,
              mathJax = contentWindow.MathJax;
            mathJax.Hub.Queue(new contentWindow.Array('Typeset', mathJax.Hub));
          };

        editor(opt).load(function () {
            // create a script element inside of the iframe
            previewer = this.getElement('previewerIframe');
            var script = previewer.contentDocument.createElement('script');
            script.src = mathJaxSrc;
            // load MathJax inside of iframe's head
            previewer.contentDocument.head.appendChild(script);
          })
          .on('update', function () {
            $scope.$apply(function (scope) {
              scope.isclean = false;
            });
            updatePreviewer();
          })
          .on('preview', function () {
            updatePreviewer();
          });
      }])
    .directive('comment', function () {
      return {
        restrict: 'E',
        scope: {
          'blogUrlsafe': '='
        },
        templateUrl: '/blog/static/admin/comment.html',
        replace: true,
        controller: 'CommentDirectiveCtrl'
      };
    })
    .controller('CommentDirectiveCtrl', ['$scope', 'BlogComment', function ($scope, BlogComment) {
      if ($scope.blogUrlsafe) {
        $scope.comments = BlogComment.query({urlsafe: $scope.blogUrlsafe});
      }
    }]);
})(angular);
