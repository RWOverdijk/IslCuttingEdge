function PerformerDataService() {

  // Setup private properties used.
  var request = require('request')
    , sails = require('sails')
    , io = sails.io
    , parseString = require('xml2js').parseString
    , self = this;


  /**
   * Process the performer data that has been extracted from the xml.
   *
   * @param {{}} result
   */
  this.updatePerformerData = function (result) {
    var performers = result.status.online[0].model
      , numberOfPerformers = performers.length
      , i = 0
      , genderMap = {
        v: 'f',
        m: 'm',
        s: 't'
      }
      , importPerformer;

    /**
     * Import the performer.
     *
     * @param {} performer
     */
    importPerformer = function (performer) {
      var performerData = {
        age: performer.leeftijd[0],
        language: performer.taal[0],
        voiceId: performer.voiceid[0],
        gender: genderMap[performer.geslacht[0].$.code],
        name: performer.naam[0],
        online: true,
        since: performer.sinds[0]
      };

      Performer.findOneByName(performerData.name).done(function (error, data) {

        if (error) {
          console.log('error: ' + error);

          return;
        }

        if (typeof data === 'object') {
          Performer.update({id: data.id}, performerData);

          return;
        }

        Performer.create(performerData).done(function (error) {
          if (error) {
            console.log('Error occured: ' + error);
          }
        });
      });
    };

    // Loop through the gathered data.
    for (i; i < numberOfPerformers; i++) {
      importPerformer(performers[i]);
    }
  };

  /**
   *
   * @param {{}} result
   */
  this.updateOnlinePerformers = function (result) {
    var performersOnlineList = result.online.model
      , performersOnline = performersOnlineList.length
      , performersOnlineMap = {}
      , i = 0;

    // convert the data from islive to something that's a bit more accessible.
    for (i; i < performersOnline; i++) {
      performersOnlineMap[performersOnlineList[i].naam[0]] = performersOnlineList[i].naam[0];
    }

    // Fetch all online performers from the database.
    Performer.findByOnline(true).done(function (error, performers) {

      var index, mapIndex;

      for (index in performers) {

        if (typeof performersOnlineMap[performers[index].name] === 'string') {

          // Already online. Delete from map so we don't unnecessarily put this performer online _again_.
          delete performersOnlineMap[performers[index].name];

          continue;
        }

        // This performer isn't online anymore. Put offline.
        Performer.update({id: performers[index].id}, {online: false}).done(function (error, performerData) {
          if (error) {
            console.log('Error while putting offline "' + performers[index].name + '": ' + error);
          }

          if (performerData.length === 0) {
            console.log('Got empty performerData after putting offline ' + performers[index].name + '.');

            return;
          }

          io.sockets.emit('performer offline', {
            performer: performerData[0]
          });
        });
      }

      // Set remainder of performers in map (if any) online.
      for (mapIndex in performersOnlineMap) {
        Performer.update({name: mapIndex}, {online: true}).done(function (error, performerData) {
          if (error) {
            console.log('Error while putting online "' + mapIndex + '": ' + error);

            return;
          }

          if (performerData.length === 0) {
            console.log('Got empty performerData after putting online ' + mapIndex + '.');

            return;
          }

          io.sockets.emit('performer online', {
            performer: performerData[0]
          });
        });
      }
    });
  };

  /**
   * Run the main import method.
   *
   * @param {string} what
   */
  this.importPerformerData = function (what) {
    request.get('http://xml.islive.nl/' + what, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        console.log('Error occurred while updating islive data.');

        if (error) {
          console.log('Error: ' + error);
        }

        if (typeof response === 'object' && 'statusCode' in response) {
          console.log('Response status code: ' + response.statusCode);
        }

        return;
      }

      parseString(body, function (error, result) {
        if (error) {
          console.log('Error parsing xml string!');

          return;
        }

        if (what === 'status/online') {
          self.updateOnlinePerformers(result);

          return;
        }

        self.updatePerformerData(result);
      });
    });
  };

  /**
   * Converts data to an object where the key is the performer name.
   *
   * @param {{}} data
   * @returns {{}}
   */
  this.format = function (data) {
    if (typeof data !== 'object') {
      return data;
    }

    var newData = {}
      , i;

    for (i =0; i < data.length; i++) {
      newData[data[i].name] = data[i];
    }

    return newData;
  }

  // Construct.
  setInterval(function () {
    self.importPerformerData('status');
  }, 3600000);

  setInterval(function () {
    self.importPerformerData('status/online');
  }, 10000);

  this.importPerformerData('status');
  this.importPerformerData('status/online');
}

module.exports = new PerformerDataService();

// Other options:
// - http://xml.islive.nl/profiel/v2/?fetch=10
// - http://xml.islive.nl/profiel/uni/v2/?limit=100
