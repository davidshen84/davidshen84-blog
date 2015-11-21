(function (angular, componentHandler) {
  'use strict';

  angular.module('ngapp.controller', ['blogapi'])
    .controller('ListCtrl',
      ['$scope', '$timeout', '$filter', '$location', 'Blog',
        function ($scope, $timeout, $filter, $location, Blog) {
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
      ['$scope', '$routeParams', '$interpolate', '$sce', '$window', '$location', 'Blog', 'BlogComment', 'editor',
        function ($scope, $routeParams, $interpolate, $sce, $window, $location, Blog, BlogComment, editor) {
          componentHandler.upgradeAllRegistered();

          var titlePattern = /^#.*$/m;

          function extractTitleFromContent(content) {
            var match = titlePattern.exec(content);

            return match && match.length > 0 ? match[0].substr(1) : null;
          }

          $scope.urlsafe = $routeParams.urlsafe;
          var isNew = $scope.urlsafe ? false: true,
            notificationTemplate = $interpolate(
              '<div class="alert alert-{{type}}" data-timestamp={{timestamp}}>\
                <button type="button" class="close" data-dismiss="alert">&times;</button>\
              {{msg}}</div>'
            );

          $scope.isClean = true;
          $scope.notifyMessage = '';

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
              $scope.notifyMessage = $sce.trustAsHtml(notificationTemplate({
                "msg": data.msg,
                "type": "success",
                "timestamp": +new Date()
              }));
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

          $scope.showMsg = function () {
            if ($scope.lastAction) {
              return notificationTemplate($scope.lastAction);
            }

            return null;
          };

          $scope.cancel = function () {
            $location.url('/blog/admin');
          };
        }]);
})(angular, componentHandler);
