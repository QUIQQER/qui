!function(){this.ResizeSensor=function(e,t){function i(e,t){window.OverflowEvent?e.addEventListener("overflowchanged",function(e){t.call(this,e)}):(e.addEventListener("overflow",function(e){t.call(this,e)}),e.addEventListener("underflow",function(e){t.call(this,e)}))}function n(){this.q=[],this.add=function(e){this.q.push(e)};var e,t;this.call=function(){for(e=0,t=this.q.length;t>e;e++)this.q[e].call()}}function s(e,t){return e.currentStyle?e.currentStyle[t]:window.getComputedStyle?window.getComputedStyle(e,null).getPropertyValue(t):e.style[t]}function r(e,t){function r(){var t=!1,i=e.resizeSensor.offsetWidth,n=e.resizeSensor.offsetHeight;return l!=i&&(f.width=i-1+"px",c.width=i+1+"px",t=!0,l=i),a!=n&&(f.height=n-1+"px",c.height=n+1+"px",t=!0,a=n),t}if(e.resizedAttached){if(e.resizedAttached)return void e.resizedAttached.add(t)}else e.resizedAttached=new n,e.resizedAttached.add(t);if("onresize"in e)e.attachEvent?e.attachEvent("onresize",function(){e.resizedAttached.call()}):e.addEventListener&&e.addEventListener("resize",function(){e.resizedAttached.call()});else{var o=function(){r()&&e.resizedAttached.call()};e.resizeSensor=document.createElement("div"),e.resizeSensor.className="resize-sensor";var d="position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;";e.resizeSensor.style.cssText=d,e.resizeSensor.innerHTML='<div class="resize-sensor-overflow" style="'+d+'"><div></div></div><div class="resize-sensor-underflow" style="'+d+'"><div></div></div>',e.appendChild(e.resizeSensor),"absolute"!==s(e,"position")&&(e.style.position="relative");var l=-1,a=-1,f=e.resizeSensor.firstElementChild.firstChild.style,c=e.resizeSensor.lastElementChild.firstChild.style;r(),i(e.resizeSensor,o),i(e.resizeSensor.firstElementChild,o),i(e.resizeSensor.lastElementChild,o)}}if("array"==typeof e||"undefined"!=typeof jQuery&&e instanceof jQuery||"undefined"!=typeof Elements&&e instanceof Elements)for(var o=0,d=e.length;d>o;o++)r(e[o],t);else r(e,t)}}(),define("qui/lib/ResizeSensor",function(){});
//# sourceMappingURL=ResizeSensor.js.map