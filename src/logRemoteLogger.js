'use strict';

/**
 * Registers decorator for the $log provider, to log all logs remotely
 */
angular
  .module('angular-remote-logger')
  .config(
    function ($provide, LOG_LOGGER_CONFIG) {
      $provide.decorator('$log', function ($delegate, $injector) {

        /**
         * Logs a log message remotely
         *
         * @param {String} message
         * @param {String} logType the type of log (warn, error, info, debug, log)
         */
        function remotelyLogLog(message, logType) {

          var config = {
            method: 'post',
            url:    LOG_LOGGER_CONFIG.remoteLogUrl,
            data:   {
              message: message,
              logType: logType
            }
          };

          //Inject http service and post exception
          $injector.get('$http')(config).catch(function () {
            console.log('Failed to remotely post log!');
          });
        }

        /**
         * List of different log operations
         * @type {string[]}
         */
        var operations = [
          'log',
          'warn',
          'info',
          'error',
          'debug',
        ];

        //Save the original log behavior
        var _logger = {
          log : $delegate.log,
          warn : $delegate.warn,
          info : $delegate.info,
          error: $delegate.error,
          debug : $delegate.debug
        };

        /**
         * Extend each $log operation
         */
        operations.forEach(function(operation, index){

          $delegate[operation] = function(message) {

            if (LOG_LOGGER_CONFIG.enabled.global && LOG_LOGGER_CONFIG.enabled[operation]) {
              remotelyLogLog(message, operation);
            }

            _logger[operation](arguments);
          }

          // this keeps angular-mocks happy (https://groups.google.com/forum/#!topic/angular/DWOMe6c7L_Q)
          $delegate[operation].logs = [];
        });

        //Chain along
        return $delegate;

      });

  });



