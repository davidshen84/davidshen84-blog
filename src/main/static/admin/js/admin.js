'use strict';

function RootCtrl() {
  // empty
}

function ListCtrl($scope, $timeout, $filter, Blog) {
  $scope.blogs = Blog.get();

  $scope.pubIcon = function (published) {
    return 'glyphicon ' + (published ? 'glyphicon-eye-open' : 'glyphicon-eye-close');
  };

  $scope.setPubStat = function (index, title, publish) {
    Blog.update({ "title": encodeURIComponent(title) }, { "published": publish },
      function (response) {
        if(response.msg == 'ok') {
          $timeout(function () {
            $scope.$apply('blogs.blogs[' + index + '].published=' + publish);
          }, 100);
        }
      });
  };

  $scope.getPubAction = function (published) {
    return published ? 'Unpublish' : 'Publish';
  };

  $scope.deleteBlog = function (title) {
    Blog.remove({ "title": encodeURIComponent(title) },
      function () {
        $timeout(function () {
          $scope.$apply(function () {
            $scope.blogs.blogs = $filter('filter')($scope.blogs.blogs, {'title': '!' + title});
          });
        }, 500);
      });
  };
}

function CreateEditCtrl($scope, $routeParams, $interpolate, $sce, Blog, BlogComment, editor) {
  function extractTitleFromContent(content) {
    var match = titlePattern.exec(content);

    return match && match.length > 0 ? match[0].substr(1) : null;
  }

  var titlePattern = /^#.*$/m,
    isNew = true,
    title = $routeParams.title !== undefined ? encodeURIComponent($routeParams.title) : null,
    notificationTemplate = $interpolate(
      '<div class="alert alert-{{type}}" data-timestamp={{timestamp}}>\
      <button type="button" class="close" data-dismiss="alert">&times;</button>\
      {{msg}}</div>'
    );

  $scope.isClean = true;
  $scope.notifyMessage = '';

  if(title) {
    isNew = false;

    Blog.get({"title": title}, function (blog) {
      editor().importFile(blog.title, blog.content);
      $scope.tags = blog.tags.join(', ');
    });

    // try to get comments
    $scope.comments = BlogComment.get({ "title": title });
  }

  $scope.save = function () {
    var content = editor().exportFile(),
      title = extractTitleFromContent(content),
      tags = $scope.tags || '';

    if(title === null) {
      window.alert('blog needs a title');
      return;
    }

    function updateSuccess(data) {
      $scope.isClean = true;
      isNew = false;
      $scope.notifyMessage = $sce.trustAsHtml(notificationTemplate({
        "msg": data.msg,
        "type": "success",
        "timestamp": +new Date()
      }));
    }

    if(isNew) {
      Blog.save(
        { "title": title,
          "content": content,
          "tags": tags.length ? $scope.tags.split(',') : [] },
        updateSuccess
      );
    } else {
      Blog.update(
        { "title": title },
        { "content": content,
          "tags": tags.length ? $scope.tags.split(',') : [] },
        updateSuccess
      );
    }
  };

  $scope.deleteComment = function (id) {
    BlogComment.remove({ "title": id }, null,
      function () {
        $scope.comments = BlogComment.get({ "title": title });
      });
  };

  $scope.showMsg = function () {
    if($scope.lastAction) {
      return notificationTemplate($scope.lastAction);
    }
  };
}

