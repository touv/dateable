var dateable = require('./')
  , assert = require('assert')
  , date = new Date(2012, 04, 17, 21, 10, 35)
  , formatted
  , parsed

dateable.formats.test = '"Testing date" D/M-YYYY, "and time" hh:mm:ss';
formatted = dateable.format(date, 'test');
parsed = dateable.parse(formatted, 'test');

assert.equal(formatted, 'Testing date 17/5-2012, and time 21:10:35');
assert.notStrictEqual(parsed, date);
assert.equal(parsed.getFullYear(), date.getFullYear());
assert.equal(parsed.getMonth(), date.getMonth());
assert.equal(parsed.getDate(), date.getDate());
assert.equal(parsed.getHours(), date.getHours());
assert.equal(parsed.getMinutes(), date.getMinutes());
assert.equal(parsed.getSeconds(), date.getSeconds());
assert.equal(dateable.daysBetween(date, parsed), 0);
assert.equal(dateable.daysBetween(date, new Date(2012, 04, 18, 21, 10, 40)), 1);

console.log('All tests passed');