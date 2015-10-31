describe('eeditor directive', function() {
  'use strict';

  beforeEach(module('app.factory'));

  it('should resolve editor factory', inject(function (editor) {
    editor.should.be.ok;
    editor.should.be.a('function');
  }));
});

describe('ng route', function () {
  'use strict';

  var should = chai.should();
  var httpBackend, route, location, rootScope;

  beforeEach(module('ngapp'));
  beforeEach(inject(function ($rootScope, $route, $location, $httpBackend) {
    rootScope = $rootScope;
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
    rootScope.$digest();

    var currentRoute = route.current;

    currentRoute.controller.should.be.equal('ListCtrl');
    currentRoute.templateUrl.should.be.equal('/blog/static/admin/bloglist.html');
  });

  it('should route to /blog/admin/edit/some-blog', function () {
    should.not.exist(route.current);

    httpBackend.whenGET('/blog/static/admin/blogedit.html').respond('');
    location.path('/blog/admin/edit/xyz');
    rootScope.$digest();

    var currentRoute = route.current;
    currentRoute.controller.should.be.equal('CreateEditCtrl');
    currentRoute.templateUrl.should.be.equal('/blog/static/admin/blogedit.html');
  });

  it('should route to /blog/admin/new', function () {
    should.not.exist(route.current);

    httpBackend.whenGET('/blog/static/admin/blogedit.html').respond('');
    location.path('/blog/admin/new');
    rootScope.$digest();

    var currentRoute = route.current;
    currentRoute.controller.should.be.equal('CreateEditCtrl');
    currentRoute.templateUrl.should.be.equal('/blog/static/admin/blogedit.html');
  });
});

