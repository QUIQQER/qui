define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t),this.fireEvent("init",[this])},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var s=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[s]&&(window.$quistorage[s]={}),window.$quistorage[s][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,s){e.match(/qui\//)||(e="qui/"+e),t([modul],s)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=this,s=t.getAttribute("name"),n=typeOf(t);s&&""!==s||(s="#unknown"),"undefined"==typeof this.$controls[s]&&(this.$controls[s]=[]),"undefined"==typeof this.$types[n]&&(this.$types[n]=[]),this.$controls[s].push(t),this.$types[n].push(t),this.$cids[t.getId()]=t,t.addEvent("onDestroy",function(){e.destroy(t)})},destroy:function(t){var e=t.getAttribute("name"),s=typeOf(t),n=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[n]&&delete this.$cids[n];var i,r,o=[];if("undefined"!=typeof this.$controls[e]){for(i=0,r=this.$controls[e].length;r>i;i++)n!==this.$controls[e][i].getId()&&o.push(this.$controls[e][i]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[s])for(i=0,r=this.$types[s].length;r>i;i++)n!==this.$types[s][i].getId()&&o.push(this.$types[s][i]);this.$types[s]=o}})});var needle=["qui/classes/DOM"];("undefined"==typeof window.localStorage||"undefined"==typeof window.sessionStorage)&&needle.push("qui/classes/storage/Polyfill"),define(needle,function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/storage/Storage",$data:{},set:function(t,e){try{window.localStorage.setItem(t,e)}catch(s){this.$data[t]=e}},get:function(t){try{return window.localStorage.getItem(t)}catch(e){}return"undefined"!=typeof this.$data[t]?this.$data[t]:null},remove:function(t){try{window.localStorage.removeItem(t)}catch(e){}"undefined"!=typeof this.$data[t]&&delete this.$data[t]},clear:function(){this.$data={};try{window.localStorage.clear()}catch(t){}}})}),define("qui/classes/storage/Storage",function(){}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls","qui/classes/storage/Storage"],function(t,e,s,n){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new s,this.Storage=new n,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,s=this,n=0,i=0,r=e.length,o=null,u=null;r>n;n+=1)for(o=e[n].split("."),t=o.length,i=0;t>i;i+=1)u=o[i],s[u]=s[u]||{},s=s[u];return s},parse:function(e,s){if("undefined"==typeof e&&(e=document.body),"element"===typeOf(e)){var n=e.getElements("[data-qui]"),i=n.map(function(t){return t.get("data-qui")});t(i,function(){var t,e,r,o,u={TEXTAREA:!0,INPUT:!0};for(t=0,e=i.length;e>t;t++)r=arguments[t],o=n[t],o.get("data-quiid")||(""!==o.get("html").trim()||"undefined"!=typeof u[o.nodeName]?(new r).import(o):(new r).replaces(o));"undefined"!=typeof s&&s()})}},triggerError:function(t){return this.trigger(t.getMessage()),this},trigger:function(t,e,s){return this.fireEvent("error",[t,e,s]),this},getMessageHandler:function(e){if("undefined"!=typeof this.$execGetMessageHandler&&!this.MessageHandler)return this.$execGetMessageHandler=!0,void function(){this.getMessageHandler(e)}.delay(20,this);if(this.$execGetMessageHandler=!0,this.MessageHandler)return void e(this.MessageHandler);var s=this;t(["qui/controls/messages/Handler"],function(t){s.MessageHandler=new t,e(s.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),document.addEvent("domready",function(){QUI.parse(document.body)}),window.QUI}),define("qui/classes/Locale",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/Locale",current:"en",langs:{},no_translation:!1,initialize:function(t){this.parent(t)},setCurrent:function(t){this.current=t},getCurrent:function(){return this.current},set:function(t,e,s,n){if(this.langs[t]||(this.langs[t]={}),this.langs[t][e]||(this.langs[t][e]={}),"undefined"!=typeof n)return this.langs[t][set][s]=n,this;var i=this.langs[t][e];for(var r in s)i[r]=s[r];this.langs[t][e]=i},get:function(t,e,s){if("undefined"==typeof s)return this.$get(t,e);var n=this.$get(t,e);for(t in s)n=n.replace("["+t+"]",s[t]);return n},$get:function(t,e){return this.no_translation?"["+t+"] "+e:this.langs[this.current]&&this.langs[this.current][t]&&this.langs[this.current][t][e]?this.langs[this.current][t][e]:this.langs[this.current]&&this.langs[this.current][t]&&"undefined"==typeof e?this.langs[this.current][t]:(this.fireEvent("error",["No translation found for ["+t+"] "+e,this]),"["+t+"] "+e)}})}),define("qui/Locale",["qui/classes/Locale"],function(t){"use strict";return"undefined"==typeof window.QUILocale&&(window.QUILocale=new t),window.QUILocale}),define("qui/lib/require-css/normalize",[],function(){function t(t,n,i){if(t.match(u)||t.match(o))return t;t=r(t);var a=i.match(o),l=n.match(o);return!l||a&&a[1]==l[1]&&a[2]==l[2]?s(e(t,n),i):e(t,n)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(o))return t;var s=e.split("/"),n=t.split("/");for(s.pop();curPart=n.shift();)".."==curPart?s.pop():s.push(curPart);return s.join("/")}function s(t,e){var s=e.split("/");for(s.pop(),e=s.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),s=e.split("/");var n=t.split("/");for(out="";s.shift();)out+="../";for(;curPart=n.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var n=/([^:])\/+/g,r=function(t){return t.replace(n,"$1/")},o=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,a=function(e,s,n){s=r(s),n=r(n);for(var i,o,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;i=u.exec(e);){o=i[3]||i[2]||i[5]||i[6]||i[4];var a;a=t(o,s,n);var l=i[5]||i[6]?1:0;e=e.substr(0,u.lastIndex-o.length-l-1)+a+e.substr(u.lastIndex-l-1),u.lastIndex=u.lastIndex+(a.length-o.length)}return e};return a.convertURIBase=t,a.absoluteURI=e,a.relativeURI=s,a}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,s){s()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,s=!1,n=!0;e[1]||e[7]?s=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?n=!1:e[4]&&(s=parseInt(e[4])<18);var i={};i.pluginBuilder="./css-builder";var r,o,u,a=function(){r=document.createElement("style"),t.appendChild(r),o=r.styleSheet||r.sheet},l=0,c=[],d=function(t){l++,32==l&&(a(),l=0),o.addImport(t),r.onload=h},h=function(){u();var t=c.shift();return t?(u=t[1],void d(t[0])):void(u=null)},f=function(t,e){if(o&&o.addImport||a(),o&&o.addImport)u?c.push([t,e]):(d(t),u=e);else{r.textContent='@import "'+t+'";';var s=setInterval(function(){try{r.sheet.cssRules,clearInterval(s),e()}catch(t){}},10)}},g=function(e,s){var i=document.createElement("link");if(i.type="text/css",i.rel="stylesheet",n)i.onload=function(){i.onload=function(){},setTimeout(s,7)};else var r=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==i.href)return clearInterval(r),s()}},10);i.href=e,t.appendChild(i)};return i.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},i.load=function(t,e,n){(s?f:g)(e.toUrl(t+".css"),n)},i}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/Locale","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e,s){"use strict";return new Class({Extends:s,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),this.addEvent("onDestroy",function(){"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null}.bind(this)),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.qui-control"),this.$Elm.set("data-quiid",this.getId()),this.$Elm)},inject:function(e,s){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,s),this.$Elm.set("data-quiid",this.getId()),this.fireEvent("inject",[this]),this},"import":function(t){return this.$Elm=t,this.$Elm.set("data-quiid",this.getId()),this.fireEvent("import",[this,t]),this},replaces:function(t){return this.$Elm?this.$Elm:("styles"in t&&this.setAttribute("styles",t.styles),this.$Elm=this.create(),this.$Elm.set("data-quiid",this.getId()),this.$Elm.set("data-qui",t.get("data-qui")),t.getParent()&&this.$Elm.replaces(t),this)},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},isHidden:function(){return this.$Elm?"none"==this.$Elm.getStyle("display")?!0:!1:!0},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){if(this.$Elm)try{this.$Elm.focus()}catch(t){}return this},resize:function(){this.fireEvent("resize",[this])},openSheet:function(t){var s=new Element("div",{"class":"qui-sheet qui-box",html:'<div class="qui-sheet-content box"></div><div class="qui-sheet-buttons box"><div class="qui-sheet-buttons-back qui-button btn-white"><span>'+e.get("qui/controls/Control","btn.back")+"</span></div></div>",styles:{left:"-110%"}}).inject(this.$Elm);s.getElement(".qui-sheet-buttons-back").addEvent("click",function(){s.fireEvent("close")}),s.addEvent("close",function(){moofx(s).animate({left:"-100%"},{callback:function(){s.destroy()}})});var n=s.getElement(".qui-sheet-content");return n.setStyles({height:s.getSize().y-50}),moofx(s).animate({left:0},{callback:function(){t(n,s)}}),s}})}),define("qui/lib/require-css/css!qui/controls/messages/Message",[],function(){}),define("qui/controls/messages/Message",["qui/controls/Control","qui/Locale","css!qui/controls/messages/Message.css"],function(t,e){"use strict";return new Class({Extends:t,Type:"qui/controls/messages/Message",options:{message:"",code:0,time:!1,cssclass:!1,styles:!1},initialize:function(t){this.parent(t),this.getAttribute("time")?this.setAttribute("time",new Date(this.getAttribute("time"))):this.setAttribute("time",new Date)},create:function(){this.$Elm=this.createMessageElement();var t=this.$Elm.getElement(".messages-message-destroy");return t.set({title:e.get("quiqqer/qui","msg-handler-close-msg")}),t.removeEvents("click"),t.addEvent("click",this.destroy.bind(this)),this.$Elm},getMessage:function(){return this.getAttribute("message")},getCode:function(){return this.getAttribute("code")},createMessageElement:function(){var t=this,s="",n=this.getAttribute("time");s=n.toLocaleDateString()+" "+n.toLocaleTimeString();var i=new Element("div",{"class":"messages-message box",html:'<div class="messages-message-header"><span>'+s+'</span><span class="messages-message-destroy icon-remove-circle fa fa-remove"></span></div><div class="messages-message-text">'+this.getAttribute("message")+"</div>",events:{click:function(){t.fireEvent("click",[t])}}});this.getAttribute("styles")&&i.setStyles(this.getAttribute("styles")),this.getAttribute("cssclass")&&i.addClass(this.getAttribute("cssclass"));var r=i.getElement(".messages-message-destroy");return r.set({title:e.get("qui/controls/messages","message.close")}),r.addEvent("click",function(){i.destroy()}),i}})}),define("qui/controls/messages/Error",["qui/controls/messages/Message"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/messages/Error",initialize:function(t){this.setAttribute("cssclass","message-error"),this.parent(t)}})}),define("qui/classes/request/Ajax",["qui/QUI","qui/classes/DOM","qui/controls/messages/Error","qui/Locale"],function(QUI,DOM,MessageError,Locale){"use strict";return new Class({Extends:DOM,Type:"qui/classes/request/Ajax",Binds:["$parseResult"],$Request:null,$result:null,options:{method:"post",url:"",async:!0},initialize:function(t){this.parent(t)},send:function(t){var e=this;return t=e.parseParams(t||{}),e.setAttribute("params",t),e.$Request=new Request({url:e.getAttribute("url"),method:e.getAttribute("method"),async:e.getAttribute("async"),onProgress:function(){e.fireEvent("progress",[e])},onComplete:function(){e.fireEvent("complete",[e])},onSuccess:e.$parseResult,onCancel:function(){e.fireEvent("cancel",[e])}}),e.$Request.send(Object.toQueryString(t)),e.$Request},cancel:function(){this.$Request.cancel()},destroy:function(){this.fireEvent("destroy",[this])},getResult:function(){return this.$result},parseParams:function(t){var e,s,n={},i="";"undefined"==typeof t.lang&&"undefined"!=typeof Locale&&(t.lang=Locale.getCurrent());for(e in t)"undefined"!=typeof t[e]&&(s=typeOf(t[e]),("string"==s||"number"==s||"array"==s)&&("_rf"==e||"array"!=s)&&("_rf"==e&&("array"!=typeOf(t[e])&&(t[e]=[t[e]]),t[e]=JSON.encode(t[e])),i=t[e].toString(),i=i.replace(/\+/g,"%2B"),i=i.replace(/\&/g,"%26"),i=i.replace(/\'/g,"%27"),n[e]=i));return n},$parseResult:function(responseText,responseXML){var i,str=responseText||"",len=str.length,start=9,end=len-10;if(!str.match("<quiqqer>")||!str.match("</quiqqer>"))return this.fireEvent("error",[new MessageError({message:"No QUIQQER XML",code:500}),this]);if("<quiqqer>"!=str.substring(0,start)||"</quiqqer>"!=str.substring(end,len))return this.fireEvent("error",[new MessageError({message:"No QUIQQER XML",code:500}),this]);var res,func,result=eval("("+str.substring(start,end)+")"),params=this.getAttribute("params"),rfs=JSON.decode(params._rf||[]),event_params=[];if(result.message_handler&&result.message_handler.length){var messages=result.message_handler;QUI.getMessageHandler(function(t){var e,s;for(e=0,s=messages.length;s>e;e++)t.parse(messages[e],function(e){t.add(e)})})}if(result.Exception)return this.fireEvent("error",[new MessageError({message:result.Exception.message||"",code:result.Exception.code||0,type:result.Exception.type||"Exception"}),this]);for(i=0,len=rfs.length;len>i;i++)func=rfs[i],res=result[func],res?res.Exception?(this.fireEvent("error",[new MessageError({message:res.Exception.message||"",code:res.Exception.code||0,type:res.Exception.type||"Exception"}),this]),event_params.push(null)):event_params.push(res.result?res.result:null):event_params.push(null);event_params.push(this),this.fireEvent("success",event_params)}})});
//# sourceMappingURL=Ajax.js.map