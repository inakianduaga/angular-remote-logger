/**
 * Configuration provider for the angular remote logger
 * Use this service to modify configuration dynamically
 */
angular
  .module('angular-remote-logger')
  .service('angularRemoteLoggerConfigurator',
    function(XHR_LOGGER_CONFIG, EXCEPTION_LOGGER_CONFIG){

      var exceptionLogger = {

        /**
         * Sets a value on the exception logger configuration
         * @param {string} field
         * @param {mixed} value
         */
        set : function(field, value) {
          EXCEPTION_LOGGER_CONFIG[field] = value;
        },

        /**
         * Replaces the exception logger configuration
         * @param {mixed} config
         */
        replace : function(config) {
          angular.forEach(config, function(value, key){
            EXCEPTION_LOGGER_CONFIG[key] = value;
          });
        }

      };

      var xhrLogger = {

        /**
         * Sets a value on the xhr logger configuration
         * @param {string} field
         * @param {mixed} value
         */
        set : function(field, value) {
          XHR_LOGGER_CONFIG[field] = value;
        },

        /**
         * Replaces the exception logger configuration
         * @param {mixed} config
         */
        replace : function(config) {
          angular.forEach(config, function(value, key){
            XHR_LOGGER_CONFIG[key] = value;
          });
        }

      };

      //Public API
      return {
        exceptionLogger : exceptionLogger,
        xhrLogger : xhrLogger
      }

    }
  );






