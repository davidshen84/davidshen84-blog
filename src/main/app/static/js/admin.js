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

  $scope.delete = function (title) {
    Blog.delete({ "title": title });
  };
}

function CreateEditCtrl($scope, $routeParams, Blog, BlogComment, editor) {
  var titlePattern = /^#.*$/m,
    isNew = true;

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

    if (isNew) {
      Blog.save({
        "title": title,
        "content": content,
        "tags": tags.length ? $scope.tags.split(',') : []
      });
    } else {
      Blog.update(
        { "title": title },
        { "content": content,
          "tags": tags.length ? $scope.tags.split(',') : [] }
      );
    }
  };

  $scope.deleteComment = function (id) {
    BlogComment.delete({ "title_id": id }, null,
      function () {
        $scope.comments = BlogComment.get({ "title_id": $routeParams.title });
      });
  };
}

angular.module('blogapi', ['ngResource']).
  factory('Blog', function ($resource) {
    var Blog = $resource('/blog/api/sync/:title', {},
      { "update": { "method": "PUT" } });

    return Blog;
  }).
  factory('BlogComment', function ($resource) {
    return $resource('/blog/comment/api/sync/:title_id');
  });

angular.module('blog', ['blogapi']).
  config(function ($routeProvider, $locationProvider) {
    $routeProvider.
      when('/blog/admin', { "controller": ListCtrl, "templateUrl": '/blog/admin/templates/bloglist.html' }).
      when('/blog/admin/edit/:title', { "controller": CreateEditCtrl, "templateUrl": '/blog/admin/templates/blogedit.html' }).
      when('/blog/admin/new', { "controller": CreateEditCtrl, "templateUrl": '/blog/admin/templates/blogedit.html' }).
      otherwise({ "redirectTo": '/blog/admin' });

    $locationProvider.html5Mode(true);
  }).
  factory('editor', function () {
    var epiceditor;

    return function (opt) {
      if (opt) {
        epiceditor = new EpicEditor(opt);
      } else if (!epiceditor) {
        throw 'option is required for initialize.';
      }

      return epiceditor;
    };
  }).
  directive('eeditor', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function ($scope, $element, editor) {
        var opt = {
          container: $element[0],
          basePath: '/blog/static/epiceditor',
          clientSideStorage: false
        };

        editor(opt).load();
      },
      template: '<div></div>',
      replace: true
    };
  });
