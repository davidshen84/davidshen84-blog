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

function RootCtrl($scope, $location, $http) {
  var changed = false;

  $scope.$on('$routeChangeSuccess', function ($event, current) {
    if (changed || window.articlePath !== $location.path()) {
      // force load the content
      changed = true;

      $http.get($location.path())
        .success(function (data) {
          updatePage($(data), current.pathParams.title !== undefined);
        });
    }
  });
}

function CommentCtrl($scope, $route, BlogComment) {
  $scope.submit = function () {
    BlogComment.save(
      { "title": $route.current.params.title },
      { "screenname": $scope.screenname,
        "email": $scope.email,
        "comment": $scope.comment },
      function () {
        $('#comments').append(BlogComment.createCommentHtml($scope));
      }
    );
  };
}