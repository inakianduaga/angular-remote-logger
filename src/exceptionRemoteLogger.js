'use strict';

/**
 * Registers decorator for the exceptionHandler, to log all app exceptions remotely
 */
angular
  .module('angular-remote-logger')
  .constant('EXCEPTION_LOGGER_CONFIG', {
    windowInSeconds : 5,
    maxExceptionsPerWindow : 4, //max # of exceptions we log in the window interval
    remoteLogUrl: 'localhost'
  })
  .config(['$provide', 'EXCEPTION_LOGGER_CONFIG',
    function ($provide, EXCEPTION_LOGGER_CONFIG) {

      var throttle = {
        config : {
          windowInSeconds : EXCEPTION_LOGGER_CONFIG.windowInSeconds,
          maxExceptionsPerWindow : EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow
        },
        history : {}
      };

      var remoteLogUrl = EXCEPTION_LOGGER_CONFIG.remoteLogUrl;

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
      for (var i = currentSeconds - throttle.config.windowInSeconds + 1; i <= currentSeconds; i++) {
        if(i in throttle.history) {
          loggedExceptionsCount  += throttle.history[i];
        }
      }

      return loggedExceptionsCount > throttle.config.maxExceptionsPerWindow;
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
              url: remoteLogUrl,
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

          //Broadcast error to rootScope
          $injector.get('$rootScope').$broadcast('exception', exception);

          if(!shouldThrottle()) {
            remotelyLogException(exception, cause);
          } else {
            console.log('Too many exceptions in the last '+throttle.config.windowInSeconds+' seconds, skipping remote logging');
          }

          //Chain along
          $delegate(exception, cause);
        };

    }]);


  }]);



