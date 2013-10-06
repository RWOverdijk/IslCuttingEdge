require('angular/angular');

/**
 * Require all dependencies for this module in here.
 * This will allow for us to always know what this module depends on, in stead of having to go through the code.
 */
require('./common/filters/age');
require('./performerOverview');
require('./common/providers/socket');

/**
 * Define all dependencies for customer in here.
 */
angular.module('customer', [

  // Socket io
  'socket-io',

  // Filters
  'filters.age',

  // Components
  'performerOverview'
]);
