/**
 * Created by david on 11/25/2015.
 */

(function (angular) {
  'use strict';

  angular.module('blogResource', ['ngRoute', 'ngResource'])
    .factory('Blog', ['$resource', function ($resource) {
      return $resource('/blog/resources/blogs/:urlsafe', {},
        {update: {method: "PUT"}});
    }])
    .factory('BlogComment', ['$resource', function ($resource) {
      return $resource('/blog/resources/comments/:urlsafe');
    }]);
})(angular);
