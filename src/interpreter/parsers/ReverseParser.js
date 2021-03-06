var _ = require('lodash');
var parser = require('./_parser');
var macroType = require('../constants').macroType;
var eventType = require('../constants').eventType;
var parserUtils = require('../parserUtils');
var SubInterpreter = require('../SubInterpreter');

function ReverseParser(macros) {
  this.type = 'reverse';
  this.test = /^reverse/; ///for code highlighting only
}

var prototype = {
  match: function match(s) {
    var startTest = /^reverse\(/.exec(s);
    if (!startTest) return false;
    var bracketed = parserUtils.getBracketed(s, startTest[0].length);
    if (!bracketed) return false;
    this.parsed = {
      part: bracketed,
      definitionStart: startTest[0].length
    };
    this.string = startTest[0] + bracketed + ')';
    return true;
  },
  mutateState: function (state, interpreter) {

    var initialState = interpreter.next || interpreter.getNextState();
    var subInterpreter = new SubInterpreter(initialState, interpreter);
    var cursor = this.origin.start + this.parsed.definitionStart;
    var parsers = interpreter.parse(this.parsed.part, cursor);
    var states = subInterpreter.generateState(parsers).filter(s => s.parser.duration);
    this.startTick = states[0].time.tick;

    states.reverse();
    states[0].time.tick = this.startTick;
    states.forEach((s, i) => {
      if (i > 0) {
        var prev = states[i - 1];
        s.time.tick = prev.time.tick;
        s.time.tick += prev.parser.duration;
      }

      //apply constraints
      if (interpreter && interpreter.master) {
        interpreter.master.states.forEach(function (ms) {
          if (ms.tick <= s.time.tick) {
            _.merge(s, ms.state);
          }
        });
      }

    });

    states.forEach(s =>
      s.modifiers.filter(m => m.fn).forEach(m => {
        m.fn(s);
      }));

    interpreter.appendState(states);

    var finalState = _.cloneDeep(interpreter.getTopState());
    if (finalState.parser.next) {
      finalState.parser.next(finalState);
    }
    this.endTick = finalState.time.tick;

  },
  getEvents: function () {
    return [
      {
        tick: this.startTick,
        type: eventType.substitution,
        origin: this.origin //ref to string position
      },
      {
        tick: this.endTick,
        type: eventType.substitutionEnd,
        origin: this.origin
      }
    ];
  },
  continue: true
}

ReverseParser.prototype = _.extend({}, parser, prototype);
module.exports = ReverseParser;