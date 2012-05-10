var dateable = require('./')
  , assert = require('assert');

dateable.formats.test = '"Testing date" ddd D. MM YYYY, "and time" hh:mm:ss a';


var tests = module.exports = {
  'test format': function () {
    var date = new Date(2012, 04, 17, 21, 10, 35)
      , expected = 'Testing date Thu 17. 05 2012, and time 09:10:35 pm';

    assert.equal(dateable.format(date, 'test'), expected);
  },
  
  'test parse': function () {
    var date = ranDate()
      , expected = date.valueOf();
      
    date = dateable.format(date, 'test');
    assert.equal(dateable.parse(date, 'test').valueOf(), expected);
  },
  
  'test when': function () {
    var date = new Date();
    console.log(date);
    date.setHours(date.getHours() - 1);
    console.log(date);
    assert.equal(dateable.when(date), 'an hour ago');
  }
};


function ranDate () {
  var date = new Date();
  
  date.setFullYear(2012);
  date.setMonth(ranNo(2, 4));
  date.setDate(ranNo(28, 1));
  date.setHours(ranNo(24));
  date.setMinutes(ranNo(59));
  date.setSeconds(ranNo(59));
  date.setMilliseconds(0);

  return date;
};

function ranNo (max, offset) {
  return Math.floor(Math.random() * (max + 1)) + (offset || 0);
}

for (var i in tests)
 tests[i]();
 
console.log('all tests passed');