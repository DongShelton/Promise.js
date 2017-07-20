/*
 * @Author: DX
 * @Date:   2017-07-19 09:57:59
 * @Last Modified by:   DX
 * @Last Modified time: 2017-07-20 15:09:46
 */

'use strict';
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