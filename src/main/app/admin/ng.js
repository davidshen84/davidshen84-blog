'use strict';

angular.module('blogapi', ['ngResource']).
  factory('Blog', function ($resource) {
    var Blog = $resource('/blog/api/sync/:title', {},
      { "update": { "method": "PUT" } });

    return Blog;
  }).
  factory('BlogComment', function ($resource) {
    return $resource('/blog/comment/api/sync/:title_id');
  });

angular.module('blog', ['blogapi']).
  config(function ($routeProvider, $locationProvider) {
    $routeProvider.
      when('/blog/admin', { "controller": ListCtrl, "templateUrl": '/blog/admin/bloglist.html' }).
      when('/blog/admin/edit/:title', { "controller": CreateEditCtrl, "templateUrl": '/blog/admin/blogedit.html' }).
      when('/blog/admin/new', { "controller": CreateEditCtrl, "templateUrl": '/blog/admin/blogedit.html' }).
      otherwise({ "redirectTo": '/blog/admin' });

    $locationProvider.html5Mode(true);
  }).
  factory('editor', function () {
    var epiceditor;

    return function (opt) {
      if (opt) {
        epiceditor = new EpicEditor(opt);
      } else if (!epiceditor) {
        throw 'option is required for initialize.';
      }

      return epiceditor;
    };
  }).
  directive('eeditor', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function ($scope, $element, editor) {
        var opt = {
          container: $element[0],
          basePath: '/blog/static/epiceditor',
          clientSideStorage: false
        };

        editor(opt).load();
      },
      template: '<div></div>',
      replace: true
    };
  });
