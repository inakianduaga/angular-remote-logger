'use strict';

describe('Http Interceptor:', function () {

  var httpInterceptor,
      $rootScope,
      $http,
      $httpBackend,
      REMOTE_LOG_URL;

  //== Mocks ==//

  //== Setup Tests ==//

  beforeEach(function () {

    // Load the module
    module('angular-remote-logger');

    //Access request service and dependencies
    inject(function (_httpInterceptor_, _$http_, _$httpBackend_, _$rootScope_, _XHR_LOGGER_CONFIG_) {

      httpInterceptor = _httpInterceptor_;
      $http = _$http_;
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;

      //Mock configuration
      REMOTE_LOG_URL = _XHR_LOGGER_CONFIG_.remoteLogUrl;

    });

    spyOn($rootScope, '$broadcast');
    spyOn(console, 'log');

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.resetExpectations();
  });

  //== Tests ==//

  describe('http exception occurs - ', function() {

    beforeEach(function(){

    });

    it('should broadcast an error', function () {

      var url = 'foo';

      $httpBackend.expectGET(url).respond(404, '');
      $httpBackend.expectPOST(REMOTE_LOG_URL).respond(200, '');

      $http.get(url);

      $httpBackend.flush();

      expect($rootScope.$broadcast).toHaveBeenCalledWith('xhrRequest.error', jasmine.any(Object));

    });

    it('should log into console when the logger post call itself fails', function () {

      var url = 'foo';

      $httpBackend.expectGET(url).respond(404, '');
      $httpBackend.expectPOST(REMOTE_LOG_URL).respond(500, '');

      $http.get(url);

      $httpBackend.flush();

      expect(console.log).toHaveBeenCalledWith('The http interceptor logging has failed!');

    });

    it('shouldn`t try to log error when the original error url is the log error (prevents infinity loop)', function () {

      $httpBackend.expectGET(REMOTE_LOG_URL).respond(404, '');

      $http.get(REMOTE_LOG_URL);

      $httpBackend.flush();

    });

  });







});
