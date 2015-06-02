var randomColor = require('../random-color');

module.exports = {

  'randomColor_callRandomColor_ResultLengthIs7': function (test) {

    var result = randomColor();

    test.equal(result.length, 7, '');
    test.done();
  },

  'randomColor_callRandomColor_ResultCharAt0Is#': function (test) {
    var result = randomColor();

    test.equal(result.charAt(0), '#', '');
    test.done();
  }
};
