describe('Blog service', function () {
  'use strict';

  var $http;

  beforeEach(module('blogapi'));
  beforeEach(inject(function ($httpBackend) {
    $http = $httpBackend;
  }));

  afterEach(function () {
    $http.flush();
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should make GET request to /blog/api/sync', inject(function (Blog) {
    $http.when('GET', '/blog/api/sync').respond('');
    $http.expect('GET', '/blog/api/sync');
    Blog.get();
  }));

  it('should make PUT request to /blog/api/sync/test', inject(function (Blog) {
    $http.when('PUT', '/blog/api/sync/test').respond(null);
    $http.expect('PUT', '/blog/api/sync/test', {});
    Blog.update({"urlsafe": "test"}, {});
  }));

  it('should make POST request to /blog/api/sync/test', inject(function (Blog) {
    var data = {
      "urlsafe": 'test',
      "content": 'content',
      "tags": []
    };

    $http.when('POST', '/blog/api/sync').respond(null);
    $http.expect('POST', '/blog/api/sync', data);
    Blog.save(data);
  }));
});

describe('BlogComment service', function () {
  'use strict';

  var $http;

  beforeEach(module('blogapi'));
  beforeEach(inject(function ($httpBackend) {
    $http = $httpBackend;
  }));

  afterEach(function () {
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should resolve BlogComment', inject(function (BlogComment) {
    BlogComment.should.be.ok;
  }));

  it('should make DELETE request to /blog/comment/api/sync', inject(function (BlogComment) {
    var data = {
      "urlsafe": 1
    };

    $http.when('DELETE', '/blog/comment/api/sync/1', '').respond(null);
    $http.expect('DELETE', '/blog/comment/api/sync/1');

    BlogComment.remove(data);
    $http.flush();
  }));
});
