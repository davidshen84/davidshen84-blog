(function (angular) {
  'use strict';

  angular.module('blogapi', ['ngRoute', 'ngResource'])
    .factory('Blog', ['$resource', function ($resource) {
      return $resource('/blog/api/sync/:urlsafe', {},
        {"update": {"method": "PUT"}});
    }])
    .factory('BlogComment', ['$resource', function ($resource) {
      return $resource('/blog/comment/api/sync/:urlsafe');
    }]);

  angular.module('ngapp', ['blogapi', 'ngapp.controller', 'app.factory'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

      $routeProvider
        .when('/blog/admin/',
          {
            "controller": 'ListCtrl',
            "templateUrl": '/blog/static/admin/bloglist.html'
          })
        .when('/blog/admin/edit/:urlsafe*',
          {
            "controller": 'CreateEditCtrl',
            "templateUrl": '/blog/static/admin/blogedit.html'
          })
        .when('/blog/admin/new',
          {
            "controller": 'CreateEditCtrl',
            "templateUrl": '/blog/static/admin/blogedit.html'
          })
        .otherwise({"redirectTo": '/blog/admin/'});

      $locationProvider.html5Mode(true);
    }]);
})(angular);
