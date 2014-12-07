'use strict';

/**
 * Mocked standard module configuration
 */
angular.module('angular-remote-logger')
  .config(
    function (EXCEPTION_LOGGER_CONFIG) {
      EXCEPTION_LOGGER_CONFIG.enabled = true;
      EXCEPTION_LOGGER_CONFIG.windowInSeconds = 5;
      EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow = 4;
      EXCEPTION_LOGGER_CONFIG.remoteLogUrl = 'exception/Logger/Config/Remote/Url';
    }
  )
  .config(
    function (XHR_LOGGER_CONFIG) {
      XHR_LOGGER_CONFIG.enabled = true;
      XHR_LOGGER_CONFIG.remoteLogUrl = 'xhr/Logger/Config/Remote/Url';
    }
  )
  .config(
  function (LOG_LOGGER_CONFIG) {
    LOG_LOGGER_CONFIG.remoteLogUrl = 'log/Logger/Config/Remote/Url';
    LOG_LOGGER_CONFIG.enabled = {
      global: true,
      warn : true,
      error : true,
      info : true,
      log : true,
      debug : true
    }
  }
);



