'use strict';

angular.module('blogapi', ['ngResource'])
  .factory('BlogComment', function ($resource, $interpolate) {
    var BlogComment = $resource('/blog/comment/api/sync/:title'),
      commentTempl = $interpolate(
        '<dt><em>{{ screenname }}</em> just now:</dt>\
        <dd class="well">{{ comment }}</dd>'
      );

    BlogComment.createCommentHtml = function (scope) {
      return commentTempl(scope);
    };

    return BlogComment;
  });

angular.module('ngapp', ['blogapi'])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/blog/', { "redirectTo": function (routePath, path) {
        return window.articlePath || path;
      }})
      .when('/blog/:year/')
      .when('/blog/:year/:month/')
      .when('/blog/tag/:tag/')
      .when('/blog/:year/:month/:title');

    $locationProvider.html5Mode(true);
  });
