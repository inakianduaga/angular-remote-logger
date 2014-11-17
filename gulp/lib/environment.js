'use strict';

/**
 * Environment-related utils
 */
var minimist = require('minimist'),
    ARGV = minimist(process.argv), //read cli
    overrides = {};

//Public API
module.exports = {

  /**
   * Retrieves a parameter, with a default fallback
   * If we set the parameter manually, we return the override, otherwise we return the original CLI parameter
   *
   * @param {string} parameter
   * @param {string} fallback optional
   */
  get: function(parameter, fallback) {

    if(overrides[parameter]) {
      return overrides[parameter];
    } else {
      return ARGV[parameter] || fallback;
    }
  },

  /**
   * Set an environment value
   * @param parameter
   * @param value
   */
  set: function(parameter, value) {
    overrides[parameter] = value;
  },

  isProduction : function() {
    return this.get('environment') === 'production';
  }

}
