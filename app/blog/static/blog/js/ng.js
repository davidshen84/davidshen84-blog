(function (angular) {
  'use strict';

  angular.module('blogapi', ['ngResource'])
    .factory('BlogComment', ['$resource', '$interpolate', function ($resource) {
      return $resource('/blog/comment/api/sync/:urlsafe');
    }]);

  angular.module('main', ['ngRoute', 'blogapi'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/blog/:year/:month/:urlsafe', {
          templateUrl: 'blog/static/blog/comment-template.html',
          controller: 'CommentCtrl'
        });

      $locationProvider.html5Mode(true);
    }])
    .controller('CommentCtrl', ['$scope', '$route', 'BlogComment', function ($scope, $route, commentService) {
      $scope.comment = {};

      // get comment data
      commentService.get({urlsafe: $route.current.params.urlsafe}, function (data) {
        $scope.comments = data.comments;
      });

      $scope.submit = function (comment) {
        var params = {"urlsafe": $route.current.params.urlsafe};

        commentService.save(params, comment, function (data) {
            $scope.comments.unshift(data);
            // TODO reset form
          }
        );
      };
    }]);
})(angular);

