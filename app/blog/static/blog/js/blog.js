(function (angular) {
  'use strict';

  angular.module('blog', ['blogapi'])
    .directive('xsComment', function () {
      return {
        templateUrl: 'blog/static/blog/comment-template.html',
        restrict: 'E'
      };
    })
    .controller('CommentCtrl', ['$scope', '$location', 'BlogComment', function ($scope, $location, Comment) {
      var default_comment = {};

      // build params from url
      var urlSplits = $location.absUrl().split('/');
      var params = {urlsafe: urlSplits[urlSplits.length - 1]};

      $scope.comment = new Comment(angular.copy(default_comment));

      // get comments for the given blog
      $scope.comments = Comment.query(params);

      // save comment
      $scope.submit = function () {
        $scope.comment.$save(params, function (comment) {
          $scope.comments.unshift(comment);
          $scope.comment = new Comment(angular.copy(default_comment));
        });
      };
    }]);
})(angular);

