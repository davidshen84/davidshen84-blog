describe('eeditor directive', function() {
  'use strict';

  beforeEach(module('app.factory'));

  it('should resolve editor factory', inject(function (editor) {
    editor.should.be.ok;
    editor.should.be.a('function');
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

