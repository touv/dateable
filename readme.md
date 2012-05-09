# dateable
A small library that provides a few very useful methods for date manipulation, including a formatter and a parser.

## Install
	$ npm install dateable
	
## How
```javascript
var dateable = require('dateable');

var str = dateable.format(new Date(), 'YYYY-MM-DD, hh:mm'); // e.g., 2012-03-24, 22:10

dateable.parse(str, 'YY-MM-DD, hh:mm) // Returns the original date
```

If you want to include text in the formatting, just escape the text with either ' or ".

```javascript
var date = new Date(2009, 6, 23);

dateable.format(date, 'D/M YYYY "was the day I went to the moon!"') // 23/5 2009 was the day I went to the moon!
```
## Why
Because dates in javascript are a fucking pain in the ass!