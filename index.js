var fs = require('fs')
  , path = require('path')
  , files = fs.readdirSync('./lang')
  , langs = {}
  , lang

files.forEach(function (filename) {
  var language = filename.replace(/\.json$/, '');
  
  langs[language] = require(path.resolve('lang', filename));
});

var units = exports.units = {
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
 * Set the language
 *
 * @param {String|Object} language
 * @api public
 */

exports.setLang = function (language) {
  if (typeof language == 'object')
    lang = language;
  else if (langs[language])
    lang = langs[language];
};

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
        return ('' + date.Y).slice(-2);
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
  var tokenizer = /Y{2,4}|[Md]{1,4}|[DHhms]{1,2}|[Aa]/g 
    , offset = 0
    , parts = {}
    , token
    , index
    , part
  
  format = formats[format] || format;
  // Strip the string from the escaped parts of the format
  format = format.replace(/"[^"]*"|'[^']*'/g, function (str) {
    string = string.replace(str.slice(1, -1), '');
    return '';
  });
  
  stringLength = string.length;
  
  while (token = tokenizer.exec(format)) {
    index = token.index + offset;
    
    tokenLength = token[0].length;
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

    if (/[Md]{3,4}/.test(token[0]))
      part = lang[token[0]].indexOf(part);
    else if (token[0][0] === 'M')
      part--;
      
    parts[token[0][0]] = part;
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
 * @param {String|int} hours
 * @return {int}
 * @api public
 */

exports.toAmPm = function (hours) {
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
 * @param {String} [unit]
 * @return {String}
 * @api public
 */

exports.when = function (date, unit) {
  var diff = date.valueOf() - Date.now()
    , time = 'present'

  unit = unit || determineUnit(diff);
  diff = Math.round(diff / units[unit])

  if (diff !== 0)
    time = diff < 0 ? 'past' : 'future';

  diff = Math.abs(diff);
  
  return printify(lang.time[time], pluralize(diff, unit));
};

/**
 * Returns the difference between two dates
 *
 * @param {Date} start
 * @param {Date} end
 * @param {String} [unit]
 * @return {String} 
 * @api public
 */

exports.diff = function (start, end, unit) {
  var diff = start.valueOf() - end.valueOf()
    , unit = unit || determineUnit(diff)
  
  diff = Math.abs(Math.round(diff / units[unit]))
  
  return pluralize(diff, unit);
};

/**
 * Returns the value in either plural or singular form
 *
 * @param {int} value
 * @param {String} unit
 * @return {String}
 * @api private
 */

function pluralize (value, unit) {
  var form = lang.units[unit][value > 1 ? 1 : 0];
  
  return printify(form, value);
};

/**
 * Determine the unit that's best suited for
 * displaying the given period of time
 *
 * @param {int} ms
 * @return {String}
 * @api private
 */

function determineUnit (ms) {
  var unit;
  
  ms = Math.abs(ms);
  
  for (unit in units) {
    if (ms > units[unit])
      break;
  }
  
  return unit;
}

/**
 * Sprinf-like method for parsing output strings
 *
 * @param {String}
 * @return {String}
 * @api private
 */

function printify (string) {
  var args = [].slice.call(arguments, 1)
    , offset = 0;
    
  return string.replace(/%s([0-9])*/g, function (s, n) {
    n = n || offset;
   
    if (args[n] && Array.isArray(args[n])) 
      args[n] = printify.apply(null, args[n]);

    offset++;

    return args[n];
  });
}


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
    
  // Handle years
  if (obj.Y && obj.Y.length == 2) {
    if (parseInt(obj.Y, 10) > 50)
      obj.Y = '19' + obj.Y;
    else
      obj.Y = '20' + obj.Y;
  }
  
  date.setFullYear(obj.Y || 0);
  date.setMonth(obj.M || 0);
  date.setDate(obj.D || 0);
  date.setHours(obj.H || 0);
  date.setMinutes(obj.m || 0);
  date.setSeconds(obj.s || 0);

  return date;
}

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
}