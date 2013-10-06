describe('filter', function() {

  beforeEach(module('filters.age'));

  describe('age', function() {
    it('should return an age from a date string.', inject(function(ageFilter) {

      // Tests get old. So let's get the age of this test.
      var yearDiff = ageFilter('2013-09-27');

      expect(ageFilter('1991-04-24')).toEqual(22 + yearDiff);
      expect(ageFilter('1993-08-18')).toEqual(20 + yearDiff);

      var testIsString = function() {
        ageFilter({});
      };

      var testCorrectFormat = function() {
        ageFilter('not a date.');
      };

      var testMonthRangeHigh = function() {
        ageFilter('1990-13-03');
      };

      var testMonthRangeLow = function() {
        ageFilter('1990-00-03');
      };

      var testDayRangeHigh = function() {
        ageFilter('1990-11-33');
      };

      var testDayRangeLow = function() {
        ageFilter('1990-11-00');
      };

      expect(testIsString).toThrow('Date must be a string.');
      expect(testCorrectFormat).toThrow('Date does not meet the required format of "yyyy-mm-dd".');
      expect(testMonthRangeHigh).toThrow('Month must must be between 1 and 12.');
      expect(testMonthRangeLow).toThrow('Month must must be between 1 and 12.');
      expect(testDayRangeHigh).toThrow('Day must be between 1 and 31.');
      expect(testDayRangeLow).toThrow('Day must be between 1 and 31.');
    }));
  });
});
