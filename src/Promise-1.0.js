/*
 * @Author: DX
 * @Date:   2017-07-19 09:45:09
 * @Last Modified by:   DX
 * @Last Modified time: 2017-07-20 14:35:54
 */
var Promise;
(function() {
	if (!Promise) {
		'use strict';
		/**
		 * Object.defineProperty polyfill
		 */
		if(!document.getElementsByClassName){
			var nativeFunc = Object.defineProperty ? Object.defineProperty : function () {};
			Object.defineProperty = function (target, key, description) {
				if(Object.prototype.isPrototypeOf(target)){
					target[key] = description.value;
				}else {
					nativeFunc(target, key, description);
				}
			}
		}
		/**
		 * The Promise's constructor
		 * Promise 的构造函数
		 * @param {function} then 
		 * @return {Object} 返回一个 Promise 对象
		 */
		Promise = function(then) {
			/**
			 * This checkpoint confirm that the parameter is a function and it is called by new
			 * 这里的检查确保了参数是一个函数，且此方法是由 new 操作符调用
			 */
			var _this = this;
			if (typeof then != "function") {
				throw new TypeError(then + " is not a function");
			}
			if (!Promise.prototype.isPrototypeOf(this) || this["<state>"]) {
				throw new TypeError("calling a builtin Promise constructor without new is forbidden");
			}
			/**
			 * Initialize the Promise state
			 * 初始化 Promise 对象的状态
			 */
			var cache = Object.create ? Object.create(null) : {};
			cache.isDone = false;
			cache.isFulfilled = false;
			cache.isRejected = false;
			/**
			 * These are used to resolve a Promise, don't excute any action if this Promise has been resolved, 
			 * else define the property state and value or reason. The standard Promise's property is forbade to
			 * read, but there is no other way to define a not callable property, so there define property 
			 * unconfigurable.
			 * 这里的方法用来决议一个 Promise,如果这个 Promise 已经被决议，则不执行任何操作。标准的方法中，所有
			 * 属性为内置属性，均不可读，但是这里没有设置内置属性的方法，所以将属性设置为不可配置。
			 */
			var resolve = function(value) {
				if (cache.isDone) {
					return;
				} else {
					Object.defineProperty(_this, "<state>", {
						value: "fulfilled",
						writable: false,
						configurable: false,
						enumerable: false
					});
					Object.defineProperty(_this, "<value>", {
						value: value,
						writable: false,
						configurable: false,
						enumerable: false
					});
					cache.value = value;
					cache.isDone = true;
					cache.isFulfilled = true;
				}
			}
			var reject = function(reason) {
				if (cache.isDone) {
					return;
				} else {
					Object.defineProperty(_this, "<state>", {
						value: "rejected",
						writable: false,
						configurable: false,
						enumerable: false
					});
					Object.defineProperty(_this, "<reason>", {
						value: reason,
						writable: false,
						configurable: false,
						enumerable: false
					});
					cache.reason = reason;
					cache.isDone = true;
					cache.isRejected = true;
				}
			}
			/**
			 * Resolve this Promise
			 * 决议这个 Promise
			 */
			try {
				then(resolve, reject);
			} catch (e) {
				if (!cache.isRejected) {
					console.error(e);
					reject(e);
				}
			} finally {
				if (!cache.isDone) {
					Object.defineProperty(_this, "<state>", {
						value: "pending",
						writable: false,
						configurable: true,
						enumerable: false
					});
				}
			}
			/**
			 * This is .then() and .catch() methods. These methods are defferent from standard promise, 
			 * the standard method should be a microtask and called when the current stack is empty, but 
			 * consider the browsers, which do not support Promise, do not support microtask too, so 
			 * calls it as a task. 
			 * 这里定义了 .then() 和 .catch() 方法。这里与标准的方法不同，在标准的 Promise 中，这些方法
			 * 应当作为一个 microtask，并且在当前执行栈为空的时候调用，但是考虑到不支持 Promise 的浏
			 * 览器同时也不支持 microtask，所以将其作为一个 task 来调用。
			 */
			this.then = function(resolved, rejected) {
				return new Promise(function(resolve, reject) {
					var t = setInterval(function () {
						if (cache.isDone) {
							clearInterval(t);
							if (cache.isFulfilled) {
								resolve(resolved(cache.value));
							}
							if (cache.isRejected) {
								reject(rejected(cache.reason));
							}
						}
					}, 1);
				});
			};
			/**
			 * Note: In the IE8 mode and below, reserved words must not be used to be a property of 
			 * object.
			 * 在 IE8 及以下的浏览器中，保留字不允许用作为一个对象的属性。
			 */
			this["catch"] = function(rejected) {
				return new Promise(function(resolve, reject) {
					var t = setInterval(function () {
						if (cache.isDone) {
							clearInterval(t);
							if (cache.isFulfilled) {
								resolve(resolved(cache.value));
							}
							if (cache.isRejected) {
								reject(rejected(cache.reason));
							}
						}
					}, 1);
				});
			}
		}
		/**
		 * Promise.resolve
		 */
		Promise.resolve = function(value) {
			if (typeof value == "object") {
				if (typeof value.then == "function") {
					return new Promise(value.then);
				}
			}
			return new Promise(function(resolve, reject) {
				resolve(value);
			});
		}
		/**
		 * Promise.reject
		 */
		Promise.reject = function(reason) {
			return new Promise(function(resolve, reject) {
				reject(reason);
			});
		}
		/**
		 * Promise.all
		 */
		Promise.all = function(args) {
			var promises = [];
			var values = [];
			/**
			 * The standard method will throws a error if argument is not a iterator, but consider that 
			 * this polyfill will used for those intolerable browers, so it just supports array.
			 * 标准的方法会在参数不是一个 iterator 的时候抛出错误，但是考虑到这个工具将用在一些万恶的
			 * 浏览器上面，所以仅支持 Array。
			 */
			if (args instanceof Array) {
				for (var i = args.length - 1; i >= 0; i--) {
					if (args instanceof Promise) {
						promises.push(args[i]);
					} else {
						promises.push(Promise.resolve(args[i]));
					}
				}
			} else {
				return new Promise(function(resolve, reject) {
					reject(new TypeError("Argument of Promise.all is not a array"));
				});
			}
			return new Promise(function (resolve, reject) {
				for (var i = promises.length - 1; i >= 0; i--) {
					promises[i].then(function(value) {
						values.push(value);
						if(values.length === promises.length){
							resolve(values);
						}
					}, function(reason) {
						reject(reason);
					});
				}
			});
		}
		/**
		 * Promise.race
		 */
		Promise.race = function (args) {
			var promises = [];
			/**
			 * The standard method will throws a error if argument is not a iterator, but consider that 
			 * this polyfill will used for those intolerable browers, so it just supports array.
			 * 标准的方法会在参数不是一个 iterator 的时候抛出错误，但是考虑到这个工具将用在一些万恶的
			 * 浏览器上面，所以仅支持 Array。
			 */
			if (args instanceof Array) {
				for (var i = args.length - 1; i >= 0; i--) {
					if (args instanceof Promise) {
						promises.push(args[i]);
					} else {
						promises.push(Promise.resolve(args[i]))
					}
				}
			} else {
				return new Promise(function(resolve, reject) {
					reject(new TypeError("Argument of Promise.all is not a array"));
				});
			}
			return new Promise(function (resolve, reject) {
				for (var i = promises.length - 1; i >= 0; i--) {
					promises[i].then(function (value) {
						resolve(value);
					}, function (reason) {
						reject(reason);
					});
				}
			});
		}
		/**
		 * Support requirejs
		 * 支持 requirejs
		 */
		var define;
		if(define && require && requirejs){
			define(function () {
				return Promise;
			});
		}
	}
})();