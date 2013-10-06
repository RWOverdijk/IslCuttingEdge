angular.module('performerOverview').controller('performerOverviewCtrl', function($scope, socket) {

  $scope.data = {
    performers : []
  };

  var needReplacement = []
    , reserve = {
      count : 0,
      performers : {}
    }
    , reserveSize = 5;

  // Load performers that are online.
  socket.get('/performer/online', {where: {online: true}}, function (performers) {
    $scope.data.performers = performers;
  });

  /**
   * Handle all replacements (offline performers with new, online performers).
   */
  var handleReplacements = function handleReplacements () {

    if (reserve.count === 0 || needReplacement.length === 0) {
      return;
    }

    var firstReserveKey = Object.keys(reserve.performers)[0]
      , performerData = reserve.performers[firstReserveKey]
      , inNeed = needReplacement.shift();

    $scope.data.performers[inNeed] = performerData;

    delete reserve.performers[firstReserveKey];

    reserve.count--;
  };

  /**
   * Handle the case in which a performer comes online.
   */
  socket.on('performer online', function (data) {

    if (typeof $scope.data.performers[data.performer.name] === 'object') {
      $scope.data.performers[data.performer.name].online = true;

      var indexOfPerformer = needReplacement.indexOf(data.performer.name);

      if (indexOfPerformer !== -1) {
        needReplacement.splice(indexOfPerformer, 1);
      }

      return;
    }

    if (reserve.count >= reserveSize) {
      return;
    }

    reserve.performers[data.performer.name] = data.performer;
    reserve.count++;

    handleReplacements();
  });

  /**
   * Handle the case in which a performer goes offline.
   */
  socket.on('performer offline', function (data) {

    if (typeof $scope.data.performers[data.performer.name] === 'object') {
      $scope.data.performers[data.performer.name].online = false;

      needReplacement.push(data.performer.name);
    }

    if (typeof reserve.performers[data.performer.name] === 'object') {
      delete reserve.performers[data.performer.name];

      reserve.count--;
    }

    handleReplacements();
  });

});
