describe('Blog module', function() {
  'use strict';

  var $http;

  beforeEach(module('ngapp'));
  beforeEach(inject(function ($httpBackend) {
    $http = $httpBackend;
  }));

  afterEach(function(){
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should resolve Blog', inject(function(Blog) {
    Blog.should.not.equal(null);
    Blog.should.not.equal(undefined);
  }));

  it('should make GET request to /blog/api/sync', inject(function (Blog) {
    $http.when('GET', '/blog/api/sync', undefined).respond('');
    $http.expect('GET', '/blog/api/sync', undefined);
    Blog.get();

    $http.flush();
  }));

  it('should make PUT request to /blog/api/sync/test', inject(function(Blog) {
    $http.when('PUT', '/blog/api/sync/test').respond(null);
    $http.expect('PUT', '/blog/api/sync/test', {});
    Blog.update({ "title": "test"}, {});

    $http.flush();
  }));

  it('should make POST request to /blog/api/sync/test', inject(function(Blog) {
    var data = {
      "title": 'test',
      "content": 'content',
      "tags": []
    };

    $http.when('POST', '/blog/api/sync').respond(null);
    $http.expect('POST', '/blog/api/sync', data);
    Blog.save(data);

    $http.flush();
  }));
});

describe('eeditor directive', function() {
  'use strict';

  beforeEach(module('ngapp'));

  it('should resolve editor factory', inject(function (editor) {
    editor.should.not.equal(null);
    editor.should.not.equal(undefined);
    editor.should.be.a('function');
  }));
});

describe('BlogComment module', function() {
  'use strict';

  var $http;

  beforeEach(module('ngapp'));
  beforeEach(inject(function($httpBackend) {
    $http = $httpBackend;
  }));

  afterEach(function(){
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should resolve BlogComment', inject(function(BlogComment) {
    BlogComment.should.not.equal(null);
    BlogComment.should.not.equal(undefined);
  }));

  it('should make DELETE request to /blog/comment/api/sync', inject(function(BlogComment) {
    var data = {
      "title": 1
    };

    $http.when('DELETE', '/blog/comment/api/sync/1', '').respond(null);
    $http.expect('DELETE', '/blog/comment/api/sync/1');

    BlogComment.remove(data);
    $http.flush();
  }));
});

describe('ListCtrl', function () {
  'use strict';

  var ctrl, scope;

  beforeEach(module('ngapp'));
  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {
    ctrl = $controller;
    scope = $rootScope.$new();
  }));

  it('should call Blog.get on initialize', inject(function(Blog) {
    var spy = sinon.spy(),
        stub = sinon.stub(Blog, 'get', spy);

    ctrl('ListCtrl', { "$scope": scope, "Blog": Blog });
    spy.called.should.be.equal(true);
  }));

  it('should return correct published icon', inject(function (Blog) {
    sinon.stub(Blog, 'get', null);
    ctrl('ListCtrl', { "$scope": scope, "Blog": Blog });

    scope.pubIcon(true).should.be.equal('glyphicon glyphicon-eye-open');
    scope.pubIcon(false).should.be.equal('glyphicon glyphicon-eye-close');
  }));

  it('should call Blog.update with publish=true', inject(function (Blog) {
    var updateSpy = sinon.spy();

    sinon.stub(Blog, 'get', null);
    sinon.stub(Blog, 'update', updateSpy);

    ctrl('ListCtrl', { "$scope": scope, "Blog": Blog });
    scope.setPubStat(0, 'test', true);
    updateSpy.should.have.been.calledWith(
      { "title": 'test' },
      { "published": true },
      sinon.match.func);
  }));

  it('should call Blog.remove with correct parameters', inject(function (Blog) {
    var removeSpy = sinon.spy();

    sinon.stub(Blog, 'get', null);
    sinon.stub(Blog, 'remove', removeSpy);

    ctrl('ListCtrl', { "$scope": scope, "Blog": Blog });

    scope.deleteBlog('test');
    removeSpy.should.have.been.calledWith({"title": 'test'});
  }));
});

describe('CreateEditCtrl', function() {
  'use strict';

  var ctrl, scope, http;

  beforeEach(module('ngapp'));
  beforeEach(inject(function($controller, $rootScope, $httpBackend) {
    ctrl = $controller;
    scope = $rootScope.$new();
    http = $httpBackend;
  }));

  it('should call Blog.get and BlogComment.get when title is set', inject(function(Blog, BlogComment, editor) {
    var spyBlogGet = sinon.spy(Blog, 'get'),
        spyBlogCommentGet = sinon.spy(BlogComment, 'get'),
        routeParams = {"title": 'test'};

    ctrl('CreateEditCtrl',
         {"$scope": scope, "$routeParams": routeParams, "Blog": Blog,
          "BlogComment": BlogComment, "editor": editor});

    spyBlogGet.should.have.been.calledWith(routeParams);
    spyBlogCommentGet.should.have.been.calledWith(routeParams);
  }));

  it('should import data to editor', inject(function(Blog, BlogComment) {
    var routeParams = {"title": 'test'},
        editor = sinon.stub(),
        spyImportFile = sinon.spy();

    http.when('GET', '/blog/api/sync/test').respond({
      "title": 'test respond',
      "content": 'content',
      "tags": ['1', '2']
    });
    http.when('GET', '/blog/comment/api/sync/test').respond(null);

    editor.returns({
      "importFile": spyImportFile
    });
    ctrl('CreateEditCtrl',
         {"$scope": scope, "$routeParams": routeParams, "Blog": Blog,
          "BlogComment": BlogComment, "editor": editor});

    http.flush();
    spyImportFile.should.have.been.calledWith('test respond', 'content');
    scope.tags.should.be.equal('1, 2');
  }));
});

// i have no idea...
describe.skip('ng route', function () {
  beforeEach(module('ngapp'));

  it('should route to /blog/admin', inject(function ($route, $location, $browser) {
    var routeObj = $route.routes['/blog/admin'],
        spyCtrl = sinon.spy();

    routeObj.should.not.be.equal(undefined);
    routeObj.controller = spyCtrl;
    $location.path('/blog/admin/');

    spyCtrl.called.should.be.ok;
  }));
});

