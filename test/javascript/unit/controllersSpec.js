describe('controllers', function() {
  'use strict';

  beforeEach(module('ngapp.controller'));

  // RootCtrl is just simple :)
  it('should resolve RootCtrl', inject(function($controller) {
    var ctrl = $controller('RootCtrl');
    ctrl.should.be.ok;
  }));

  describe('ListCtrl', function() {
    var ctrl, scope,  blog;

    beforeEach(inject(function($controller, $rootScope) {
      blog = {
        "get": sinon.spy(),
        "update": sinon.spy(),
        "remove": sinon.spy()
      };

      scope = $rootScope.$new();
      ctrl = $controller('ListCtrl',
        {
          "$scope": scope,
          "Blog": blog
        });
    }));

    it('should resolve ListCtrl', function() {
      ctrl.should.be.ok;
    });

    it('should call Blog.get on start', function() {
      blog.get.should.have.been.called;
    });

    it('should call Blog.update', function() {
      scope.setPubStat(0, 'urlsafe', true);
      blog.update.should.have.been.calledWith({"urlsafe": 'urlsafe'}, {"published": true}, sinon.match.func);
    });

    it('should return published icon', function() {
      scope.pubIcon(true).should.be.equal('glyphicon glyphicon-eye-open');
      scope.pubIcon(false).should.be.equal('glyphicon glyphicon-eye-close');
    });

    it('should call Blog.remove', function() {
      scope.deleteBlog('test');
      blog.remove.should.have.been.calledWith({"urlsafe": 'test'});
    });
  });

  describe('CreateEditCtrl w/ exists blog', function() {
    var ctrl, scope, blog, blogCmt, routeParams, editor;

    beforeEach(module('ngapp.controller'));
    beforeEach(inject(function($controller, $rootScope) {
      blog = {
        "get": sinon.spy(),
        "update": sinon.spy()
      };

      blogCmt = {
        "get": sinon.spy()
      };

      editor = {
        "importFile": sinon.spy(),
        "exportFile": sinon.stub()
      };

      routeParams = {
        "urlsafe": 'test'
      };
      scope = $rootScope.$new();

      ctrl = $controller('CreateEditCtrl',
        {
          "$scope": scope,
          "$routeParams": routeParams,
          "Blog": blog,
          "BlogComment": blogCmt,
          "editor": function () {
            return editor;
          }
        });
    }));

    it('should call Blog.get and BlogComment.get when urlsafe is set', function() {
      blog.get.should.have.been.calledWith(routeParams);
      blogCmt.get.should.have.been.calledWith(routeParams);
    });

    it('should update blog', function() {
      editor.exportFile.returns("#title");
      scope.save();
      blog.update.should.have.been.called;
    });
  });

  describe("CreateEditCtrl w/ new blog", function() {
    var ctrl, scope, blog, blogCmt, routeParams, editor;

    beforeEach(module('ngapp.controller'));
    beforeEach(inject(function($controller, $rootScope) {
      blog = {
        "save": sinon.spy()
      };

      editor = {
        "exportFile": sinon.stub()
      };

      routeParams = {};
      scope = $rootScope.$new();

      ctrl = $controller('CreateEditCtrl',
        {
          "$scope": scope,
          "$routeParams": routeParams,
          "Blog": blog,
          "BlogComment": blogCmt,
          "editor": function () {
            return editor;
          }
        });
    }));

    it('should be able to save new blog', function() {
      editor.exportFile.returns("#title");
      scope.save();
      blog.save.should.have.been.called;
    });

    it('should not save blog if it does not have title', function() {
      editor.exportFile.returns("notitle");
      scope.save();
      blog.save.should.not.have.been.called;
    });
  });
});
