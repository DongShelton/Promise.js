# Promise.js
The ES6 Promise polyfill
****
This polyfill support `IE5+` browers, and it support RequireJs.
### Attentions
This polyfill has a little bit difference with the standard Promise. The standard method `.then()` and `.catch()` should be executed as a microtask, that means the callback function should be execeted when the stack is empty. But consider that the browsers, which do not support Promise, do not support microtask too, and the feature of microtask also can't be codes by JavaScript, it depends on the JavaScript engine, so this polyfill will executes `.then()` and `.catch()` as a task. Consequently, there may be some differences.

#### For example:
```javascript
console.log("script start");

setTimeout(function () {
	console.log("timeout");
}, 0);

Promise.resolve().then(function () {
	console.log("promise1");
}, function () {}).then(function () {
	console.log("promise2");
}, function () {});

console.log("script end");
```
The majar browsers which accord W3C spec will log:
```
script start
script end
promise1
promise2
timeout
```
But use this polyfill to fix those browsers which do not support Promise(Yeah, you konw I'm talking about IE...) will log:
```
script start
script end
timeout
promise1
promise2
```

The other difference is that the internal properties are exposed to outside, which means you can read the properties of Promise. For example, you could code `promise["<state>"]` to read the interval property, in IE9/10/11, you can't configure these internal properties, but in the below, you are able to change the value of that properties, but suggest that please do not do that.


