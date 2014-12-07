'use strict';

/**
 * Registers decorator for the $log provider, to log all logs remotely
 */
angular
  .module('angular-remote-logger')
  .config(['$provide', 'LOG_LOGGER_CONFIG',
    function ($provide, LOG_LOGGER_CONFIG) {

    $provide.decorator('$log',
      ['$delegate', '$injector',
      function($delegate, $injector) {

        /**
         * Logs a log message remotely
         */
        function remotelyLogLog(message) {

            var config = {
              method: 'post',
              url: LOG_LOGGER_CONFIG.remoteLogUrl,
              data : {
                message : message
              }
            };

            //Inject http service and post exception
            $injector.get('$http')(config).catch(function(){
              console.log('Failed to remotely post log!');
            });
        }

        //Pass decorator to the $exceptionHandler provider
        return function ($delegate) {

          var _log = $delegate.log; //Saving the original behavior

          $delegate.log = function(message){

            _log(msg);

            if(LOG_LOGGER_CONFIG.enabled) {
              remotelyLogLog(message);
            }

          };

          //Chain along
          return $delegate;
        };

    }]);

  }]);



