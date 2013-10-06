/**
 * PerformerController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  /* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */

  create: function (req, res) {

  },

  online : function (req, res) {
    Performer.findByOnline(true).done(function (error, performers) {
      return res.json(PerformerDataService.format(performers));
    });
  }
};
