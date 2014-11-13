/**
 * Configuration provider for the angular remote logger
 * Use this service to modify configuration dynamically
 */
angular
  .module('angular-remote-logger')
  .service('angularRemoteLoggerProvider', [
    function(XHR_LOGGER_CONFIG, EXCEPTION_LOGGER_CONFIG){

      /**
       * Sets a value on the exception logger configuration
       * @param {string} field
       * @param {mixed} value
       */
      var setExceptionLoggerConfig = function(field, value) {
        EXCEPTION_LOGGER_CONFIG[field] = value;
      }

      /**
       * Replaces the exception logger configuration
       * @param {mixed} config
       */
      var replaceExceptionLoggerConfig = function(config) {
        EXCEPTION_LOGGER_CONFIG = config;
      }

      /**
       * Sets a value on the xhr logger configuration
       * @param {string} field
       * @param {mixed} value
       */
      var setXhrLoggerConfig = function(field, value) {
        XHR_LOGGER_CONFIG[field] = value;
      }

      /**
       * Replaces the exception logger configuration
       * @param {mixed} config
       */
      var replaceXhrLoggerConfig = function(config) {
        XHR_LOGGER_CONFIG = config;
      }

      //Public API
      return {
        setExceptionLoggerConfig : setExceptionLoggerConfig,
        replaceExceptionLoggerConfig : replaceExceptionLoggerConfig,
        setXhrLoggerConfig : setXhrLoggerConfig,
        replaceXhrLoggerConfig : replaceXhrLoggerConfig
      }

    }
  ]);






