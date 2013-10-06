/**
 * Performer
 *
 * @module      :: Model
 * @description :: The information available
 *
 */

module.exports = {

  attributes: {

    age : 'integer',
    language : 'string',
    voiceId : 'integer',
    gender : 'string',
    name :  {
      type: 'string',
      index: true
    },
    since : 'integer',
    online :  {
      type: 'boolean',
      index: true,
      defaultsTo: false
    }

  }

};

// Wre can use type "array" for multiple values, such as languages (otherwise we'd need a separator, which sucks).
