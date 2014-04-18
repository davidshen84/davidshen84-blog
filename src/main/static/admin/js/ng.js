'use strict';

angular.module('blogapi', ['ngRoute', 'ngResource']).
  factory('Blog', ['$resource', function ($resource) {
    var Blog = $resource('/blog/api/sync/:urlsafe', {},
                         { "update": { "method": "PUT" } });

    return Blog;
  }]).
  factory('BlogComment', ['$resource', function ($resource) {
    return $resource('/blog/comment/api/sync/:urlsafe');
  }]);

angular.module('ngapp', ['blogapi', 'ngapp.controller', 'app.factory'])
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
      when('/blog/admin/', { "controller": 'ListCtrl', "templateUrl": '/blog/admin/static/bloglist.html' }).
      when('/blog/admin/edit/:urlsafe*', { "controller": 'CreateEditCtrl', "templateUrl": '/blog/admin/static/blogedit.html' }).
      when('/blog/admin/new', { "controller": 'CreateEditCtrl', "templateUrl": '/blog/admin/static/blogedit.html' }).
      otherwise({ "redirectTo": '/blog/admin/' });

    $locationProvider.html5Mode(true);
  }]);

