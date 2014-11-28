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
      when('/blog/admin/', { "controller": 'ListCtrl', "templateUrl": '/static/blog/admin/bloglist.html' }).
      when('/blog/admin/edit/:urlsafe*', { "controller": 'CreateEditCtrl', "templateUrl": '/static/blog/admin/blogedit.html' }).
      when('/blog/admin/new', { "controller": 'CreateEditCtrl', "templateUrl": '/static/blog/admin/blogedit.html' }).
      otherwise({ "redirectTo": '/blog/admin/' });

    $locationProvider.html5Mode(true);
  }]);

