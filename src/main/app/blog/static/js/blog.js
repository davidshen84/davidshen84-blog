'use strict';

// :data: a jQuery object containing the html pieces
// :showComment: control the visibility of the commants and the add comment form
function updatePage(data, showComment) {
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
}

function RootCtrl($scope, $location, $http) {
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
}

function CommentCtrl($scope, $route, BlogComment) {
  $scope.submit = function () {
    BlogComment.save(
      { "title": $route.current.params.title },
      { "screenname": $scope.screenname,
        "email": $scope.email,
        "comment": $scope.comment },
      function () {
        $('#commentForm').get(0).reset();
        $('#comments').append(BlogComment.createCommentHtml($scope));
      }
    );
  };
}
