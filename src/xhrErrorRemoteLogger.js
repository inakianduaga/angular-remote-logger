/**
 * Http interceptor
 *  - logs all request errors remotely
 */
angular
  .module('angular-remote-logger')
  .constant('XHR_LOGGER_CONFIG', {
    remoteLogUrl : 'localhost'
  })
  .factory('httpInterceptor',
    ['$q', '$injector','$rootScope', 'XHR_LOGGER_CONFIG',
    function($q, $injector,  $rootScope, XHR_LOGGER_CONFIG){

      'use strict';

      var remoteLogUrl = XHR_LOGGER_CONFIG.remoteLogUrl;

      /**
       * Logs a request error into the server
       *
       * @param  {object} rejection
       */
      function remotelyLogXHRException(rejection) {

          var config = {
            method: 'post',
            url: remoteLogUrl,
            data : rejection
          };

          //If the rejection comes from trying to log the error itself, don't retry otherwise we end up in infinity loop trying to log
          if(rejection.config.url === remoteLogUrl) {
            return;
          }

          //Inject http service and post exception
          $injector.get('$http')(config).catch(function(){
            console.log('The http interceptor logging has failed!');
          });
      }

      //Pass object to the angular httpProvider with the different case configurations
      return {

        responseError: function (rejection) {

          //Log exception remotely
          remotelyLogXHRException(rejection);

          //Broadcast error to rootScope
          $rootScope.$broadcast('xhrRequest.error', rejection);

          //Chain forward the rejection
          return $q.reject(rejection);
        }

      };

    }]);






