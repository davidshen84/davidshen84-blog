function ListCtrl($scope, Blog) {
  'use strict';

  $scope.blogs = Blog.query();

  $scope.pubCls = function (published) {
    return published ? 'unpub' : '';
  };

  $scope.setPubStat = function (title, publish) {
    Blog.update({ "title": title }, { "published": publish });
  };

  $scope.getPubStat = function (published) {
    return published ? 'Unpublish' : 'Publish';
  };
}

function CreateCtrl($scope, Blog, editor) {
  'use strict';

  var titlePattern = /^#[^\n\r]*/i;

  function extractTitleFromContent(content) {
    return titlePattern.exec(content);
  }

  $scope.save = function () {
    console.log(editor().exportFile());
    var content = editor().exportFile(),
      title = extractTitleFromContent(content),
      tags = $scope.tags.trim();

    if (title === null || title.length === 0) {
      window.alert('blog needs a title');
      return;
    }

    Blog.save({
      title: title[0].substr(1),
      content: content,
      tags: tags.length ? $scope.tags.split(',') : []
    });
  };
}

function BlogEditCtrl($scope, $routeParams, Blog, editor) {
  'use strict';

  Blog.get({title: $routeParams.title}, function (blog) {
    editor().importFile(blog.title, blog.content);
  });
}

angular.module('blogapi', ['ngResource']).
  factory('Blog', function ($resource) {
    'use strict';

    var Blog = $resource('api/sync/:title', {},
      { query: { method: 'GET', isArray: false },
        update: { method: 'PUT'} });

    return Blog;
  });

angular.module('blog', ['blogapi']).
  config(function ($routeProvider) {
    'use strict';

    $routeProvider.
      when('/', { controller: ListCtrl, templateUrl: '/blog/admin/templates/bloglist.html' }).
      when('/edit/:title', { controller: BlogEditCtrl, templateUrl: '/blog/admin/templates/blogedit.html' }).
      when('/new', { controller: CreateCtrl, templateUrl: '/blog/admin/templates/blogedit.html' }).
      otherwise({ redirectTo: '/' });
  }).
  factory('editor', function () {
    'use strict';

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
    'use strict';

    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      controller: function ($scope, $element, editor) {
        var opt = {
          container: $element[0],
          basePath: 'static/epiceditor',
          clientSideStorage: false
        };

        editor(opt).load();
      },
      template: '<div></div>',
      replace: true
    };
  });
