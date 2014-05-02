angular.module('app.factory', [])
  .factory('editor', function() {
    'use strict';

    var epiceditor;

    return function (opt) {
      if (opt) {
        epiceditor = new EpicEditor(opt);
      } else if (!epiceditor) {
        throw 'option is required for initialize.';
      }

      return epiceditor;
    };
  })
  .directive('eeditor', function () {
    'use strict';

    return {
      "restrict": 'E',
      "transclude": true,
      "scope": {},
      "template": '<div></div>',
      "replace": true,
      "controller": ['$scope', '$element', 'editor', function($scope, $element, editor) {
        var opt = { container: $element[0],
                    basePath: '/blog/admin/static/epiceditor',
                    clientSideStorage: false },
            ctx = angular.element($element.context),
            _e = editor(opt).load();

        // bind events
        if (ctx.attr('onupdate')) {
          _e.on('update', function () {
            // apply the expression to the directive's parent controller
            $scope.$parent.$apply(ctx.attr('onupdate'));
          });
        }}]
    };
  });

