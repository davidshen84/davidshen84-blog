describe('Admin ng route', function () {
  'use strict';

  var should = chai.should();
  var httpBackend, route, location, scope;

  beforeEach(module('admin'));
  beforeEach(inject(function ($rootScope, $route, $location, $httpBackend) {
    scope = $rootScope;
    route = $route;
    httpBackend = $httpBackend;
    location = $location;
  }));

  afterEach(function () {
    httpBackend.flush();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should route to /blog/admin/', function () {
    should.not.exist(route.current);
    httpBackend.whenGET('/blog/static/admin/bloglist.html').respond('');

    location.path('/blog/admin/');
    scope.$digest();

    var currentRoute = route.current;

    currentRoute.controller.should.be.equal('ListCtrl');
    currentRoute.templateUrl.should.be.equal('/blog/static/admin/bloglist.html');
  });

  it('should route to /blog/admin/edit/some-blog', function () {
    should.not.exist(route.current);

    httpBackend.whenGET('/blog/static/admin/blogedit.html').respond('');
    location.path('/blog/admin/edit/xyz');
    scope.$digest();

    var currentRoute = route.current;
    currentRoute.controller.should.be.equal('CreateEditCtrl');
    currentRoute.templateUrl.should.be.equal('/blog/static/admin/blogedit.html');
  });

  it('should route to /blog/admin/new', function () {
    should.not.exist(route.current);

    httpBackend.whenGET('/blog/static/admin/blogedit.html').respond('');
    location.path('/blog/admin/new');
    scope.$digest();

    var currentRoute = route.current;
    currentRoute.controller.should.be.equal('CreateEditCtrl');
    currentRoute.templateUrl.should.be.equal('/blog/static/admin/blogedit.html');
  });
});
