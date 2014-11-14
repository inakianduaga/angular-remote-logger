angular-remote-logger
=====================

Angular Exception/XHR/log (coming soon) remote logger

# Usage

Add module `angular-remote-logger` as a dependency to your app. For example:

```js
angular.module('myApp', ['angular-remote-logger', ...]);
```

This will:

- register an `httpInterceptor` to log all failed xhr requests
- register a decorator for the `$exceptionHandler` provider to log all app exceptions.

# Exception logger

Log all application exceptions remotely, with a configurable throttle interval. 

### Configuration

The parameters can be modified by changing the values of the constant `EXCEPTION_LOGGER_CONFIG`, as follows

```js
angular.module('angular-remote-logger')
  .config(
    function (EXCEPTION_LOGGER_CONFIG) {
      EXCEPTION_LOGGER_CONFIG.windowInSeconds = 5; //defines the window interval for the throttle checking
      EXCEPTION_LOGGER_CONFIG.maxExceptionsPerWindow = 4; //how many exceptions per window are logged before throttling
      EXCEPTION_LOGGER_CONFIG.remoteLogUrl = 'exception/Logger/Config/Remote/Url'; //remote log endpoint
    }
  );
```
  
# Http Xhr error logging

Log non-200 xhr responses remotely

### Configuration

The parameters can be modified by changing the values of the constant `XHR_LOGGER_CONFIG`, as follows

```js
angular.module('angular-remote-logger')
  .config(
    function (XHR_LOGGER_CONFIG) {
      XHR_LOGGER_CONFIG.remoteLogUrl = 'xhr/Logger/Config/Remote/Url'; //remote log endpoint
    }
  );
```
