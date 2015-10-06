(function (angular) {
  'use strict';

// :data: a jQuery object containing the html fragments
// :showComment: control the visibility of the commants and the add comment form
  /*function updatePage(data, showComment) {
   var title = data.filter('title').text(),
   breadcrumbs = data.find('#breadcrumbs').html(),
   article = data.find('article').html(),
   comments = data.find('#comments').html();

   // update page title
   $('#title').text(title);
   // update window title
   document.title = title;

   // update breadcrumb
   $('#breadcrumbs').html(breadcrumbs);

   // update article
   $('#article').html(article);

   // update comments
   $('#comments').html(comments);

   if (showComment) {
   $('#comments').show();
   $('#addcommentform').show();
   } else {
   $('#comments').hide();
   $('#addcommentform').hide();
   }
   }*/

  angular.module('blogapi', ['ngResource'])
    .factory('BlogComment', ['$resource', '$interpolate', function ($resource) {
      return $resource('/blog/comment/api/sync/:urlsafe');
    }]);

  angular.module('main', ['ngRoute', 'blogapi'])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
      $routeProvider
        //.when('/blog/', {
        //  "redirectTo": function (routePath, path) {
        //    return window.articlePath || path;
        //  }
        //})
        .when('/blog/:year/:month/:urlsafe', {
          templateUrl: 'blog/static/blog/comment-template.html',
          controller: 'CommentCtrl'
        })
        .otherwise()
        //.when('/blog/:year/', {})
        //.when('/blog/:year/:month/', {})
        //.when('/blog/tag/:tag/', {})
        //.when('/blog/:year/:month/:title', {})
      ;

      $locationProvider.html5Mode(true);
    }])
    /*  .controller('RootCtrl', ['$scope', '$location', '$http', '$route', function ($scope, $location, $http, $route) {
     var changed = false;

     $scope.$on('$routeChangeSuccess', function ($event, current) {
     if (changed || (current && window.articlePath !== $location.path())) {
     // force load the content
     changed = true;

     $http.get($location.url())
     .success(function (data) {
     updatePage($(data), current.pathParams.title !== undefined);
     });
     }
     });
     }])*/
    .controller('CommentCtrl', ['$scope', '$route', 'BlogComment', function ($scope, $route, commentService) {
      // get comment data
      commentService.get({urlsafe: $route.current.params.urlsafe}, function (data) {
        $scope.comments = data.comments;
      });

      $scope.submit = function () {
        var body = {
            "screenname": $scope.screenname,
            "email": $scope.email,
            "comment": $scope.comment
          },
          params = {"urlsafe": $route.current.params.urlsafe};

        commentService.save(params, body, function (data) {
            $scope.comments.push(data);
            // TODO reset form
          }
        );
      };
    }]);
})(angular);
