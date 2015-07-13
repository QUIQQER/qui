!function e(t,n,r){function i(s,u){if(!n[s]){if(!t[s]){var f="function"==typeof require&&require;if(!u&&f)return f(s,!0);if(o)return o(s,!0);var c=new Error("Cannot find module '"+s+"'");throw c.code="MODULE_NOT_FOUND",c}var a=n[s]={exports:{}};t[s][0].call(a.exports,function(e){var n=t[s][1][e];return i(n?n:e)},a,a.exports,e,t,n,r)}return n[s].exports}for(var o="function"==typeof require&&require,s=0;s<r.length;s++)i(r[s]);return i}({1:[function(e,t){t.exports=function(){var t=e("events"),n={};return n.createDomain=n.create=function(){function e(e){n.emit("error",e)}var n=new t.EventEmitter;return n.add=function(t){t.on("error",e)},n.remove=function(t){t.removeListener("error",e)},n.bind=function(t){return function(){var n=Array.prototype.slice.call(arguments);try{t.apply(null,n)}catch(r){e(r)}}},n.intercept=function(t){return function(n){if(n)e(n);else{var r=Array.prototype.slice.call(arguments,1);try{t.apply(null,r)}catch(n){e(n)}}}},n.run=function(t){try{t()}catch(n){e(n)}return this},n.dispose=function(){return this.removeAllListeners(),this},n.enter=n.exit=function(){return this},n},n}.call(this)},{events:2}],2:[function(e,t){function n(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function r(e){return"function"==typeof e}function i(e){return"number"==typeof e}function o(e){return"object"==typeof e&&null!==e}function s(e){return void 0===e}t.exports=n,n.EventEmitter=n,n.prototype._events=void 0,n.prototype._maxListeners=void 0,n.defaultMaxListeners=10,n.prototype.setMaxListeners=function(e){if(!i(e)||0>e||isNaN(e))throw TypeError("n must be a positive number");return this._maxListeners=e,this},n.prototype.emit=function(e){var t,n,i,u,f,c;if(this._events||(this._events={}),"error"===e&&(!this._events.error||o(this._events.error)&&!this._events.error.length)){if(t=arguments[1],t instanceof Error)throw t;throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[e],s(n))return!1;if(r(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:for(i=arguments.length,u=new Array(i-1),f=1;i>f;f++)u[f-1]=arguments[f];n.apply(this,u)}else if(o(n)){for(i=arguments.length,u=new Array(i-1),f=1;i>f;f++)u[f-1]=arguments[f];for(c=n.slice(),i=c.length,f=0;i>f;f++)c[f].apply(this,u)}return!0},n.prototype.addListener=function(e,t){var i;if(!r(t))throw TypeError("listener must be a function");if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",e,r(t.listener)?t.listener:t),this._events[e]?o(this._events[e])?this._events[e].push(t):this._events[e]=[this._events[e],t]:this._events[e]=t,o(this._events[e])&&!this._events[e].warned){var i;i=s(this._maxListeners)?n.defaultMaxListeners:this._maxListeners,i&&i>0&&this._events[e].length>i&&(this._events[e].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[e].length),"function"==typeof console.trace&&console.trace())}return this},n.prototype.on=n.prototype.addListener,n.prototype.once=function(e,t){function n(){this.removeListener(e,n),i||(i=!0,t.apply(this,arguments))}if(!r(t))throw TypeError("listener must be a function");var i=!1;return n.listener=t,this.on(e,n),this},n.prototype.removeListener=function(e,t){var n,i,s,u;if(!r(t))throw TypeError("listener must be a function");if(!this._events||!this._events[e])return this;if(n=this._events[e],s=n.length,i=-1,n===t||r(n.listener)&&n.listener===t)delete this._events[e],this._events.removeListener&&this.emit("removeListener",e,t);else if(o(n)){for(u=s;u-->0;)if(n[u]===t||n[u].listener&&n[u].listener===t){i=u;break}if(0>i)return this;1===n.length?(n.length=0,delete this._events[e]):n.splice(i,1),this._events.removeListener&&this.emit("removeListener",e,t)}return this},n.prototype.removeAllListeners=function(e){var t,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[e]&&delete this._events[e],this;if(0===arguments.length){for(t in this._events)"removeListener"!==t&&this.removeAllListeners(t);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[e],r(n))this.removeListener(e,n);else for(;n.length;)this.removeListener(e,n[n.length-1]);return delete this._events[e],this},n.prototype.listeners=function(e){var t;return t=this._events&&this._events[e]?r(this._events[e])?[this._events[e]]:this._events[e].slice():[]},n.listenerCount=function(e,t){var n;return n=e._events&&e._events[t]?r(e._events[t])?1:e._events[t].length:0}},{}],3:[function(e,t){function n(){if(!s){s=!0;for(var e,t=o.length;t;){e=o,o=[];for(var n=-1;++n<t;)e[n]();t=o.length}s=!1}}function r(){}var i=t.exports={},o=[],s=!1;i.nextTick=function(e){o.push(e),s||setTimeout(n,0)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=r,i.addListener=r,i.once=r,i.off=r,i.removeListener=r,i.removeAllListeners=r,i.emit=r,i.binding=function(){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},{}],4:[function(e,t){"use strict";function n(){}function r(e){try{return e.then}catch(t){return m=t,_}}function i(e,t){try{return e(t)}catch(n){return m=n,_}}function o(e,t,n){try{e(t,n)}catch(r){return m=r,_}}function s(e){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._32=0,this._8=null,this._89=[],e!==n&&v(e,this)}function u(e,t,r){return new e.constructor(function(i,o){var u=new s(n);u.then(i,o),f(e,new h(t,r,u))})}function f(e,t){for(;3===e._32;)e=e._8;return 0===e._32?void e._89.push(t):void p(function(){var n=1===e._32?t.onFulfilled:t.onRejected;if(null===n)return void(1===e._32?c(t.promise,e._8):a(t.promise,e._8));var r=i(n,e._8);r===_?a(t.promise,m):c(t.promise,r)})}function c(e,t){if(t===e)return a(e,new TypeError("A promise cannot be resolved with itself."));if(t&&("object"==typeof t||"function"==typeof t)){var n=r(t);if(n===_)return a(e,m);if(n===e.then&&t instanceof s)return e._32=3,e._8=t,void l(e);if("function"==typeof n)return void v(n.bind(t),e)}e._32=1,e._8=t,l(e)}function a(e,t){e._32=2,e._8=t,l(e)}function l(e){for(var t=0;t<e._89.length;t++)f(e,e._89[t]);e._89=null}function h(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}function v(e,t){var n=!1,r=o(e,function(e){n||(n=!0,c(t,e))},function(e){n||(n=!0,a(t,e))});n||r!==_||(n=!0,a(t,m))}var p=e("asap/raw"),m=null,_={};t.exports=s,s._83=n,s.prototype.then=function(e,t){if(this.constructor!==s)return u(this,e,t);var r=new s(n);return f(this,new h(e,t,r)),r}},{"asap/raw":8}],5:[function(e,t){"use strict";function n(e){var t=new r(r._83);return t._32=1,t._8=e,t}{var r=e("./core.js");e("asap/raw")}t.exports=r;var i=n(!0),o=n(!1),s=n(null),u=n(void 0),f=n(0),c=n("");r.resolve=function(e){if(e instanceof r)return e;if(null===e)return s;if(void 0===e)return u;if(e===!0)return i;if(e===!1)return o;if(0===e)return f;if(""===e)return c;if("object"==typeof e||"function"==typeof e)try{var t=e.then;if("function"==typeof t)return new r(t.bind(e))}catch(a){return new r(function(e,t){t(a)})}return n(e)},r.all=function(e){var t=Array.prototype.slice.call(e);return new r(function(e,n){function i(s,u){if(u&&("object"==typeof u||"function"==typeof u)){if(u instanceof r&&u.then===r.prototype.then){for(;3===u._32;)u=u._8;return 1===u._32?i(s,u._8):(2===u._32&&n(u._8),void u.then(function(e){i(s,e)},n))}var f=u.then;if("function"==typeof f){var c=new r(f.bind(u));return void c.then(function(e){i(s,e)},n)}}t[s]=u,0===--o&&e(t)}if(0===t.length)return e([]);for(var o=t.length,s=0;s<t.length;s++)i(s,t[s])})},r.reject=function(e){return new r(function(t,n){n(e)})},r.race=function(e){return new r(function(t,n){e.forEach(function(e){r.resolve(e).then(t,n)})})},r.prototype["catch"]=function(e){return this.then(null,e)}},{"./core.js":4,"asap/raw":8}],6:[function(e,t){"use strict";function n(){if(u.length)throw u.shift()}function r(e){var t;t=s.length?s.pop():new i,t.task=e,o(t)}function i(){this.task=null}var o=e("./raw"),s=[],u=[],f=o.makeRequestCallFromTimer(n);t.exports=r,i.prototype.call=function(){try{this.task.call()}catch(e){r.onerror?r.onerror(e):(u.push(e),f())}finally{this.task=null,s[s.length]=this}}},{"./raw":7}],7:[function(e,t){(function(e){"use strict";function n(e){u.length||(s(),f=!0),u[u.length]=e}function r(){for(;c<u.length;){var e=c;if(c+=1,u[e].call(),c>a){for(var t=0,n=u.length-c;n>t;t++)u[t]=u[t+c];u.length-=c,c=0}}u.length=0,c=0,f=!1}function i(e){var t=1,n=new l(e),r=document.createTextNode("");return n.observe(r,{characterData:!0}),function(){t=-t,r.data=t}}function o(e){return function(){function t(){clearTimeout(n),clearInterval(r),e()}var n=setTimeout(t,0),r=setInterval(t,50)}}t.exports=n;var s,u=[],f=!1,c=0,a=1024,l=e.MutationObserver||e.WebKitMutationObserver;s="function"==typeof l?i(r):o(r),n.requestFlush=s,n.makeRequestCallFromTimer=o}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],8:[function(e,t){(function(n){"use strict";function r(e){f.length||(o(),c=!0),f[f.length]=e}function i(){for(;a<f.length;){var e=a;if(a+=1,f[e].call(),a>l){for(var t=0,n=f.length-a;n>t;t++)f[t]=f[t+a];f.length-=a,a=0}}f.length=0,a=0,c=!1}function o(){var t=n.domain;t&&(s||(s=e("domain")),s.active=n.domain=null),c&&u?setImmediate(i):n.nextTick(i),t&&(s.active=n.domain=t)}var s,u="function"==typeof setImmediate;t.exports=r;var f=[],c=!1,a=0,l=1024;r.requestFlush=o}).call(this,e("_process"))},{_process:3,domain:1}],9:[function(){"function"!=typeof Promise.prototype.done&&(Promise.prototype.done=function(){var e=arguments.length?this.then.apply(this,arguments):this;e.then(null,function(e){setTimeout(function(){throw e},0)})})},{}],10:[function(e){e("asap");"undefined"==typeof Promise&&(Promise=e("./lib/core.js"),e("./lib/es6-extensions.js")),e("./polyfill-done.js")},{"./lib/core.js":4,"./lib/es6-extensions.js":5,"./polyfill-done.js":9,asap:6}]},{},[10]);
//# sourceMappingURL=Promise.js.map