/**
 * Created by david on 11/29/2015.
 */
describe('Admin directive and their controllers', function () {
  'use strict';

  beforeEach(module('admin.directive', 'blogapi'));

  describe('eeditor directive', function () {


    it('should resolve editor factory', inject(function (editor) {
      editor.should.be.ok;
      editor.should.be.a('function');
    }));

    it('should throw if not initialized with option', inject(function (editor) {
      var editorSpy = sinon.spy(editor);
      try {
        editorSpy();
      } catch (e) {
      }
      editorSpy.should.have.thrown();
    }));
  });

  describe('CommentDirectiveCtrl', function () {

    var scope;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should resolve', inject(function ($controller) {
      $controller('CommentDirectiveCtrl',
        {
          $scope: scope
        });
    }));

    it('should call BlogComment.query', inject(function ($controller, BlogComment) {
      scope.blogUrlsafe = 'test';
      sinon.stub(BlogComment, 'query');

      $controller('CommentDirectiveCtrl',
        {
          $scope: scope,
          BlogComment: BlogComment
        });

      BlogComment.query.should.have.been.calledWith({urlsafe: 'test'});
    }));

    it('should not call BlogComment.query is urlsafe is empty', inject(function ($controller, BlogComment) {
      sinon.spy(BlogComment, 'query');

      $controller('CommentDirectiveCtrl',
        {
          $scope: scope,
          BlogComment: BlogComment
        });

      BlogComment.query.should.not.have.been.called;
    }));
  });

  describe('EEditorDirectiveCtrl', function () {
    var scope, eeditorSpy, editorLoadStub, editorStub;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
      eeditorSpy = {on: sinon.stub()};
      editorLoadStub = sinon.stub().returns(eeditorSpy);
      editorStub = sinon.stub().returns({load: editorLoadStub});
    }));

    it('should resolve', inject(function ($controller) {
      $controller('EEditorDirectiveCtrl',
        {
          $scope: scope,
          $element: [],
          editor: editorStub
        });

      editorStub.should.have.been.called;
      editorLoadStub.should.have.been.called;
      eeditorSpy.on.should.have.been.called;
    }));

    it('should call scope.$apply to update isclean', inject(function ($controller) {
      // setup spy/stub
      eeditorSpy.on.withArgs('update').callsArgWith(1, scope);
      sinon.spy(scope, '$apply');

      // resolve the controller
      $controller('EEditorDirectiveCtrl',
        {
          $scope: scope,
          $element: [],
          editor: editorStub
        });

      eeditorSpy.on.should.have.been.calledWith('update');
      scope.$apply.should.have.been.called;
      scope.isclean.should.be.false;
    }));
  });
});
