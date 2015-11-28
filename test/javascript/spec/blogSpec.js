/**
 * Created by david on 11/26/2015.
 */
describe('Blog app', function () {
  var scope;

  beforeEach(module('blog'));
  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should resolve', inject(function ($controller) {
    $controller('CommentCtrl',
      {
        $scope: scope
      }
    );
  }));

  it('should get comments for the blog', inject(function ($controller, BlogComment) {
    var blogCommentQueryStub = sinon.stub(BlogComment, 'query');
    $controller('CommentCtrl', {
      $scope: scope,
      $location: {
        absUrl: function () {
          return '/a/test';
        }
      },
      BlogComment: BlogComment
    });

    blogCommentQueryStub.should.have.been.calledWith({urlsafe: 'test'});
  }));

  it('should prepend the new comment on top on successful comment saving', inject(function ($controller, BlogComment) {
    var expect = chai.expect;
    var blogCommentQueryStub = sinon.stub(BlogComment, 'query');
    var someComment = {comment:'some comment'};


    blogCommentQueryStub.returns([]);
    $controller('CommentCtrl', {
      $scope: scope,
      $location: {
        absUrl: function () {
          return '/a/test';
        }
      },
      BlogComment: BlogComment
    });
    expect(scope.comments).to.be.a('array');
    sinon.spy(scope.comments, 'unshift');

    // setup the stub after *comment* is initialized
    sinon.stub(scope.comment, '$save').callsArgWith(1, someComment);

    scope.submit();
    scope.comments.unshift.should.have.been.calledWith(someComment);
  }));
});
