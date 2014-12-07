'use strict';

describe('Remote Logger:', function () {

  var $log,
      $httpBackend,
      REMOTE_LOG_URL,
      LOG_LOGGER_CONFIG,
      XHR_LOGGER_CONFIG;

  /**
   * List of different log operations
   * @type {string[]}
   */
  var logOperations = [
        'log',
        'warn',
        'info',
        'error',
        'debug'
      ],
      message = 'foo';

  /**
   * Builds the expected post payload for a given log operation
   * @param {string} message
   * @param {string} logType
   * @returns {{message: *, logType: string}}
   */
  function logPayload(message, logType) {
    return {
      message: message,
      logType: logType
    }
  }

  //== Setup Tests ==//

  beforeEach(function () {

    // Load the module
    module('angular-remote-logger');

    //Access request service and dependencies
    inject(function (_$log_, _$httpBackend_, _LOG_LOGGER_CONFIG_, _XHR_LOGGER_CONFIG_) {

      $log = _$log_;
      $httpBackend = _$httpBackend_;

      REMOTE_LOG_URL = _LOG_LOGGER_CONFIG_.remoteLogUrl;
      LOG_LOGGER_CONFIG = _LOG_LOGGER_CONFIG_;
      XHR_LOGGER_CONFIG = _XHR_LOGGER_CONFIG_;

    });

  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.resetExpectations();
  });

  //== Tests ==//

  it('should log messages for each log operation & send proper payload', function () {

    //Setup expectations for each type
    logOperations.forEach(function(operation){
      $httpBackend.expectPOST(REMOTE_LOG_URL, logPayload(message, operation)).respond(200, '');
    });

    //Trigger logging for each type
    logOperations.forEach(function(operation) {
      $log[operation](message);
    });

    $httpBackend.flush();

  });


  it('shouldn`t log messages for disabled log operations', function () {

    //Disabled some operations
    var disabledOperations = [
      'warn',
      'debug',
      'info'
    ];

    disabledOperations.forEach(function(operation){
      LOG_LOGGER_CONFIG.enabled[operation] = false;
    });

    //Setup expectations for non-disabled operations
    logOperations.forEach(function(operation){
      if(disabledOperations.indexOf(operation) === -1) {
        $httpBackend.expectPOST(REMOTE_LOG_URL, logPayload(message, operation)).respond(200, '');
      }
    });

    //Trigger logging for all operations
    logOperations.forEach(function(operation) {
      $log[operation](message);
    });

    $httpBackend.flush();

  });

  it('shouldn`t log any messages when global logging is disabled', function () {

    LOG_LOGGER_CONFIG.enabled.global = false;

    //Trigger logging for all operations
    logOperations.forEach(function(operation) {
      $log[operation](message);
    });

    //Flush the httpBackend:
    // 1. if there are no outstanding request, this throws, in which case we make the test pass
    // 2. if there are outstanding request, we force the test to fail since there shouldn't be any
    try {
      $httpBackend.flush();
      expect(true).toBeFalsy();
    } catch (err) {}

  });

  it('should log into console when the logger post call itself fails', function () {

    spyOn(console, 'log');

    XHR_LOGGER_CONFIG.enabled = false; //disable the XHR logger, we don't need to test that

    $httpBackend.expectPOST(REMOTE_LOG_URL).respond(500, '');

    $log.info(message);

    $httpBackend.flush();

    expect(console.log).toHaveBeenCalledWith('Failed to remotely post log!');

  });


});
