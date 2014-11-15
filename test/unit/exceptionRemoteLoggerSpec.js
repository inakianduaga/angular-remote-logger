'use strict';

describe('Exception Remote Logger:', function () {

  var $rootScope,
      $httpBackend,
      $exceptionHandler,
      REMOTE_LOG_URL,
      EXCEPTION_LOGGER_CONFIG,
      XHR_LOGGER_CONFIG;


  //== Mocks ==//

  //EXCEPTION_LOGGER_CONFIG = {
  //  windowInSeconds : 10,
  //  maxExceptionsPerWindow : 3
  //};

  /**
   * Throws a wrapped jasmine exception
   * @param {integer} the number of exceptions we throw
   */
  function mockedThrow(times) {

    var i;

    times = times || 1;

    function wrappedThrow() {
      $exceptionHandler('Some Random Error');
    }

    for (i = 0; i < times; i++) {
      expect(wrappedThrow).toThrow();
    }

  }

  /**
   * Sets an expectation on the remoteLogger url for a post request
   * @param times number of expectations
   */
  function expectRemoteLog(times) {

    var i;

    times = times || 1;

    for (i = 0; i < times; i++) {
      $httpBackend.expectPOST(REMOTE_LOG_URL).respond(200, '');
    }
  }

  //== Setup Tests ==//

  beforeEach(function () {

    module('angular-remote-logger');

    //Access request service and dependencies
    inject(function (_$httpBackend_, _$rootScope_, _$exceptionHandler_, _EXCEPTION_LOGGER_CONFIG_, _XHR_LOGGER_CONFIG_) {

      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      $exceptionHandler = _$exceptionHandler_;

      //Mock configuration
      REMOTE_LOG_URL = _EXCEPTION_LOGGER_CONFIG_.remoteLogUrl;
      EXCEPTION_LOGGER_CONFIG = _EXCEPTION_LOGGER_CONFIG_;
      XHR_LOGGER_CONFIG = _XHR_LOGGER_CONFIG_;

    });

    //http://stackoverflow.com/questions/15272414/how-can-i-test-events-in-angular
    spyOn($rootScope, '$broadcast');
    spyOn(console, 'log');
  });

  //== Tests ==//

  it('should log single exception when thrown', function () {

    expectRemoteLog();

    mockedThrow();

    $httpBackend.flush();

  });

  it('should stop logging exceptions after threshold is reached, and notify console of it', function () {

    var overThreshold = 3;


    expectRemoteLog(EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow);

    mockedThrow(EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow + overThreshold);

    $httpBackend.flush();

    expect(console.log.calls.count()).toEqual(overThreshold);

  });

  it('should restart logging exceptions after threshold window is over', function () {

    jasmine.clock().install();

    //Oversaturate threshold window
    expectRemoteLog(EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow);

    mockedThrow(EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow + 1);

    $httpBackend.flush();

    console.log.calls.reset();

    //Wait longer than exception threshold window
    jasmine.clock().mockDate();
    jasmine.clock().tick(EXCEPTION_LOGGER_CONFIG.windowInSeconds * 1000);

    //Throw exception and check logging
    expectRemoteLog();
    mockedThrow();

    $httpBackend.flush();

    expect(console.log).not.toHaveBeenCalled();

    jasmine.clock().uninstall();

  });

  it('should warn through console when error logging post failed when exception/xhr remote url endpoints match', function () {

    //Make XHR remote endpoint match Exception remote endpoint
    XHR_LOGGER_CONFIG.remoteLogUrl = REMOTE_LOG_URL;

    $httpBackend.expectPOST(REMOTE_LOG_URL).respond(404, '');

    mockedThrow();

    $httpBackend.flush();

    expect(console.log).toHaveBeenCalledWith('Failed to remotely log exception!');

  });


});
