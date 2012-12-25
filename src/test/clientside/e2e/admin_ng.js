'use strict';

describe('blog module', function () {
  var $ctrl, $scope, Blog, param = {};

  beforeEach(module('blog'));
  beforeEach(inject(function ($controller, $rootScope) {
    $ctrl = $controller;
    $scope = $rootScope;
  }));

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

  it('should call Blog.get', inject(function (Blog) {
    spyOn(Blog, 'get');

    var ctrl = $ctrl('ListCtrl', { $scope: $scope, Blog: Blog });

    expect(Blog.get).toHaveBeenCalled();
  }));

  it('should return correct published icon', inject(function (Blog) {
    // spy on this only to avoid real method call
    spyOn(Blog, 'get');

    var ctrl = $ctrl('ListCtrl', { $scope: $scope, Blog: Blog });

    expect($scope.pubIcon(true)).toEqual('icon-eye-open');
    expect($scope.pubIcon(false)).toEqual('icon-eye-close');    
  }));

  it('should call Blog.update with correct parameters', inject(function (Blog) {
    // spy on this only to avoid real method call
    spyOn(Blog, 'get');
    spyOn(Blog, 'update');

    var ctrl = $ctrl('ListCtrl', { $scope: $scope, Blog: Blog });

    $scope.setPubStat('test', true);
    expect(Blog.update).toHaveBeenCalledWith(
      { "title": 'test' },
      { "published": true },
      jasmine.any(Function));
  }));

  it('should call Blog.remove with correct parameters', inject(function (Blog) {
    spyOn(Blog, 'get');
    spyOn(Blog, 'remove');

    var ctrl = $ctrl('ListCtrl', { $scope: $scope, Blog: Blog });

    $scope.deleteBlog('test');
    expect(Blog.remove).toHaveBeenCalledWith({ "title": "test" }, jasmine.any(Function));
  }));
});

describe('ng route', function () {
  var $injector = angular.injector();

  beforeEach(module('blog'));

  it('should route to /blog/admin', inject(function ($route, $routeParams, $location) {
    $location.path('/blog/admin');

    expect($route.routes['/blog/admin']).not.toBe(undefined);
  }));
});
