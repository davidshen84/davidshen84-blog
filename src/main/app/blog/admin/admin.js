'use strict';

function ListCtrl($scope, Blog) {
  $scope.blogs = Blog.get();

  $scope.pubIcon = function (published) {
    return published ? 'icon-eye-open' : 'icon-eye-close';
  };

  $scope.setPubStat = function (title, publish) {
    Blog.update({ "title": title }, { "published": publish },
      function () {
        $scope.blogs = Blog.get();
      });
  };

  $scope.getPubAction = function (published) {
    return published ? 'Unpublish' : 'Publish';
  };

  $scope.deleteBlog = function (title) {
    Blog.remove({ "title": title },
      function () {
        $scope.blogs = Blog.get();
      });
  };
}

function CreateEditCtrl($scope, $routeParams, $interpolate, Blog, BlogComment, editor) {
  var titlePattern = /^#.*$/m,
    isNew = true,
    msgTmpl = $interpolate(
      '<div class="alert alert-{{type}}">\
      <button type="button" class="close" data-dismiss="alert">&times;</button>\
      {{msg}}</div>'
    );

  $scope.isClean = true;

  if ($routeParams.title) {
    isNew = false;

    Blog.get({title: $routeParams.title}, function (blog) {
      editor().importFile(blog.title, blog.content);
      $scope.tags = blog.tags.join(', ');
    });

    // try to get comments
    $scope.comments = BlogComment.get({ "title_id": $routeParams.title });
  }

  function extractTitleFromContent(content) {
    var title = titlePattern.exec(content);

    return title && title.length > 0 ? title[0].substr(1) : null;
  }

  $scope.save = function () {
    var content = editor().exportFile(),
      title = extractTitleFromContent(content),
      tags = $scope.tags || '';

    if (title === null) {
      window.alert('blog needs a title');
      return;
    }

    function updateSuccess(data) {
      $scope.lastAction = {
        "msg": data.msg,
        "type": "success"
      };

      $scope.isClean = true;
    }

    if (isNew) {
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
    BlogComment.remove({ "title_id": id }, null,
      function () {
        $scope.comments = BlogComment.get({ "title_id": $routeParams.title });
      });
  };

  $scope.showMsg = function () {
    if ($scope.lastAction) {
      return msgTmpl($scope.lastAction);
    }
  };
}