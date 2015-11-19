describe('controllers', function () {
  'use strict';

  beforeEach(module('ngapp.controller'));

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

    it('should call url.bind', function () {
      location.url.bind.should.have.been.calledWith(location);
    });

    it('should call Blog.get on start', function () {
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

    it('should initialize MDL components', inject(function ($rootScope, $controller) {
      var componentHandlerMock = sinon.mock(componentHandler);
      componentHandlerMock.expects('upgradeAllRegistered').once();

      $controller('CreateEditCtrl',
        {
          $scope: $rootScope.$new(),
          $routeParams: {
            urlsafe: 'urlsafe'
          },
          editor: function () {
            return {};
          }
        });
      componentHandlerMock.verify();
    }));

  });

  describe('CreateEditCtrl editing exists blog', function () {
    var ctrl, scope, blog, blogCmt, routeParams, editor;

    beforeEach(inject(function ($controller, $rootScope) {
      blog = {
        query: sinon.spy(),
        update: sinon.spy(),
        get: sinon.spy()
      };

      blogCmt = {
        query: sinon.spy()
      };

      editor = {
        importFile: sinon.spy(),
        exportFile: sinon.stub()
      };

      routeParams = {
        urlsafe: 'test'
      };

      scope = $rootScope.$new();

      ctrl = $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          Blog: blog,
          BlogComment: blogCmt,
          editor: function () {
            return editor;
          }
        });
    }));

    it('should call Blog.get and BlogComment.query when urlsafe is set', function () {
      blog.get.should.have.been.calledWith(routeParams);
      blogCmt.query.should.have.been.calledWith(routeParams);
    });

    it('should update blog', function () {
      editor.exportFile.returns("#title");
      scope.save();
      blog.update.should.have.been.called;
    });
  });

  describe("CreateEditCtrl create new blog", function () {
    var ctrl, scope, blog, blogCmt, routeParams, editor, window;

    beforeEach(inject(function ($controller, $rootScope) {
      blog = {
        save: sinon.spy()
      };

      editor = {
        exportFile: sinon.stub()
      };

      routeParams = {};
      scope = $rootScope.$new();

      window = {
        alert: sinon.spy()
      };

      ctrl = $controller('CreateEditCtrl',
        {
          $scope: scope,
          $routeParams: routeParams,
          $window: window,
          Blog: blog,
          BlogComment: blogCmt,
          editor: function () {
            return editor;
          }
        });
    }));

    it('should be able to save new blog', function () {
      editor.exportFile.returns("#title");
      scope.save();
      blog.save.should.have.been.called;
    });

    it('should not save blog if it does not have title', function () {
      editor.exportFile.returns("notitle");
      scope.save();
      window.alert.should.have.been.calledWith('blog needs a title');
      blog.save.should.not.have.been.called;
    });
  });
});
