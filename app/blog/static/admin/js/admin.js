(function (angular, componentHandler) {
  'use strict';

  angular.module('admin', ['blogapi', 'admin.directive'])
    .factory('snackbar', ['$document', function ($document) {
      var snackbar = null;

      return function () {
        snackbar || (snackbar = $document[0].querySelector("#snackbar").MaterialSnackbar);

        return snackbar;
      };
    }])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

      $routeProvider
        .when('/blog/admin/',
          {
            "controller": 'ListCtrl',
            "templateUrl": '/blog/static/admin/bloglist.html'
          })
        .when('/blog/admin/edit/:urlsafe*',
          {
            "controller": 'CreateEditCtrl',
            "templateUrl": '/blog/static/admin/blogedit.html'
          })
        .when('/blog/admin/new',
          {
            "controller": 'CreateEditCtrl',
            "templateUrl": '/blog/static/admin/blogedit.html'
          })
        .otherwise({"redirectTo": '/blog/admin/'});

      $locationProvider.html5Mode(true);
    }])
    .controller('ListCtrl',
      ['$scope', '$timeout', '$filter', '$location', 'Blog',
        function ($scope, $timeout, $filter, $location, Blog) {
          componentHandler.upgradeAllRegistered();

          $scope.blogs = Blog.query();

          // define the edit function for the blog
          $scope.edit = $location.url.bind($location);

          $scope.pubIcon = function (published) {
            return published ? 'visibility' : 'visibility_off';
          };

          $scope.setPubStatus = function (blog) {
            Blog.update({"urlsafe": blog.urlsafe}, {"published": !blog.published},
              function (response) {
                if (response.msg === 'ok') {
                  $timeout(function () {
                    $scope.$apply(function () {
                      blog.published = !blog.published;
                    });
                  }, 100);
                }
              });
          };

          $scope.deleteBlog = function (urlsafe) {
            Blog.remove({"urlsafe": urlsafe},
              function () {
                $timeout(function () {
                  $scope.$apply(function () {
                    $scope.blogs.blogs = $filter('filter')($scope.blogs.blogs, {'urlsafe': '!' + urlsafe});
                  });
                }, 500);
              });
          };

          $scope.newBlog = function () {
            $location.url('/blog/admin/new');
          };
        }])
    .controller('CreateEditCtrl',
      ['$scope', '$routeParams', '$window', '$location', 'Blog', 'BlogComment', 'editor', 'snackbar',
        function ($scope, $routeParams, $window, $location, Blog, BlogComment, editor, snackbar) {
          var titlePattern = /^#.*$/m;

          function extractTitleFromContent(content) {
            var match = titlePattern.exec(content);

            return match && match.length > 0 ? match[0].substr(1) : null;
          }

          $scope.urlsafe = $routeParams.urlsafe;
          var isNew = $scope.urlsafe ? false : true;

          $scope.isClean = true;

          if ($scope.urlsafe) {
            Blog.get({"urlsafe": $scope.urlsafe}, function (blog) {
              editor().importFile(blog.title, blog.content);
              $scope.tags = blog.tags.join(', ');
            });

            // try to get comments
            $scope.comments = BlogComment.query({"urlsafe": $scope.urlsafe});
          }

          $scope.save = function () {
            var content = editor().exportFile(),
              title = extractTitleFromContent(content),
              tags = $scope.tags || '';

            if (title === null) {
              $window.alert('blog needs a title');
              return;
            }

            function updateSuccess(data) {
              $scope.isClean = true;
              isNew = false;
              snackbar().showSnackbar({
                message: data.msg,
                timeout: 5000
              });
            }

            if (isNew) {
              Blog.save({
                  "title": title,
                  "content": content,
                  "tags": tags.length ? $scope.tags.split(',') : []
                },
                updateSuccess
              );
            } else {
              Blog.update(
                {"urlsafe": $scope.urlsafe},
                {
                  "content": content,
                  "tags": tags.length ? $scope.tags.split(',') : []
                },
                updateSuccess
              );
            }
          };

          $scope.deleteComment = function (urlsafe) {
            BlogComment.remove({"urlsafe": urlsafe}, null,
              function () {
                $scope.comments = BlogComment.query({"urlsafe": urlsafe});
              });
          };

          $scope.cancel = function () {
            $location.url('/blog/admin');
          };
        }]);
})(angular, componentHandler);
