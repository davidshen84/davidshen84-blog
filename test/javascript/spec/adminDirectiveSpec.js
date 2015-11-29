/**
 * Created by david on 11/29/2015.
 */
describe('Admin directive and their controllers', function(){
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
  });

  describe('EEditorDirectiveCtrl', function () {
    var scope;

    beforeEach(inject(function ($rootScope) {
      scope = $rootScope.$new();
    }));

    it('should resolve', inject(function ($controller) {
      var eeditorSpy = {
        on: sinon.spy()
      };

      var editorLoadStub = sinon.stub().returns(eeditorSpy);
      var editorStub = sinon.stub().returns({
        load: editorLoadStub
      });
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
  });
});
