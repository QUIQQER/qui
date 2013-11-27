/**
 * @license MIT
 * @fileOverview Favico animations
 * @author Miroslav Magda, http://blog.ejci.net
 * @version 0.3.3
 */
!function(){var e=function(e){"use strict";function t(e){if(e.paused||e.ended||w)return!1;try{d.clearRect(0,0,h,s),d.drawImage(e,0,0,h,s)}catch(o){}setTimeout(t,U.duration,e),L.setIcon(c)}function o(e){var t=/^#?([a-f\d])([a-f\d])([a-f\d])$/i;e=e.replace(t,function(e,t,o,n){return t+t+o+o+n+n});var o=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return o?{r:parseInt(o[1],16),g:parseInt(o[2],16),b:parseInt(o[3],16)}:!1}function n(e,t){var o,n={};for(o in e)n[o]=e[o];for(o in t)n[o]=t[o];return n}function r(){return document.hidden||document.msHidden||document.webkitHidden||document.mozHidden}e=e?e:{};var i,a,s,h,c,d,u,l,f,g,y,w,m,x={bgColor:"#d00",textColor:"#fff",fontFamily:"sans-serif",fontStyle:"bold",type:"circle",position:"down",animation:"slide",elementId:!1};m={},m.ff=/firefox/i.test(navigator.userAgent.toLowerCase()),m.chrome=/chrome/i.test(navigator.userAgent.toLowerCase()),m.opera=/opera/i.test(navigator.userAgent.toLowerCase()),m.ie=/msie/i.test(navigator.userAgent.toLowerCase())||/trident/i.test(navigator.userAgent.toLowerCase()),m.supported=m.chrome||m.ff||m.opera;var p=[];y=function(){},l=w=!1;var v=function(){if(i=n(x,e),i.bgColor=o(i.bgColor),i.textColor=o(i.textColor),i.position=i.position.toLowerCase(),i.animation=U.types[""+i.animation]?i.animation:x.animation,"up"===i.position)for(var t=0;t<U.types[""+i.animation].length;t++){var r=U.types[""+i.animation][t];r.y=r.y<.6?r.y-.4:r.y-2*r.y+(1-r.w),U.types[""+i.animation][t]=r}i.type=C[""+i.type]?i.type:x.type;try{a=L.getIcon(),c=document.createElement("canvas"),u=document.createElement("img"),a.hasAttribute("href")?(u.setAttribute("src",a.getAttribute("href")),u.onload=function(){s=u.height>0?u.height:32,h=u.width>0?u.width:32,c.height=s,c.width=h,d=c.getContext("2d"),b.ready()}):(u.setAttribute("src",""),s=32,h=32,u.height=s,u.width=h,c.height=s,c.width=h,d=c.getContext("2d"),b.ready())}catch(l){throw"Error initializing favico. Message: "+l.message}},b={};b.ready=function(){l=!0,b.reset(),y()},b.reset=function(){p=[],f=!1,d.clearRect(0,0,h,s),d.drawImage(u,0,0,h,s),L.setIcon(c)},b.start=function(){if(l&&!g){var e=function(){f=p[0],g=!1,p.length>0&&(p.shift(),b.start())};p.length>0&&(g=!0,f?U.run(f.options,function(){U.run(p[0].options,function(){e()},!1)},!0):U.run(p[0].options,function(){e()},!1))}};var C={},M=function(e){return e.n=Math.abs(e.n),e.x=h*e.x,e.y=s*e.y,e.w=h*e.w,e.h=s*e.h,e};C.circle=function(e){e=M(e);var t=!1;e.n>9&&e.n<100?(e.x=e.x-.4*e.w,e.w=1.4*e.w,t=!0):e.n>=100&&(e.x=e.x-.65*e.w,e.w=1.65*e.w,t=!0),d.clearRect(0,0,h,s),d.drawImage(u,0,0,h,s),d.beginPath(),d.font=i.fontStyle+" "+Math.floor(e.h*(e.n>99?.85:1))+"px "+i.fontFamily,d.textAlign="center",t?(d.moveTo(e.x+e.w/2,e.y),d.lineTo(e.x+e.w-e.h/2,e.y),d.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+e.h/2),d.lineTo(e.x+e.w,e.y+e.h-e.h/2),d.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-e.h/2,e.y+e.h),d.lineTo(e.x+e.h/2,e.y+e.h),d.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-e.h/2),d.lineTo(e.x,e.y+e.h/2),d.quadraticCurveTo(e.x,e.y,e.x+e.h/2,e.y)):d.arc(e.x+e.w/2,e.y+e.h/2,e.h/2,0,2*Math.PI),d.fillStyle="rgba("+i.bgColor.r+","+i.bgColor.g+","+i.bgColor.b+","+e.o+")",d.fill(),d.closePath(),d.beginPath(),d.stroke(),d.fillStyle="rgba("+i.textColor.r+","+i.textColor.g+","+i.textColor.b+","+e.o+")",e.n>999?d.fillText((e.n>9999?9:Math.floor(e.n/1e3))+"k+",Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.2*e.h)):d.fillText(e.n,Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.15*e.h)),d.closePath()},C.rectangle=function(e){e=M(e);var t=!1;e.n>9&&e.n<100?(e.x=e.x-.4*e.w,e.w=1.4*e.w,t=!0):e.n>=100&&(e.x=e.x-.65*e.w,e.w=1.65*e.w,t=!0),d.clearRect(0,0,h,s),d.drawImage(u,0,0,h,s),d.beginPath(),d.font="bold "+Math.floor(e.h*(e.n>99?.9:1))+"px sans-serif",d.textAlign="center",d.fillStyle="rgba("+i.bgColor.r+","+i.bgColor.g+","+i.bgColor.b+","+e.o+")",d.fillRect(e.x,e.y,e.w,e.h),d.fillStyle="rgba("+i.textColor.r+","+i.textColor.g+","+i.textColor.b+","+e.o+")",e.n>999?d.fillText((e.n>9999?9:Math.floor(e.n/1e3))+"k+",Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.2*e.h)):d.fillText(e.n,Math.floor(e.x+e.w/2),Math.floor(e.y+e.h-.15*e.h)),d.closePath()};var I=function(e,t){y=function(){try{if(e>0){if(U.types[""+t]&&(i.animation=t),p.push({type:"badge",options:{n:e}}),p.length>100)throw"Too many badges requests in queue.";b.start()}else b.reset()}catch(o){throw"Error setting badge. Message: "+o.message}},l&&y()},A=function(e){y=function(){try{var t=e.width,o=e.height,n=document.createElement("img"),r=o/s>t/h?t/h:o/s;n.setAttribute("src",e.getAttribute("src")),n.height=o/r,n.width=t/r,d.clearRect(0,0,h,s),d.drawImage(n,0,0,h,s),L.setIcon(c)}catch(i){throw"Error setting image. Message: "+i.message}},l&&y()},E=function(e){y=function(){try{if("stop"===e)return w=!0,b.reset(),w=!1,void 0;e.addEventListener("play",function(){t(this)},!1)}catch(o){throw"Error setting video. Message: "+o.message}},l&&y()},T=function(e){if(window.URL&&window.URL.createObjectURL||(window.URL=window.URL||{},window.URL.createObjectURL=function(e){return e}),m.supported){var o=!1;navigator.getUserMedia=navigator.getUserMedia||navigator.oGetUserMedia||navigator.msGetUserMedia||navigator.mozGetUserMedia||navigator.webkitGetUserMedia,y=function(){try{if("stop"===e)return w=!0,b.reset(),w=!1,void 0;o=document.createElement("video"),o.width=h,o.height=s,navigator.getUserMedia({video:!0,audio:!1},function(e){o.src=URL.createObjectURL(e),o.play(),t(o)},function(){})}catch(n){throw"Error setting webcam. Message: "+n.message}},l&&y()}},L={};L.getIcon=function(){var e=!1,t="",o=function(){for(var e=document.getElementsByTagName("head")[0].getElementsByTagName("link"),t=e.length,o=t-1;o>=0;o--)if(/icon/i.test(e[o].getAttribute("rel")))return e[o];return!1};if(i.elementId?(e=document.getElementById(i.elementId),e.setAttribute("href",e.getAttribute("src"))):(e=o(),e===!1&&(e=document.createElement("link"),e.setAttribute("rel","icon"),document.getElementsByTagName("head")[0].appendChild(e))),t=i.elementId?e.src:e.href,-1===t.indexOf(document.location.hostname))throw new Error("Error setting favicon. Favicon image is on different domain (Icon: "+t+", Domain: "+document.location.hostname+")");return e.setAttribute("type","image/png"),e},L.setIcon=function(e){var t=e.toDataURL("image/png");if(i.elementId)document.getElementById(i.elementId).setAttribute("src",t);else if(m.ff||m.opera){var o=a;a=document.createElement("link"),m.opera&&a.setAttribute("rel","icon"),a.setAttribute("rel","icon"),a.setAttribute("type","image/png"),document.getElementsByTagName("head")[0].appendChild(a),a.setAttribute("href",t),o.parentNode&&o.parentNode.removeChild(o)}else a.setAttribute("href",t)};var U={};return U.duration=40,U.types={},U.types.fade=[{x:.4,y:.4,w:.6,h:.6,o:0},{x:.4,y:.4,w:.6,h:.6,o:.1},{x:.4,y:.4,w:.6,h:.6,o:.2},{x:.4,y:.4,w:.6,h:.6,o:.3},{x:.4,y:.4,w:.6,h:.6,o:.4},{x:.4,y:.4,w:.6,h:.6,o:.5},{x:.4,y:.4,w:.6,h:.6,o:.6},{x:.4,y:.4,w:.6,h:.6,o:.7},{x:.4,y:.4,w:.6,h:.6,o:.8},{x:.4,y:.4,w:.6,h:.6,o:.9},{x:.4,y:.4,w:.6,h:.6,o:1}],U.types.none=[{x:.4,y:.4,w:.6,h:.6,o:1}],U.types.pop=[{x:1,y:1,w:0,h:0,o:1},{x:.9,y:.9,w:.1,h:.1,o:1},{x:.8,y:.8,w:.2,h:.2,o:1},{x:.7,y:.7,w:.3,h:.3,o:1},{x:.6,y:.6,w:.4,h:.4,o:1},{x:.5,y:.5,w:.5,h:.5,o:1},{x:.4,y:.4,w:.6,h:.6,o:1}],U.types.popFade=[{x:.75,y:.75,w:0,h:0,o:0},{x:.65,y:.65,w:.1,h:.1,o:.2},{x:.6,y:.6,w:.2,h:.2,o:.4},{x:.55,y:.55,w:.3,h:.3,o:.6},{x:.5,y:.5,w:.4,h:.4,o:.8},{x:.45,y:.45,w:.5,h:.5,o:.9},{x:.4,y:.4,w:.6,h:.6,o:1}],U.types.slide=[{x:.4,y:1,w:.6,h:.6,o:1},{x:.4,y:.9,w:.6,h:.6,o:1},{x:.4,y:.9,w:.6,h:.6,o:1},{x:.4,y:.8,w:.6,h:.6,o:1},{x:.4,y:.7,w:.6,h:.6,o:1},{x:.4,y:.6,w:.6,h:.6,o:1},{x:.4,y:.5,w:.6,h:.6,o:1},{x:.4,y:.4,w:.6,h:.6,o:1}],U.run=function(e,t,o,a){var s=U.types[r()?"none":i.animation];return a=o===!0?"undefined"!=typeof a?a:s.length-1:"undefined"!=typeof a?a:0,t=t?t:function(){},a<s.length&&a>=0?(C[i.type](n(e,s[a])),setTimeout(function(){o?a-=1:a+=1,U.run(e,t,o,a)},U.duration),L.setIcon(c),void 0):(t(),void 0)},v(),{badge:I,video:E,image:A,webcam:T,reset:b.reset}};"undefined"!=typeof define&&define.amd?define([],function(){return e}):"undefined"!=typeof module&&module.exports?module.exports=e:this.Favico=e}();