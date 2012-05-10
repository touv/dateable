var fs = require('fs')
  , path = require('path')
  , files = fs.readdirSync('./lang')
  , langs = {}
  , lang

files.forEach(function (filename) {
  var language = filename.replace(/\.json$/, '');
  
  langs[language] = require(path.resolve('lang', filename));
});

var units = exports.units = {
    years   : 31536000000
  , months  : 2592000000
  , weeks   : 604800000
  , days    : 86400000
  , hours   : 3600000
  , minutes : 60000
  , seconds : 1000
};

var formats = exports.formats = {};

// Set the default language
var lang = langs['en-us'];


/**
 * Returns a date as a formatted string
 *
 * @param {Date} date
 * @param {String} format
 * @return {String}
 */

exports.format = function (date, format) {
  var tokens = /Y{2,4}|[Md]{1,4}|[DHhms]{1,2}|[Aa]|"[^"]*"|'[^']*'/g
    , date = toObject(date);
  
  format = formats[format] || format;

  return format.replace(tokens, function (part) {
    switch (part) {
      case 'YYYY':
        return pad(date.Y, 3);
      case 'YY':
        return pad(date.Y);
      case 'MMMM':
      case 'MMM':
        return lang[part][date.M];
      case 'MM':
        return pad(date.M + 1);
      case 'M':
        return date.M + 1;
      case 'DD':
        return pad(date.D);
      case 'D':
        return date.D;
      case 'dddd':
      case 'ddd':
        return lang[part][date.d];
      case 'A':
        return date.A;
      case 'a':
        return date.a
      case 'H':
        return date.H
      case 'HH':
        return pad(date.H);
      case 'hh':
        return pad(date.h);
      case 'h':
        return date.h
      case 'mm':
        return pad(date.m);
      case 'm':
        return date.m
      case 'ss':
        return pad(date.s);
      case 's':
        return date.s;
      default:
        return part.slice(1, -1);
    }
  });
};

/**
 * Parses a date based on a format
 *
 * @param {String} string
 * @param {String} format
 * @return {Date} 
 */

exports.parse = function (string, format) {
  var tokens
    , index
    , stringLength
    , tokenLength
    , part
    , parts = {}
    , offset = 0;
  
  format = formats[format] || format;

  // Strip the string from the escaped parts of the format
  format = format.replace(/"[^"]*"|'[^']*'/g, function (str) {
    string = string.replace(str.slice(1, -1), '');
    return '';
  });
  
  // Generate tokens
  tokens = format.match(/Y{2,4}|[Md]{1,4}|[DHhms]{1,2}|[Aa]/g);
  stringLength = string.length;
  
  for (var i = 0; i < tokens.length; i++) {
    index = format.indexOf(tokens[i]) + offset;
    
    if (index - offset < 0) continue;
    
    tokenLength = tokens[i].length;
    part = string.substr(index, tokenLength);
    index += tokenLength - 1;

    // Remove characters that are not part of the format
    // e.g, MMMM > May
    part = part.replace(/\W+.*/, function (str) {
      index -= str.length;
      return '';
    });
    
    // Looks ahead for characters beyond the
    // specified format, e.g, D > 9
    while (++index < stringLength) {
      if (!(/\d|\w/).test(string[index]))
        break;
      
      part += string[index];
    }
    
    offset += part.length - tokenLength;
    
    if (/[Md]{3,4}/.test(tokens[i])) {
      part = lang[tokens[i]].indexOf(part) || '';
      if (tokens[i][0] === 'M') part++
    }
    
    parts[tokens[i][0]] = part;
  }
  
  return toDate(parts);
};

/**
 * Converts from 12-hours to 24-hours
 *
 * @param {String|int} hours
 * @param {String} abbr
 * @return {int}
 * @api public
 */

exports.fromAmPm = function (hours, abbr) {
  hours = parseInt(hours, 10);
  abbr = abbr
    .toLowerCase()
    .replace(/\./g, '');

  if (abbr == 'pm' && hours < 12)
    return hours + 12;
  
  return hours;
};

/**
 * Converts from 24-horus to 12-hours
 *
 * @param {String|Date|int} hours
 * @return {int}
 * @api public
 */

exports.toAmPm = function (hours) {
  if (hours instanceof Date)
    hours = hours.getHours();
  else
    hours = parseInt(hours, 10);
  
  if (hours > 12)
    return hours - 12;
  
  return hours;
};

/**
 * Returns either "am" or "pm", depending on the input
 *
 * @param {String|Date|int} hours
 * @return {int}
 * @api public
 */

exports.isAmPm = function (hours) {
  if (hours instanceof Date)
    hours = hours.getHours();
  else
    hours = parseInt(hours, 10);
  
  return hours >= 12 ? 'pm' : 'am';
}

/**
 * Answers the question "when?"
 * Returned unit can be specified or omitted
 *
 * @param {Date} date
 * @param {String} unit
 * @return {String}
 * @api public
 */

exports.when = function (date, unit) {
  var diff = Date.now() - date.valueOf()
    , result = exports.inUnit(diff, unit)
    , time = 'present';
    
  if (result.value < 0) time = 'future';
  else if (result.value > 0) time = 'past';
  
  result.value = Math.abs(result.value);
  
  return parseString(lang.time[time], parseString(result.unit, result.value));
};

/**
 * Returns the number of days between two dates
 *
 * @param {Date} date
 * @return {int}
 * @api public
 */

exports.diff = function (start, end, unit) {
  var diff = start.valueOf() - end.valueOf()
    , result = inUnit(diff, unit);
  
  return parseString(result.unit, result.value);
};

/**
 * Calculates a timeframe in a given unit.
 * If unit is omitted, it will try to find the one that's best suited
 * Returns an Object containing the value and the unit
 *
 * @param {int} ms
 * @param {String} [unit]
 * @return {Object}
 * @api public
 */

exports.inUnit = function (ms, unit) {
  var keys = Object.keys(units)
    , result = {}
    , value
    
  if (!unit || !units[unit]) {
    for (var i = 0; i < keys.length; i++) {
      value = ms / units[unit];
      unit = keys[i];
      if (Math.abs(value) >= 1)
        break;
    }
  } else {
    value = ms / units[unit];
  }
  
  result.value = Math.round(value);
  
  if (Math.abs(value) > 1 && lang.units[unit][1])
    result.unit = lang.units[unit][1];
  else
    result.unit = lang.units[unit][0];
    
  return result;
};

/**
 * Sprinf-like method for parsing output strings
 *
 * @param {String}
 * @return {String}
 * @api private
 */

function parseString (string) {
  var args = [].slice.call(arguments, 1)
    , offset = 0;

  return string.replace(/%d([0-9])*/g, function (s, n) {
    n = (n || 0 + offset);  
    offset++;
    
    return args[n];
  });
};

/**
 * Pads a number with zeros
 *
 * @param {int} number
 * @param {int} [zeros]
 * @return {String}
 * @api private
 */

function pad (number, zeros) {
  return number < Math.pow(10, zeros || 1) 
    ? '0' + number 
    : '' + number;
}

/**
 * Converts an Object to a date
 *
 * @param {Object} parts
 * @return {Date}
 * @api private
 */
 
function toDate (obj) {
  var date = new Date(0)
    , abbr = obj.A || obj.a
  
  // Handle AM/PM
  if (abbr && obj.h)
    obj.H = exports.fromAmPm(obj.h, abbr);
  
  date.setFullYear(obj.Y || 0);
  date.setMonth((obj.M || 1) - 1);
  date.setDate(obj.D || 0);
  date.setHours(obj.H || 0);
  date.setMinutes(obj.m || 0);
  date.setSeconds(obj.s || 0);
  
  return date;
};

/**
 * Converts a date to an Object
 *
 * @param {Date} date
 * @return {Object}
 * @api private
 */

function toObject (date) {
  var obj = {
      Y: date.getFullYear()
    , y: date.getYear()
    , M: date.getMonth()
    , D: date.getDate()
    , d: date.getDay()
    , H: date.getHours()
    , h: date.getHours()
    , m: date.getMinutes()
    , s: date.getSeconds()
  };
  
  obj.h = exports.toAmPm(obj.H);
  obj.a = exports.isAmPm(obj.H);
  obj.A = obj.a.toUpperCase();
  
  return obj;
};