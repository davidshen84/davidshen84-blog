'use strict';

// :data: a jQuery object containing the html pieces
// :showComment: control the visibility of the commants and the add comment form
function updatePage(data, showComment) {
  var title = data.filter('title').text(),
    nav = data.filter('#nav'),
    article = data.filter('article'),
    comments = data.filter('#comments');

  // update page title
  $('#title').text(title);
  // update window title
  document.title = title;

  // update breadcrumb
  $('#breadcrumbs').html(nav);

  // update article
  $('#article').html(article);

  // update comments
  $('#comments').html(comments.html());

  if (showComment) {
    $('#comments').show();
    $('#addcommentform').show();
  } else {
    $('#comments').hide();
    $('#addcommentform').hide();
  }
}

angular.module('blogapi', ['ngResource'])
/*  .factory('Blog', function ($resource) {
    var Blog = $resource('api/sync/:title', {},
      { "query": { "method": "GET", "isArray": false },
        "update": { "method": "PUT" } });

    return Blog;
  })*/
  .factory('BlogComment', function ($resource) {
    return $resource('/blog/comment/api/sync/:title');
  });

angular.module('blog', ['blogapi'])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/blog')
      .when('/blog/:year')
      .when('/blog/:year/:month')
      .when('/blog/:year/:month/:title');

    $locationProvider.html5Mode(true);
  });

function RootCtrl($scope, $route, $location, $http) {
  $scope.$on('$routeChangeSuccess', function ($event, current) {
    if (current && current.redirectTo !== undefined
        && (window.forceLoad || !window.articlePath.match('^' + $location.path()))) {
      // force load the original content
      window.forceLoad = true;

      $http.get($location.path())
        .success(function (data) {
          updatePage($(data), current.pathParams.title !== undefined);
        });
    }
  });
}

function CommentCtrl($scope, $route, $compile, BlogComment) {
  var commentTempl = '<dt><em>{{ screenname }}</em> just now:</dt>\
    <dd class="well">{{ comment }}</dd>';

  $scope.submit = function () {
    BlogComment.save(
      { "title": $route.current.params.title },
      { "screenname": $scope.screenname,
        "email": $scope.email,
        "comment": $scope.comment }/*,
      function () {
          var $comments = $('#comments').append(commentTempl),
            count = $comments.children().length;

          $compile($comments.children(':nth-child(' + (count - 1) + ')'))($scope);
          $compile($comments.children(':last'))($scope);
        }*/
    );
  };
}