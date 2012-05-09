var oneDay = 1000 * 60 * 60 * 24
  , formats = {};
  
exports.formats = formats;

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
    , parts = {}
    , offset = 0
    , stringLength
    , tokenLength;
  
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

  return new Date(
      parts.Y || 0
    , (parts.M || 1) - 1
    , parts.D || 0
    , parts.h || 0
    , parts.m || 0
    , parts.s || 0
  );
};

/**
 * Returns the number of days until a date
 *
 * @param {Date} date
 * @return {int}
 */

exports.daysUntil = function (date) {
  return Math.round((end.valueOf() - Date.now()) / oneDay);
};

/**
 * Returns the number of days since a date
 *
 * @param {Date} date
 * @return {int}
 */

exports.daysSince = function (date) {
  return -exports.daysUntil(date);
};

/**
 * Returns the number of days between two dates
 *
 * @param {Date} date
 * @return {int}
 */

exports.daysBetween = function (start, end) {
  return Math.abs(Math.round((end.valueOf() - start.valueOf()) / oneDay));
};

/**
 * Returns the number of days in a month
 *
 * @param {Date|int} year
 * @param {int} month
 */

exports.daysInMonth = function (year, month) {
  var date = year;
  
  if (!(date instanceof Date))
    date = new Date(year, month);
  
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Pads out a number to two digits
 *
 * @param {int} number
 * @return {String}
 */

function padZero (number) {
  return number < 10 ? '0' + number : '' + number;
}