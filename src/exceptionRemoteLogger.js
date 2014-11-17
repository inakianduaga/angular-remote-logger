'use strict';

/**
 * Registers decorator for the exceptionHandler, to log all app exceptions remotely
 */
angular
  .module('angular-remote-logger')
  .config(['$provide', 'EXCEPTION_LOGGER_CONFIG',
    function ($provide, EXCEPTION_LOGGER_CONFIG) {

      var throttle = {
        history : {}
      };

    /**
     * Whether the logging should be skipped or not because there have been too many logged errors within the last window
     *
     * @return {bool}
     */
    function shouldThrottle() {

      var currentDate = new Date(),
          currentSeconds = currentDate.getSeconds(),
          loggedExceptionsCount = 0;

      //Update logged list
      throttle.history[currentSeconds] = (currentSeconds in throttle.history) ? throttle.history[currentSeconds] + 1 : 1;

      //Check if we've had too many logged in exceptions within the current window
      for (var i = currentSeconds - EXCEPTION_LOGGER_CONFIG.windowInSeconds + 1; i <= currentSeconds; i++) {
        if(i in throttle.history) {
          loggedExceptionsCount  += throttle.history[i];
        }
      }

      return loggedExceptionsCount > EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow;
    }

    /* Add decorator to the provider */
    $provide.decorator('$exceptionHandler',
      ['$delegate', '$injector',
      function($delegate, $injector) {

        /**
         * Logs an exception remotely
         */
        function remotelyLogException(exception, cause) {

            var config = {
              method: 'post',
              url: EXCEPTION_LOGGER_CONFIG.remoteLogUrl,
              data : {
                exception : exception,
                cause : cause
              }
            };

            //Inject http service and post exception
            $injector.get('$http')(config).catch(function(){
              console.log('Failed to remotely log exception!');
            });
        }

        //Pass decorator to the $exceptionHandler provider
        return function (exception, cause) {

          if(EXCEPTION_LOGGER_CONFIG.enabled) {

            $injector.get('$rootScope').$broadcast('exception', exception);

            if(!shouldThrottle()) {
              remotelyLogException(exception, cause);
            } else {
              console.log('Too many exceptions in the last '+ EXCEPTION_LOGGER_CONFIG.windowInSeconds +' seconds, skipping remote logging');
            }

          }

          //Chain along
          $delegate(exception, cause);
        };

    }]);


  }]);



