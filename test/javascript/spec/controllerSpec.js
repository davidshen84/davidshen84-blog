describe('controller specifications', function () {
  'use strict';

  before(function () {
    try {
      sinon.spy(componentHandler, 'upgradeAllRegistered');
    } catch (e) {
      // ignore possible multiple spy
    }
  });

  beforeEach(module('admin', 'blog', 'blogapi'));

  describe('ListCtrl', function () {
    var ctrl, scope, blog, location;

    beforeEach(inject(function ($controller, $rootScope) {
      blog = {
        urlsafe: 'urlsafe',
        query: sinon.spy(),
        update: sinon.spy(),
        remove: sinon.spy()
      };

      scope = $rootScope.$new();
      location = {
        url: {
          bind: sinon.spy()
        }
      };

      ctrl = $controller('ListCtrl',
        {
          $scope: scope,
          Blog: blog,
          $location: location
        });
    }));

    it('should resolve ListCtrl', function () {
      ctrl.should.be.ok;
    });

    it('should initialize MDL components', function () {
      componentHandler.upgradeAllRegistered.should.have.been.called;
    });

    it('should call url.bind', function () {
      location.url.bind.should.have.been.calledWith(location);
    });

    it('should call Blog.query on start', function () {
      blog.query.should.have.been.called;
    });

    it('should call Blog.update', function () {
      scope.setPubStatus(blog);
      blog.update.should.have.been.calledWith({"urlsafe": 'urlsafe'}, {"published": true}, sinon.match.func);
    });

    it('should return visibility icon', function () {
      scope.pubIcon(true).should.be.equal('visibility');
      scope.pubIcon(false).should.be.equal('visibility_off');
    });

    it('should call Blog.remove', function () {
      scope.deleteBlog('test');
      blog.remove.should.have.been.calledWith({"urlsafe": 'test'});
    });
  });

  describe('CreateEditCtrl common function', function () {

    var scope;
    var routeParam = {urlsafe: 'test'};

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should call BlogComment.remove, then BlogComment.query', inject(function ($controller, BlogComment) {
      sinon.stub(BlogComment, 'remove').callsArgWith(2, {});
      sinon.stub(BlogComment, 'query');

      $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParam,
          BlogComment: BlogComment,
          editor: function () {
            return {};
          }
        });
      scope.deleteComment('test');
      BlogComment.remove.should.have.been.calledWith(routeParam);
      BlogComment.query.should.have.been.calledWith(routeParam);
    }));

    it('should call $location.url', inject(function ($controller, $location) {
      sinon.spy($location, 'url');
      $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParam,
          editor: function () {
            return {};
          },
          $location: $location
        });
      scope.cancel();
      $location.url.should.have.been.called;
    }));
  });

  describe('CreateEditCtrl editing exists blog', function () {
    var ctrl, scope;

    // some predefined data
    var blogCmt = {
        query: sinon.spy()
      },
      routeParams = {
        urlsafe: 'test'
      },
      eeditor = {
        importFile: sinon.spy(),
        exportFile: sinon.stub()
      },
      testBlog = {
        title: 'test',
        content: 'test',
        tags: ['tags']
      };

    beforeEach(inject(function ($controller, $rootScope) {
      scope = $rootScope.$new();
    }));

    it('should call Blog.get and BlogComment.query when urlsafe is set', inject(function ($controller, Blog) {
      var blogGetStub = sinon.stub(Blog, 'get');
      ctrl = $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          Blog: Blog,
          BlogComment: blogCmt,
          editor: function () {
            return eeditor;
          }
        });
      blogGetStub.should.have.been.calledWith(routeParams);
      blogCmt.query.should.have.been.calledWith(routeParams);
    }));

    it('should import blog content to eeditor after Blog.get succeed', inject(function ($controller, Blog) {
      var blogGetStub = sinon.stub(Blog, 'get');
      blogGetStub.callsArgWith(1, testBlog);

      ctrl = $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          Blog: Blog,
          BlogComment: blogCmt,
          editor: function () {
            return eeditor;
          }
        });

      eeditor.importFile.should.have.been.called;
    }));

    it('should update blog', inject(function ($controller, Blog) {
      // define stub behavior
      sinon.stub(Blog, 'get').callsArgWith(1, testBlog);
      var blogUpdateStub = sinon.stub(Blog, 'update').callsArgWith(2, {msg: 'ok'});
      eeditor.exportFile.returns("#title");

      ctrl = $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          Blog: Blog,
          BlogComment: blogCmt,
          editor: function () {
            return eeditor;
          },
          snackbar: sinon.stub().returns({
            showSnackbar: sinon.stub()
          })
        });
      scope.save();
      blogUpdateStub.should.have.been.called;
    }));
  });

  describe('CreateEditCtrl create new blog', function () {
    var scope;

    var eeditor = {
        exportFile: sinon.stub()
      },
      window = {
        alert: sinon.spy()
      },
      routeParams = {},
      blogCmt = {};

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should call Blog.save to save new blog', inject(function ($controller, Blog) {
      eeditor.exportFile.returns("#title");
      sinon.spy(Blog, 'save');
      $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          $window: window,
          Blog: Blog,
          BlogComment: blogCmt,
          editor: function () {
            return eeditor;
          }
        });
      scope.save();
      Blog.save.should.have.been.called;
    }));

    it('should not call Blog.save if the blog does not have title', inject(function ($controller, Blog) {
      eeditor.exportFile.returns("notitle");
      sinon.spy(Blog, 'save');

      $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          $window: window,
          Blog: Blog,
          BlogComment: blogCmt,
          editor: function () {
            return eeditor;
          }
        });

      scope.save();
      Blog.save.should.not.have.been.called;
      window.alert.should.have.been.calledWith('blog needs a title');
    }));
  });

  describe('CommentCtrl', function () {
    var ctrl, $http, $scope;

    beforeEach(inject(function ($controller, $rootScope, $httpBackend, BlogComment) {
      $http = $httpBackend;

      $scope = $rootScope.$new();
      ctrl = $controller('CommentCtrl', {
        $scope: $scope,
        $location: {
          absUrl: sinon.stub().returns('url/path')
        },
        BlogComment: BlogComment
      });

      $http.when('GET', '/blog/static/admin/bloglist.html').respond('');
    }));

    it('should resolve', function () {
      ctrl.should.be.ok;
    });

    it('should get comments for blog', function () {
      $http.when('GET', '/blog/comment/api/sync/path').respond('[]');
      $http.expect('GET', '/blog/comment/api/sync/path');

      $http.when('GET', 'blog/static/blog/comment-template.html').respond('');

      $http.flush();
      $http.verifyNoOutstandingExpectation();
      $http.verifyNoOutstandingRequest();
    });

    it('should save and append the new comment', function () {
      sinon.stub($scope.comment, '$save')
        .withArgs({urlsafe: 'path'})
        .callsArg(1);

      $scope.submit();
      $scope.comments.length.should.equal(1);
    });
  });
});
