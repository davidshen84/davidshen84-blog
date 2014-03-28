'use strict';

angular.module('blogapi', [ 'ngRoute', 'ngResource' ]).
  factory('Blog', ['$resource', function ($resource) {
    var Blog = $resource('/blog/api/sync/:urlsafe', {},
                         { "update": { "method": "PUT" } });

    return Blog;
  }]).
  factory('BlogComment', ['$resource', function ($resource) {
    return $resource('/blog/comment/api/sync/:urlsafe');
  }]);

angular.module('ngapp', ['blogapi', 'ngapp.controller'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/blog/admin/', { "controller": 'ListCtrl', "templateUrl": '/blog/admin/static/bloglist.html' }).
      when('/blog/admin/edit/:urlsafe*', { "controller": 'CreateEditCtrl', "templateUrl": '/blog/admin/static/blogedit.html' }).
      when('/blog/admin/new', { "controller": 'CreateEditCtrl', "templateUrl": '/blog/admin/static/blogedit.html' }).
      otherwise({ "redirectTo": '/blog/admin/' });

    $locationProvider.html5Mode(true);
  }])
  .factory('editor', function () {
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

