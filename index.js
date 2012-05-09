var formats = exports.formats = {};

var units = exports.units = {
    second  : 1000
  , minute  : 60000
  , day     : 86400000
  , month   : 2592000000
  , year    : 31536000000
};

/**
 * Returns a date as a formatted string
 *
 * @param {Date} date
 * @param {String} format
 * @return {String}
 */

exports.format = function (date, format) {
  var tokens = /Y{2,4}|[MDhms]{1,2}|"[^"]*"|'[^']*'/g;
  
  format = formats[format] || format;
  
  return format.replace(tokens, function (part) {
    switch (part) {
      case 'YYYY':
        return date.getFullYear();
      case 'YY':
        return date.getYear();
      case 'MM':
        return padZero(date.getMonth() + 1);
      case 'M':
        return date.getMonth() + 1;
      case 'DD':
        return padZero(date.getDate());
      case 'D':
        return date.getDate();
      case 'hh':
        return padZero(date.getHours());
      case 'h':
        return date.getHours();
      case 'mm':
        return padZero(date.getMinutes());
      case 'm':
        return date.getMinutes();
      case 'ss':
        return padZero(date.getSeconds());
      case 's':
        return date.getSeconds();
      default:
        return part.slice(1, part.length - 1);
    };
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
    , parts = {}
    , offset = 0;
  
  format = formats[format] || format;
  
  format = format.replace(/"[^"]*"|'[^']*'/g, function (part) {
    string = string.replace(part.slice(1, part.length - 1), '');
    return '';
  });
  
  tokens = format.match(/Y{2,4}|[MDhms]{1,2}/g);
  stringLength = string.length
  
  for (var i = 0; i < tokens.length; i++) {
    index = format.indexOf(tokens[i]) + offset;
    
    if (index - offset < 0) continue;
    
    tokenLength = tokens[i].length;
    parts[tokens[i][0]] = string.substr(index, tokenLength);
    index += tokenLength - 1;
    
    while (++index < stringLength) {
      if (!(/[0-9]/).test(string[index]))
        break;
      
      parts[tokens[i][0]] += string[index];
      offset++;
    }  
  }
  
  return new Date('Y-M-D,h:m:s'.replace(/\w/g, function (part) {
    return parts[part] || 0;
  }));
};

/**
 * Returns the time until a date in a given unit
 *
 * @param {Date} date
 * @param {String} unit
 * @return {int}
 */

exports.until = function (date, unit) {
  return Math.round((end.valueOf() - Date.now()) / units[unit]);
};

/**
 * Returns the time since a date in a given unit
 *
 * @param {Date} date
 * @param {String} unit
 * @return {int}
 */

exports.since = function (date, unit) {
  return - exports.daysUntil(date, unit);
};

/**
 * Returns the number of days between two dates
 *
 * @param {Date} date
 * @return {int}
 */

exports.between = function (start, end, unit) {
  return Math.abs(Math.round((end.valueOf() - start.valueOf()) / units.day));
};

/**
 * Returns the number of days in a month
 *
 * @param {Date|int} year
 * @param {int} [month]
 */

exports.daysInMonth = function (year, month) {
  var date = year;
  
  if (!(date instanceof Date))
    date = new Date(year, month);
  
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

/**
 * Returns all the dates in a month
 *
 * @param {Date|int} year
 * @param {int} [month]
 * @return {Array}
 */

exports.getFullMonth = function (year, month) {
  var dates = []
    , date = year;
  
  if (!(date instanceof Date))
    date = new Date(year, month);
  
  for (var d = 1; d <= exports.daysInMonth(date); d++)
    dates.push(new Date(date.getFullYear(), date.getMonth(), d));
  
  return dates;
};

/**
 * Pads out a number to two digits
 *
 * @param {int} number
 * @return {String}
 */

function padZero (number) {
  return number < 10 ? '0' + number : '' + number;
}