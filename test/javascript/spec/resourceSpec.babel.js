describe('Blog resource', () => {
  "use strict";

  let $http;

  beforeEach(module('blogResource'));
  beforeEach(inject($httpBackend => $http = $httpBackend));

  afterEach(() => {
    $http.flush();
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should make GET request to /blog/resources/blogs/', inject(Blog => {
    $http.expect('GET', '/blog/resources/blogs').respond(200, []);
    Blog.query();
  }));

  it('should make GET request to /blog/resources/blogs/q', inject(Blog => {
    $http.expect('GET', '/blog/resources/blogs?query=q').respond(200, []);
    Blog.query({query: 'q'});
  }));

  it('should make GET request to /blog/resources/blogs/abc', inject(Blog => {
    $http.expect('GET', '/blog/resources/blogs/abc').respond(200, {});
    Blog.get({urlsafe: 'abc'});
  }));

  it('should make POST request to /blog/resources/blogs/ts', inject(Blog => {
    let ts = Date.now();
    $http.expect('POST', `/blog/resources/blogs/${ts}`).respond(201, {key: 'some key', message: 'some message'});
    Blog.save({urlsafe: ts},
      {
        title: 'title',
        content: 'content'
      }, rep => {
        rep.should.be.ok;
        rep.key.should.equals('some key');
        rep.message.should.equals('some message');
      });
  }));

  it('[instance] should make POST request to /blog/resources/blogs/ts', inject(Blog => {
    let ts = Date.now();
    let blogData = {
      title: 'title',
      content: 'content',
      tags: ['a', 'b']
    };

    $http.expect('POST', `/blog/resources/blogs/${ts}`, blogData).respond(200, {
      key: 'some key',
      message: 'some message'
    });
    let blog = new Blog(blogData);
    blog.$save({urlsafe: ts},
      rep => {
        rep.should.be.ok;
        rep.key.should.equals('some key');
        rep.message.should.equals('some message');
      });
  }));

  it('should make PUT request to /blog/resources/blogs', inject(Blog => {
    $http.expect('PUT', '/blog/resources/blogs/abc', {content: 'new content'}).respond(200, '');

    Blog.update({urlsafe: 'abc'}, {content: 'new content'}, rep => {
      rep.should.be.ok;
    });
  }));

  it('should make DELETE request to /blog/resources/blogs/abc', inject(Blog => {
    $http.expect('DELETE', '/blog/resources/blogs/abc').respond(200, undefined);
    Blog.delete({urlsafe: 'abc'}, rep => {
      rep.should.be.ok;
    });
  }));
});

describe('BlogComment resource', () => {
  "use strict";

  let $http;

  beforeEach(module('blogResource'));
  beforeEach(inject($httpBackend => $http = $httpBackend));

  afterEach(() => {
    $http.flush();
    $http.verifyNoOutstandingExpectation();
    $http.verifyNoOutstandingRequest();
  });

  it('should make GET request to /blog/resources/comments/abc', inject(BlogComment => {
    $http.expect('GET', '/blog/resources/comments/abc').respond([]);
    BlogComment.query({urlsafe: 'abc'}).$promise.then(rep => {
      rep.should.be.ok;
      rep.should.be.instanceof(Array);
    });
  }));

  it('should make POST request to /blog/resources/comments/abc', inject(BlogComment => {
    let comment = {screen_name: 'name', email: 'email', comment: 'comment'};
    $http.expect('POST', '/blog/resources/comments/abc', comment).respond();
    BlogComment.save({urlsafe: 'abc'}, comment, rep => rep.should.be.ok);
  }));

  it('should make POST request to /blog/resources/comments/abc, 500', inject(BlogComment => {
    let comment = {screen_name: 'name', email: 'email', comment: 'comment'};
    $http.expect('POST', '/blog/resources/comments/abc', comment).respond(500, {});
    BlogComment.save({urlsafe: 'abc'}, comment, undefined, rep => {
      rep.should.be.ok;
      rep.status.should.be.equal(500);
    });
  }));

  it('should make DELETE request to /blog/resources/comments/efg', inject(BlogComment => {
    $http.expect('DELETE', '/blog/resources/comments/efg').respond();
    BlogComment.delete({urlsafe: 'efg'}, rep => rep.should.be.ok);
  }));
});
