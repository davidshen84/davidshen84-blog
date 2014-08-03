angular.module('ngapp.controller', ['blogapi'])
  .controller('RootCtrl', function() {})
  .controller('ListCtrl', ['$scope', '$timeout', '$filter', 'Blog', function($scope, $timeout, $filter, Blog) {
    'use strict';

    $scope.blogs = Blog.get();

    $scope.pubIcon = function (published) {
      return 'glyphicon ' + (published ? 'glyphicon-eye-open' : 'glyphicon-eye-close');
    };

    $scope.setPubStat = function (index, urlsafe, publish) {
      Blog.update({ "urlsafe": urlsafe }, { "published": publish },
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

    $scope.deleteBlog = function (urlsafe) {
      Blog.remove({ "urlsafe": urlsafe },
                  function () {
                    $timeout(function () {
                      $scope.$apply(function () {
                        $scope.blogs.blogs = $filter('filter')($scope.blogs.blogs, {'urlsafe': '!' + urlsafe});
                      });
                    }, 500);
                  });
    };
  }])
  .controller('CreateEditCtrl',
    ['$scope', '$routeParams', '$interpolate', '$sce', 'Blog', 'BlogComment', 'editor',
     function($scope, $routeParams, $interpolate, $sce, Blog, BlogComment, editor) {
       'use strict';

       var titlePattern = /^#.*$/m;
       function extractTitleFromContent(content) {
         var match = titlePattern.exec(content);

         return match && match.length > 0 ? match[0].substr(1) : null;
       }

       var isNew = true,
           urlsafe = $routeParams.urlsafe,
           notificationTemplate = $interpolate(
             '<div class="alert alert-{{type}}" data-timestamp={{timestamp}}>\
               <button type="button" class="close" data-dismiss="alert">&times;</button>\
             {{msg}}</div>'
           );

       $scope.isClean = true;
       $scope.notifyMessage = '';

       if(urlsafe) {
         isNew = false;

         Blog.get({"urlsafe": urlsafe}, function (blog) {
           editor().importFile(blog.title, blog.content);
           $scope.tags = blog.tags.join(', ');
         });

         // try to get comments
         $scope.comments = BlogComment.get({"urlsafe": urlsafe});
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
             { "urlsafe": urlsafe,
               "content": content,
               "tags": tags.length ? $scope.tags.split(',') : [] },
             updateSuccess
           );
         } else {
           Blog.update(
             { "urlsafe": urlsafe },
             { "content": content,
               "tags": tags.length ? $scope.tags.split(',') : [] },
             updateSuccess
           );
         }
       };

       $scope.deleteComment = function (urlsafe) {
         BlogComment.remove({ "urlsafe": urlsafe }, null,
                            function () {
                              $scope.comments = BlogComment.get({ "urlsafe": urlsafe });
                            });
       };

       $scope.showMsg = function () {
         if($scope.lastAction) {
           return notificationTemplate($scope.lastAction);
         }

         return null;
       };
     }]);

