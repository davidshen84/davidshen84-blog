(function (angular) {
  'use strict';

  angular.module('blogapi', ['ngResource'])
    .factory('BlogComment', ['$resource', '$interpolate', function ($resource) {
      return $resource('/blog/comment/api/sync/:urlsafe');
    }]);

  angular.module('main', ['ngRoute', 'blogapi'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      /*$routeProvider
        .when('/blog/:year/:month/:urlsafe', {
          templateUrl: 'blog/static/blog/comment-template.html',
          controller: 'CommentCtrl'
        });

       $locationProvider.html5Mode(true);*/
    }])
    .directive('xsComment', function () {
      return {
        templateUrl: 'blog/static/blog/comment-template.html',
        restrict: 'E'
      };
    })
    .controller('CommentCtrl', ['$scope', '$location', 'BlogComment', function ($scope, $location, commentService) {
      var master_comment = {};

      // build params from url
      var urlSplits = $location.absUrl().split('/');
      var params = {urlsafe: urlSplits[urlSplits.length - 1]};

      $scope.comment = angular.copy(master_comment);

      // get comments for the given blog
      commentService.get(params, function (data) {
        $scope.comments = data.comments;
      });

      // save comment
      $scope.submit = function (comment) {
        commentService.save(params, comment, function (data) {
            $scope.comments.unshift(data);
            $scope.comment = angular.copy(master_comment);
          }
        );
      };
    }]);
})(angular);

