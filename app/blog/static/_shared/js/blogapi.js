/**
 * Created by david on 11/25/2015.
 */

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
})(angular);
