define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t)},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([modul],i)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=t.getAttribute("name"),i=typeOf(t);e&&""!==e||(e="#unknown"),"undefined"==typeof this.$controls[e]&&(this.$controls[e]=[]),"undefined"==typeof this.$types[i]&&(this.$types[i]=[]),this.$controls[e].push(t),this.$types[i].push(t),this.$cids[t.getId()]=t},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),n=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[n]&&delete this.$cids[n];var s,r,o=[];if("undefined"!=typeof this.$controls[e]){for(s=0,r=this.$controls[e].length;r>s;s++)n!==this.$controls[e][s].getId()&&o.push(this.$controls[e][s]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[i])for(s=0,r=this.$types[i].length;r>s;s++)n!==this.$types[i][s].getId()&&o.push(this.$types[i][s]);this.$types[i]=o}})}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls"],function(t,e,i){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new i,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,n=0,s=0,r=e.length,o=null,u=null;r>n;n+=1)for(o=e[n].split("."),t=o.length,s=0;t>s;s+=1)u=o[s],i[u]=i[u]||{},i=i[u];return i},triggerError:function(t,e){return this.fireEvent("onError",[t,e]),this.trigger(t.getMessage()),this},trigger:function(t,e,i){var n=t+"\nFile: "+e+"\nLinenumber: "+i;return console.error(n),this},getMessageHandler:function(e){if(this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),window.QUI}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,s){if(t.match(u)||t.match(o))return t;t=r(t);var l=s.match(o),h=i.match(o);return!h||l&&l[1]==h[1]&&l[2]==h[2]?n(e(t,i),s):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(o))return t;var i=e.split("/"),n=t.split("/");for(i.pop();curPart=n.shift();)".."==curPart?i.pop():i.push(curPart);return i.join("/")}function n(t,e){var n=e.split("/");for(n.pop(),e=n.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),n=e.split("/");var s=t.split("/");for(out="";n.shift();)out+="../";for(;curPart=s.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var s=/([^:])\/+/g,r=function(t){return t.replace(s,"$1/")},o=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,l=function(e,i,n){i=r(i),n=r(n);for(var s,o,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;s=u.exec(e);){o=s[3]||s[2]||s[5]||s[6]||s[4];var l;l=t(o,i,n);var h=s[5]||s[6]?1:0;e=e.substr(0,u.lastIndex-o.length-h-1)+l+e.substr(u.lastIndex-h-1),u.lastIndex=u.lastIndex+(l.length-o.length)}return e};return l.convertURIBase=t,l.absoluteURI=e,l.relativeURI=n,l}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,i){i()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,i=!1,n=!0;e[1]||e[7]?i=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?n=!1:e[4]&&(i=parseInt(e[4])<18);var s={};s.pluginBuilder="./css-builder";var r,o,u,l=function(){r=document.createElement("style"),t.appendChild(r),o=r.styleSheet||r.sheet},h=0,c=[],f=function(t){h++,32==h&&(l(),h=0),o.addImport(t),r.onload=d},d=function(){u();var t=c.shift();return t?(u=t[1],void f(t[0])):void(u=null)},a=function(t,e){if(o&&o.addImport||l(),o&&o.addImport)u?c.push([t,e]):(f(t),u=e);else{r.textContent='@import "'+t+'";';var i=setInterval(function(){try{r.sheet.cssRules,clearInterval(i),e()}catch(t){}},10)}},p=function(e,i){var s=document.createElement("link");if(s.type="text/css",s.rel="stylesheet",n)s.onload=function(){s.onload=function(){},setTimeout(i,7)};else var r=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==s.href)return clearInterval(r),i()}},10);s.href=e,t.appendChild(s)};return s.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},s.load=function(t,e,n){(i?a:p)(e.toUrl(t+".css"),n)},s}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.QUI-control"),this.$Elm)},inject:function(e,i){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,i),this.fireEvent("inject",[this]),this},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},destroy:function(){this.fireEvent("destroy",[this]),"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null,t.Controls.destroy(this)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){return this.$Elm&&this.$Elm.focus(),this},resize:function(){this.fireEvent("resize",[this])}})}),define("qui/lib/require-css/css!qui/controls/contextmenu/Seperator",[],function(){}),define("qui/controls/contextmenu/Seperator",["qui/controls/Control","css!qui/controls/contextmenu/Seperator.css"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/contextmenu/Seperator",options:{styles:null},initialize:function(t){this.parent(t),this.$Elm=null},create:function(){return this.$Elm=new Element("div.qui-context-seperator",{"data-quiid":this.getId()}),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.$Elm},setNormal:function(){},setActive:function(){}})});
//# sourceMappingURL=Seperator.js.map