'use strict';

angular.module('angular-remote-logger',[])
  .config(
    function ($httpProvider) {
      $httpProvider.interceptors.push('httpInterceptor');
    }
  )



