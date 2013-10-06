angular.module('filters.age', []).filter('age', function() {
  return function filterAge(date) {

    if (typeof date !== 'string') {
      throw 'Date must be a string.';
    }

    if (null == date.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
      throw 'Date does not meet the required format of "yyyy-mm-dd".';
    }

    var parts = date.split('-');

    if (parts[1] > 12 || parts[1] < 1) {
      throw 'Month must must be between 1 and 12.';
    }

    if (parts[2] > 31 || parts[2] < 1) {
      throw 'Day must be between 1 and 31.';
    }

    var dateOfBirth = new Date(date)
      , dateNow = new Date()
      , dateDifference = dateNow.getTime() - dateOfBirth.getTime();

    return Math.floor(dateDifference / (1000 * 60 * 60 * 24 * 365.25));
  };
});
