var _ = require('lodash');
var utils = require('../parserUtils');
var eventType = require('../constants').eventType;

function PitchbendParser() {
  this.type = 'pitchbend';
  this.test = /^[\d]{1,4}==?P/;
}
PitchbendParser.prototype = {
  parse: function (s) {
    return utils.parseValue(s);
  },
  mutateState: function (state) {
    if (this.parsed.phrase) {
      state.phrase.pitchbend = this.parsed.value;
    } else {
      state.note.pitchbend = this.parsed.value;
    }
    state.events.push({
      type: eventType.pitchbend,
      value: this.parsed.value
    });
  }
}

module.exports = PitchbendParser;