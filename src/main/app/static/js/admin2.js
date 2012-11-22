function ListCtrl($scope, Blog) {
  'use strict';

  $scope.blogs = Blog.query();

  $scope.pubCls = function (published) {
    return published ? 'unpub' : '';
  };

  $scope.setPubStat = function (title, publish) {
    Blog.update({ "title": title }, { "published": publish },
      function () {
        $scope.blogs = Blog.query();
      });
  };

  $scope.getPubAction = function (published) {
    return published ? 'Unpublish' : 'Publish';
  };

  $scope.delete = function (title) {
    Blog.delete({ "title": title });
  };
}

function CreateEditCtrl($scope, $routeParams, Blog, editor) {
  'use strict';

  var titlePattern = /^#.*$/m;

  if ($routeParams.title) {
    Blog.get({title: $routeParams.title}, function (blog) {
      editor().importFile(blog.title, blog.content);
    });

    // try to get comments
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

    Blog.save({
      "title": title,
      "content": content,
      "tags": tags.length ? $scope.tags.split(',') : []
    });
  };
}

angular.module('blogapi', ['ngResource']).
  factory('Blog', function ($resource) {
    'use strict';

    var Blog = $resource('api/sync/:title', {},
      { "query": { "method": "GET", "isArray": false },
        "update": { "method": "PUT" } });

    return Blog;
  }).
  factory('BlogComment', function ($resource) {
    'use strict';

    return $resource('comment/api/sync/:id', {},
      { "query": { "method": "GET", "isArray": false } });
  });

angular.module('blog', ['blogapi']).
  config(function ($routeProvider) {
    'use strict';

    $routeProvider.
      when('/', { "controller": ListCtrl, "templateUrl": '/blog/admin/templates/bloglist.html' }).
      when('/edit/:title', { "controller": CreateEditCtrl, "templateUrl": '/blog/admin/templates/blogedit.html' }).
      when('/new', { "controller": CreateEditCtrl, "templateUrl": '/blog/admin/templates/blogedit.html' }).
      otherwise({ "redirectTo": '/' });
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
