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
                         { "$scope": scope,
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
      blog.update.should.have.been
        .calledWith({"urlsafe": 'urlsafe'}, {"published": true}, sinon.match.func);
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

  describe('CreateEditCtrl', function() {
    var ctrl, scope, blog, blogCmt, routeParams, editor;

    beforeEach(module('ngapp.controller'));
    beforeEach(inject(function($controller, $rootScope) {
      blog = {
        "get": sinon.spy()
      };

      blogCmt = {
        "get": sinon.spy()
      };

      editor = {
        "importFile": sinon.spy()
      };

      routeParams = {
        "urlsafe": 'test'
      };
      scope = $rootScope.$new();

      ctrl = $controller('CreateEditCtrl',
                         { "$scope": scope,
                           "$routeParams": routeParams,
                           "Blog": blog,
                           "BlogComment": blogCmt,
                           "editor": function() {return editor;}
                         });
    }));

    it('should call Blog.get and BlogComment.get when title is set', function() {
      blog.get.should.have.been.calledWith(routeParams);
      blogCmt.get.should.have.been.calledWith(routeParams);
    });

  });
});
