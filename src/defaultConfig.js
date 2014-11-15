/**
 * Default module configuration
 *
 * Use `angularRemoteLoggerConfigurator` service to modify the configuration
 */
angular.module('angular-remote-logger')
  .constant('EXCEPTION_LOGGER_CONFIG', {
    windowInSeconds : 5,
    maxExceptionsPerWindow : 4, //max # of exceptions we log in the window interval
    remoteLogUrl: 'localhost'
  })
  .constant('XHR_LOGGER_CONFIG', {
    remoteLogUrl : 'localhost'
  });
