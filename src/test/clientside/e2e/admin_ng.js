'use strict';

describe('test suite for ng moudle for admin.js', function () {
  var $injector = angular.injector();

  beforeEach(module('blog'));

  it('should resolve Blog', inject(function (Blog) {
    expect(Blog).not.toBe(null);
    expect(Blog).not.toBe(undefined);

    spyOn(Blog, 'update');
    Blog.update({ "title": "test"}, {});
    expect(Blog.update).toHaveBeenCalledWith({ "title": "test"}, {});
  }));

  it('should resolve BlogComment', inject(function (BlogComment) {
    expect(BlogComment).not.toBe(null);
    expect(BlogComment).not.toBe(undefined);
  }));

  it('should get editor factory', inject(function (editor) {
    expect(editor).not.toBe(null);
    expect(editor).not.toBe(undefined);
    expect(typeof(editor)).toEqual('function');
  }));

/*  it('should ???', inject(function ($route) {
    expect($route).not.toBe(null);
    dump($route.routes);
  }));*/

  it('should match annotations', function () {
    expect($injector.annotate(ListCtrl))
      .toEqual([ '$scope', 'Blog' ]);

    expect($injector.annotate(CreateEditCtrl))
      .toEqual([ '$scope', '$routeParams', 'Blog', 'BlogComment', 'editor' ]);
  });

  it('should call Blog methods', function () {
    var scope = {},
      Blog = jasmine.createSpyObj('Blog', [ 'get', 'update', 'remove' ]);

    var ctrl = new ListCtrl(scope, Blog);
    expect(Blog.get).toHaveBeenCalled();

    expect(scope.pubIcon(true)).toEqual('icon-eye-open');
    expect(scope.pubIcon(false)).toEqual('icon-eye-close');

    scope.setPubStat('test', true);
    expect(Blog.update).toHaveBeenCalledWith(
      { "title": 'test' },
      { "published": true },
      jasmine.any(Function));

    scope.deleteBlog('test');
    expect(Blog.remove).toHaveBeenCalledWith({ "title": 'test' }, jasmine.any(Function));
  })
});
