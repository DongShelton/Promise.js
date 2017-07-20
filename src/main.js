/*
 * @Author: DX
 * @Date:   2017-07-19 09:57:59
 * @Last Modified by:   DX
 * @Last Modified time: 2017-07-20 10:03:10
 */

'use strict';

var p1 = new Promise(function (s, j) {
	console.log("new p1");
	setTimeout(function () {
		console.log("p1 timeout");
		s("p1");
	}, 100);
});
var p2 = new Promise(function (s, j) {
	console.log("new p2");
	setTimeout(function () {
		console.log("p2 timeout");
		s("p2");
	}, 500);
})
var p3 = new Promise(function (s, j) {
	console.log("new p3");
	setTimeout(function () {
		console.log("p3 timeout");
		s("p3");
	}, 1000);
})

Promise.race([p1,p2,p3]).then(function () {
	console.log(arguments);
}, function () {
	console.log(arguments);
});
console.log("end");


