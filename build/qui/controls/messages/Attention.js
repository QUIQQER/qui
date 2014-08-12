define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t)},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var s=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[s]&&(window.$quistorage[s]={}),window.$quistorage[s][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,s){e.match(/qui\//)||(e="qui/"+e),t([modul],s)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=t.getAttribute("name"),s=typeOf(t);e&&""!==e||(e="#unknown"),"undefined"==typeof this.$controls[e]&&(this.$controls[e]=[]),"undefined"==typeof this.$types[s]&&(this.$types[s]=[]),this.$controls[e].push(t),this.$types[s].push(t),this.$cids[t.getId()]=t},destroy:function(t){var e=t.getAttribute("name"),s=typeOf(t),i=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[i]&&delete this.$cids[i];var n,r,o=[];if("undefined"!=typeof this.$controls[e]){for(n=0,r=this.$controls[e].length;r>n;n++)i!==this.$controls[e][n].getId()&&o.push(this.$controls[e][n]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[s])for(n=0,r=this.$types[s].length;r>n;n++)i!==this.$types[s][n].getId()&&o.push(this.$types[s][n]);this.$types[s]=o}})}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls"],function(t,e,s){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new s,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,s=this,i=0,n=0,r=e.length,o=null,u=null;r>i;i+=1)for(o=e[i].split("."),t=o.length,n=0;t>n;n+=1)u=o[n],s[u]=s[u]||{},s=s[u];return s},parse:function(e,s){"undefined"==typeof e&&(e=document.body);var i=e.getElements("[data-qui]"),n=i.map(function(t){return t.get("data-qui")});t(n,function(){var t,e,r,o;for(t=0,e=n.length;e>t;t++)r=arguments[t],o=i[t],o.get("data-quiid")||(""!==o.get("html").trim()?(new r).import(o):(new r).replaces(o));"undefined"!=typeof s&&s()})},triggerError:function(t){return this.trigger(t.getMessage()),this},trigger:function(t,e,s){return this.fireEvent("error",[t,e,s]),this},getMessageHandler:function(e){if(this.MessageHandler)return void e(this.MessageHandler);var s=this;t(["qui/controls/messages/Handler"],function(t){s.MessageHandler=new t,e(s.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),document.addEvent("domready",function(){QUI.parse(document.body)}),window.QUI}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,n){if(t.match(u)||t.match(o))return t;t=r(t);var a=n.match(o),l=i.match(o);return!l||a&&a[1]==l[1]&&a[2]==l[2]?s(e(t,i),n):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(o))return t;var s=e.split("/"),i=t.split("/");for(s.pop();curPart=i.shift();)".."==curPart?s.pop():s.push(curPart);return s.join("/")}function s(t,e){var s=e.split("/");for(s.pop(),e=s.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),s=e.split("/");var n=t.split("/");for(out="";s.shift();)out+="../";for(;curPart=n.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var n=/([^:])\/+/g,r=function(t){return t.replace(n,"$1/")},o=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,a=function(e,s,i){s=r(s),i=r(i);for(var n,o,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;n=u.exec(e);){o=n[3]||n[2]||n[5]||n[6]||n[4];var a;a=t(o,s,i);var l=n[5]||n[6]?1:0;e=e.substr(0,u.lastIndex-o.length-l-1)+a+e.substr(u.lastIndex-l-1),u.lastIndex=u.lastIndex+(a.length-o.length)}return e};return a.convertURIBase=t,a.absoluteURI=e,a.relativeURI=s,a}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,s){s()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,s=!1,i=!0;e[1]||e[7]?s=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?i=!1:e[4]&&(s=parseInt(e[4])<18);var n={};n.pluginBuilder="./css-builder";var r,o,u,a=function(){r=document.createElement("style"),t.appendChild(r),o=r.styleSheet||r.sheet},l=0,c=[],h=function(t){l++,32==l&&(a(),l=0),o.addImport(t),r.onload=d},d=function(){u();var t=c.shift();return t?(u=t[1],void h(t[0])):void(u=null)},f=function(t,e){if(o&&o.addImport||a(),o&&o.addImport)u?c.push([t,e]):(h(t),u=e);else{r.textContent='@import "'+t+'";';var s=setInterval(function(){try{r.sheet.cssRules,clearInterval(s),e()}catch(t){}},10)}},g=function(e,s){var n=document.createElement("link");if(n.type="text/css",n.rel="stylesheet",i)n.onload=function(){n.onload=function(){},setTimeout(s,7)};else var r=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==n.href)return clearInterval(r),s()}},10);n.href=e,t.appendChild(n)};return n.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},n.load=function(t,e,i){(s?f:g)(e.toUrl(t+".css"),i)},n}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.qui-control"),this.$Elm.set("data-quiid",this.getId()),this.$Elm)},inject:function(e,s){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,s),this.$Elm.set("data-quiid",this.getId()),this.fireEvent("inject",[this]),this},"import":function(t){return this.$Elm=t,this.fireEvent("import",[this,t]),this},replaces:function(t){return this.$Elm?this.$Elm:("styles"in t&&this.setAttribute("styles",t.styles),this.$Elm=this.create(),this.$Elm.set("data-quiid",this.getId()),this.$Elm.set("data-qui",t.get("data-qui")),t.getParent()&&this.$Elm.replaces(t),this)},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},destroy:function(){this.fireEvent("destroy",[this]),"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null,t.Controls.destroy(this)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){return this.$Elm&&this.$Elm.focus(),this},resize:function(){this.fireEvent("resize",[this])}})}),define("qui/classes/Locale",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/Locale",current:"en",langs:{},no_translation:!1,initialize:function(t){this.parent(t)},setCurrent:function(t){this.current=t},getCurrent:function(){return this.current},set:function(t,e,s,i){if(this.langs[t]||(this.langs[t]={}),this.langs[t][e]||(this.langs[t][e]={}),"undefined"!=typeof i)return this.langs[t][set][s]=i,this;var n=this.langs[t][e];for(var r in s)n[r]=s[r];this.langs[t][e]=n},get:function(t,e,s){if("undefined"==typeof s)return this.$get(t,e);var i=this.$get(t,e);for(t in s)i=i.replace("["+t+"]",s[t]);return i},$get:function(t,e){return this.no_translation?"["+t+"] "+e:this.langs[this.current]&&this.langs[this.current][t]?"undefined"==typeof e?this.langs[this.current][t]:this.langs[this.current][t][e]?this.langs[this.current][t][e]:"["+t+"] "+e:(this.fireEvent("error",["No translation found for ["+t+"] "+e,this]),"["+t+"] "+e)}})}),define("qui/Locale",["qui/classes/Locale"],function(t){"use strict";return"undefined"==typeof window.QUILocale&&(window.QUILocale=new t),window.QUILocale}),define("qui/lib/require-css/css!qui/controls/messages/Message",[],function(){}),define("qui/controls/messages/Message",["qui/controls/Control","qui/Locale","css!qui/controls/messages/Message.css"],function(t,e){"use strict";return new Class({Extends:t,Type:"qui/controls/messages/Message",options:{message:"",code:0,time:!1,cssclass:!1,styles:!1},initialize:function(t){this.parent(t),this.getAttribute("time")?this.setAttribute("time",new Date(this.getAttribute("time"))):this.setAttribute("time",new Date)},create:function(){this.$Elm=this.createMessageElement();var t=this.$Elm.getElement(".messages-message-destroy");return t.set({title:e.get("quiqqer/qui","msg-handler-close-msg")}),t.removeEvents("click"),t.addEvent("click",this.destroy.bind(this)),this.$Elm},getMessage:function(){return this.getAttribute("message")},getCode:function(){return this.getAttribute("code")},createMessageElement:function(){var t=this,s="",i=this.getAttribute("time");s=i.toLocaleDateString()+" "+i.toLocaleTimeString();var n=new Element("div",{"class":"messages-message box",html:'<div class="messages-message-header"><span>'+s+'</span><span class="messages-message-destroy icon-remove-circle"></span></div><div class="messages-message-text">'+this.getAttribute("message")+"</div>",events:{click:function(){t.fireEvent("click",[t])}}});this.getAttribute("styles")&&n.setStyles(this.getAttribute("styles")),this.getAttribute("cssclass")&&n.addClass(this.getAttribute("cssclass"));var r=n.getElement(".messages-message-destroy");return r.set({title:e.get("qui/controls/messages","message.close")}),r.addEvent("click",function(){n.destroy()}),n}})}),define("qui/controls/messages/Attention",["qui/controls/messages/Message"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/messages/Attention",initialize:function(t){this.setAttribute("cssclass","message-attention"),this.parent(t)}})});
//# sourceMappingURL=Attention.js.map