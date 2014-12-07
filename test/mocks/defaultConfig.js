'use strict';

/**
 * Modifies standard module configuration
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
  );


