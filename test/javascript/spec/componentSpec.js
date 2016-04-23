/**
 * Created by david on 4/23/2016.
 */
describe('components', function () {
  'use strict';

  before(function () {
    try {
      sinon.spy(componentHandler, 'upgradeAllRegistered');
    } catch (e) {
      // ignore possible multiple spy
    }
  });

  beforeEach(module('blog'));

  describe('xsComment component', function () {
    var cmpCtrl, $scope, $http, BlogCommentMock;

    beforeEach(inject(function ($componentController, $httpBackend, $rootScope) {
      $http = $httpBackend;
      $scope = $rootScope.$new();

      BlogCommentMock = function () {
        this.$save =sinon.stub().yields({});

        return this;
      };
      BlogCommentMock.query = sinon.stub().returns([]);

      cmpCtrl = $componentController('xsComment', {
        $scope: $scope,
        $location: {
          absUrl: sinon.stub().returns('url/path')
        },
        BlogComment: BlogCommentMock
      });
    }));

    it('should initialize MDL components', function () {
      componentHandler.upgradeAllRegistered.should.have.been.called;
    });

    it('should initialize comments', function () {
      BlogCommentMock.query.should.have.been.calledWith({urlsafe: "path"});
    });

    it('should create an empty comment object', function () {
      $scope.comment.should.be.ok;
    });

    it('should update comment array on service return', function () {
      sinon.spy($scope.comments, 'unshift');
      $scope.submit();
      // $scope.comment.$save.should.have.been.called;
      $scope.comments.unshift.should.have.been.called;
      $scope.comment.should.be.an.instanceof(BlogCommentMock);
    });
  });
});
