## NodeJS Promises/A+

### Install

```js
npm install fulfill
```

### Example

```js
var Promise = require("fulfill");
var duplicate = function (value) {
	return new Promise(function (p) {
		setTimeout(function () {
			return p.fulfill(p * 2);
		}, 500);
	});
};

duplicate(5).then(function (value) {
	return duplicate(value); // value = 10
}).then(function (value) {
	console.log(value); // value = 20
});
```
