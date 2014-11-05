define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t),this.fireEvent("init",[this])},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([modul],i)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=this,i=t.getAttribute("name"),s=typeOf(t);i&&""!==i||(i="#unknown"),"undefined"==typeof this.$controls[i]&&(this.$controls[i]=[]),"undefined"==typeof this.$types[s]&&(this.$types[s]=[]),this.$controls[i].push(t),this.$types[s].push(t),this.$cids[t.getId()]=t,t.addEvent("onDestroy",function(){e.destroy(t)})},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),s=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[s]&&delete this.$cids[s];var n,o,r=[];if("undefined"!=typeof this.$controls[e]){for(n=0,o=this.$controls[e].length;o>n;n++)s!==this.$controls[e][n].getId()&&r.push(this.$controls[e][n]);this.$controls[e]=r,r.length||delete this.$controls[e]}if(r=[],"undefined"!=typeof this.$types[i])for(n=0,o=this.$types[i].length;o>n;n++)s!==this.$types[i][n].getId()&&r.push(this.$types[i][n]);this.$types[i]=r}})});var needle=["qui/classes/DOM"];("undefined"==typeof window.localStorage||"undefined"==typeof window.sessionStorage)&&needle.push("qui/classes/storage/Polyfill"),define(needle,function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/storage/Storage",$data:{},set:function(t,e){try{window.localStorage.setItem(t,e)}catch(i){this.$data[t]=e}},get:function(t){try{return window.localStorage.getItem(t)}catch(e){}return"undefined"!=typeof this.$data[t]?this.$data[t]:null},remove:function(t){try{window.localStorage.removeItem(t)}catch(e){}"undefined"!=typeof this.$data[t]&&delete this.$data[t]},clear:function(){this.$data={};try{window.localStorage.clear()}catch(t){}}})}),define("qui/classes/storage/Storage",function(){}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls","qui/classes/storage/Storage"],function(t,e,i,s){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new i,this.Storage=new s,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,s=0,n=0,o=e.length,r=null,l=null;o>s;s+=1)for(r=e[s].split("."),t=r.length,n=0;t>n;n+=1)l=r[n],i[l]=i[l]||{},i=i[l];return i},parse:function(e,i){if("undefined"==typeof e&&(e=document.body),"element"!==typeOf(e))return void("undefined"!=typeof i&&i());var s=e.getElements("[data-qui]"),n=s.map(function(t){return t.get("data-qui")});t(n,function(){var t,e,o,r,l={TEXTAREA:!0,INPUT:!0};for(t=0,e=n.length;e>t;t++)o=arguments[t],r=s[t],r.get("data-quiid")||(""!==r.get("html").trim()||"undefined"!=typeof l[r.nodeName]?(new o).import(r):(new o).replaces(r));"undefined"!=typeof i&&i()})},triggerError:function(t){return this.trigger(t.getMessage()),this},trigger:function(t,e,i){return this.fireEvent("error",[t,e,i]),this},getMessageHandler:function(e){if("undefined"!=typeof this.$execGetMessageHandler&&!this.MessageHandler)return this.$execGetMessageHandler=!0,void function(){this.getMessageHandler(e)}.delay(20,this);if(this.$execGetMessageHandler=!0,this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),document.addEvent("domready",function(){QUI.parse(document.body)}),window.QUI}),define("qui/classes/Locale",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/Locale",current:"en",langs:{},no_translation:!1,initialize:function(t){this.parent(t)},setCurrent:function(t){this.current=t},getCurrent:function(){return this.current},set:function(t,e,i,s){if(this.langs[t]||(this.langs[t]={}),this.langs[t][e]||(this.langs[t][e]={}),"undefined"!=typeof s)return this.langs[t][set][i]=s,this;var n=this.langs[t][e];for(var o in i)n[o]=i[o];this.langs[t][e]=n},get:function(t,e,i){if("undefined"==typeof i)return this.$get(t,e);var s=this.$get(t,e);for(t in i)s=s.replace("["+t+"]",i[t]);return s},$get:function(t,e){return this.no_translation?"["+t+"] "+e:this.langs[this.current]&&this.langs[this.current][t]&&this.langs[this.current][t][e]?this.langs[this.current][t][e]:this.langs[this.current]&&this.langs[this.current][t]&&"undefined"==typeof e?this.langs[this.current][t]:(this.fireEvent("error",["No translation found for ["+t+"] "+e,this]),"["+t+"] "+e)}})}),define("qui/Locale",["qui/classes/Locale"],function(t){"use strict";return"undefined"==typeof window.QUILocale&&(window.QUILocale=new t),window.QUILocale}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,n){if(t.match(l)||t.match(r))return t;t=o(t);var u=n.match(r),a=i.match(r);return!a||u&&u[1]==a[1]&&u[2]==a[2]?s(e(t,i),n):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(l)||t.match(r))return t;var i=e.split("/"),s=t.split("/");for(i.pop();curPart=s.shift();)".."==curPart?i.pop():i.push(curPart);return i.join("/")}function s(t,e){var s=e.split("/");for(s.pop(),e=s.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),s=e.split("/");var n=t.split("/");for(out="";s.shift();)out+="../";for(;curPart=n.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var n=/([^:])\/+/g,o=function(t){return t.replace(n,"$1/")},r=/[^\:\/]*:\/\/([^\/])*/,l=/^(\/|data:)/,u=function(e,i,s){i=o(i),s=o(s);for(var n,r,e,l=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;n=l.exec(e);){r=n[3]||n[2]||n[5]||n[6]||n[4];var u;u=t(r,i,s);var a=n[5]||n[6]?1:0;e=e.substr(0,l.lastIndex-r.length-a-1)+u+e.substr(l.lastIndex-a-1),l.lastIndex=l.lastIndex+(u.length-r.length)}return e};return u.convertURIBase=t,u.absoluteURI=e,u.relativeURI=s,u}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,i){i()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,i=!1,s=!0;e[1]||e[7]?i=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?s=!1:e[4]&&(i=parseInt(e[4])<18);var n={};n.pluginBuilder="./css-builder";var o,r,l,u=function(){o=document.createElement("style"),t.appendChild(o),r=o.styleSheet||o.sheet},a=0,d=[],c=function(t){a++,32==a&&(u(),a=0),r.addImport(t),o.onload=h},h=function(){l();var t=d.shift();return t?(l=t[1],void c(t[0])):void(l=null)},f=function(t,e){if(r&&r.addImport||u(),r&&r.addImport)l?d.push([t,e]):(c(t),l=e);else{o.textContent='@import "'+t+'";';var i=setInterval(function(){try{o.sheet.cssRules,clearInterval(i),e()}catch(t){}},10)}},g=function(e,i){var n=document.createElement("link");if(n.type="text/css",n.rel="stylesheet",s)n.onload=function(){n.onload=function(){},setTimeout(i,7)};else var o=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==n.href)return clearInterval(o),i()}},10);n.href=e,t.appendChild(n)};return n.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},n.load=function(t,e,s){(i?f:g)(e.toUrl(t+".css"),s)},n}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/Locale","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e,i){"use strict";return new Class({Extends:i,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),this.addEvent("onDestroy",function(){"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null}.bind(this)),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.qui-control"),this.$Elm.set("data-quiid",this.getId()),this.$Elm)},inject:function(e,i){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,i),this.$Elm.set("data-quiid",this.getId()),this.fireEvent("inject",[this]),this},"import":function(t){return this.$Elm=t,this.$Elm.set("data-quiid",this.getId()),this.fireEvent("import",[this,t]),this},replaces:function(t){return this.$Elm?this.$Elm:("styles"in t&&this.setAttribute("styles",t.styles),this.$Elm=this.create(),this.$Elm.set("data-quiid",this.getId()),this.$Elm.set("data-qui",t.get("data-qui")),t.getParent()&&this.$Elm.replaces(t),this)},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},isHidden:function(){return this.$Elm?"none"==this.$Elm.getStyle("display")?!0:!1:!0},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){if(this.$Elm)try{this.$Elm.focus()}catch(t){}return this},resize:function(){this.fireEvent("resize",[this])},openSheet:function(t,i){var s=this;i=i||{},i=Object.merge({buttons:!0},i);var n=new Element("div",{"class":"qui-sheet qui-box",html:'<div class="qui-sheet-content box"></div><div class="qui-sheet-buttons box"><div class="qui-sheet-buttons-back qui-button btn-white"><span>'+e.get("qui/controls/Control","btn.back")+"</span></div></div>",styles:{left:"-110%"}}).inject(this.$Elm);n.getElement(".qui-sheet-buttons-back").addEvent("click",function(){n.fireEvent("close")});var o=this.getElm().getStyle("overflow");n.addEvent("close",function(){s.getElm().setStyle("overflow",o),moofx(n).animate({left:"-100%",opacity:0},{equation:"ease-in",callback:function(){n.destroy()}})});var r=n.getElement(".qui-sheet-content");return r.setStyles({height:n.getSize().y-50}),this.getElm().setStyle("overflow","hidden"),i.buttons===!1&&n.getElement(".qui-sheet-buttons").destroy(),moofx(n).animate({left:0},{equation:"ease-out",callback:function(){t(r,n)}}),n}})}),define("qui/controls/utils/Background",["qui/controls/Control"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/utils/Background",options:{styles:!1},initialize:function(t){this.parent(t)},create:function(){var t=this;return this.$Elm?this.$Elm:(this.$Elm=new Element("div",{"class":"qui-background",styles:{backgroundColor:"#000000",position:"fixed",width:"100%",height:"100%",top:0,left:0,zIndex:1e3,opacity:.6,display:"none"},events:{click:function(){t.fireEvent("click",[t])}}}),document.body.appendChild(this.$Elm),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.$Elm)}})}),define("qui/lib/require-css/css!qui/controls/loader/Loader",[],function(){}),define("qui/controls/loader/Loader",["qui/controls/Control","qui/Locale","css!qui/controls/loader/Loader.css"],function(t,e){"use strict";return new Class({Extends:t,Type:"qui/controls/loader/Loader",options:{cssclass:"",closetime:5e4,styles:!1},initialize:function(t){this.parent(t),this.$delay=null;this.addEvent("onDestroy",function(){this.$Elm.getParent()&&this.$Elm.getParent().removeClass("qui-loader-parent")})},create:function(){return this.$Elm=new Element("div",{"class":"qui-loader",html:'<div class="qui-loader-message"></div><div class="qui-loader-bar"><div class="qui-loader-dot qui-loader-bar1"></div><div class="qui-loader-dot qui-loader-bar2"></div><div class="qui-loader-dot qui-loader-bar3"></div><div class="qui-loader-dot qui-loader-bar4"></div><div class="qui-loader-dot qui-loader-bar5"></div><div class="qui-loader-dot qui-loader-bar6"></div><div class="qui-loader-dot qui-loader-bar7"></div><div class="qui-loader-dot qui-loader-bar8"></div></div>',styles:{display:"none",opacity:.8}}),this.getAttribute("cssclass")&&this.$Elm.addClass(this.getAttribute("cssclass")),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.$Elm},show:function(t){if(this.$Elm&&this.$Elm.getParent()){var e=this.$Elm.getElement(".qui-loader-message"),i=this.$Elm.getElement(".qui-loader-bar"),s=this.$Elm.getSize();e.set("html","");var n=(s.y-50)/2,o=(s.x-240)/2;0>n&&(s=this.$Elm.measure(function(){return this.getSize()}),n=(s.y-50)/2,o=(s.x-240)/2),i.setStyles({top:n,left:o}),"undefined"!=typeof t&&e.set({html:t,styles:{top:(s.y+20)/2}}),this.$Elm.setStyle("display",""),this.$Elm.getParent().hasClass("qui-window-popup")||this.$Elm.getParent().addClass("qui-loader-parent"),this.getAttribute("closetime")&&(this.$delay&&clearTimeout(this.$delay),this.$delay=function(){this.showCloseButton()}.delay(this.getAttribute("closetime"),this))}},hide:function(){this.$delay&&clearTimeout(this.$delay),this.$Elm&&this.$Elm.setStyle("display","none")},showCloseButton:function(){if(this.$Elm){this.$Elm.set({html:"",styles:{cursor:"pointer"}}),this.$Elm.setStyle("opacity",.9);var t=this;new Element("div",{text:e.get("quiqqer/controls","loader.close"),styles:{"font-weight":"bold","text-align":"center","margin-top":this.$Elm.getSize().y/2-100},events:{click:function(){t.hide()}}}).inject(this.$Elm)}}})}),define("qui/utils/Controls",["qui/QUI"],function(t){"use strict";return{isFontAwesomeClass:function(t){return t?!t.match(/icon-/)&&!t.match(/fa-/)||t.match(/\./)?!1:!0:!1},highlight:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).highlight()}},normalize:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).normalize()}}}}),define("qui/controls/windows/locale/de",["qui/Locale"],function(t){"use strict";return t.set("de","qui/controls/windows/Popup",{"btn.close":"Schließen","btn.back":"Zurück"}),t}),define("qui/controls/windows/locale/en",["qui/Locale"],function(t){"use strict";return t.set("en","qui/controls/windows/Popup",{"btn.close":"Close","btn.back":"Back"}),t}),define("qui/lib/require-css/css!qui/controls/windows/Popup",[],function(){}),define("qui/lib/require-css/css!qui/controls/buttons/Button",[],function(){}),define("qui/controls/windows/Popup",["qui/controls/Control","qui/controls/utils/Background","qui/controls/loader/Loader","qui/Locale","qui/utils/Controls","qui/controls/windows/locale/de","qui/controls/windows/locale/en","css!qui/controls/windows/Popup.css","css!qui/controls/buttons/Button.css"],function(t,e,i,s,n){"use strict";return new Class({Extends:t,Type:"qui/controls/windows/Popup",Binds:["resize","cancel"],options:{maxWidth:900,maxHeight:600,content:!1,icon:!1,title:!1,"class":!1,buttons:!0,closeButton:!0,closeButtonText:s.get("qui/controls/windows/Popup","btn.close"),titleCloseButton:!0},initialize:function(t){this.parent(t),this.$Elm=null,this.$Content=null,this.$Buttons=null,this.Background=new e,this.Loader=new i,window.addEvent("resize",this.resize)},create:function(){if(this.$Elm)return this.$Elm;var t=this;this.$Elm=new Element("div",{"class":"qui-window-popup box",html:'<div class="qui-window-popup-title box"><div class="qui-window-popup-title-icon"></div><div class="qui-window-popup-title-text"></div></div><div class="qui-window-popup-content box"></div><div class="qui-window-popup-buttons box"></div>',tabindex:-1,styles:{left:"-100%"}}),this.$Title=this.$Elm.getElement(".qui-window-popup-title"),this.$Icon=this.$Elm.getElement(".qui-window-popup-title-icon"),this.$TitleText=this.$Elm.getElement(".qui-window-popup-title-text"),this.$Content=this.$Elm.getElement(".qui-window-popup-content"),this.$Buttons=this.$Elm.getElement(".qui-window-popup-buttons"),this.getAttribute("titleCloseButton")&&new Element("div",{"class":"icon-remove fa fa-remove",styles:{cursor:"pointer","float":"right",lineHeight:17,width:17},events:{click:function(){t.cancel()}}}).inject(this.$Title);var e=this.getAttribute("icon");if(e&&n.isFontAwesomeClass(e)?this.$Icon.addClass(e):e&&new Element("img",{src:e}).inject(this.$Icon),this.getAttribute("title")&&this.$TitleText.set("html",this.getAttribute("title")),this.getAttribute("title")||this.getAttribute("icon")||this.$Title.setStyle("display","none"),this.getAttribute("buttons")&&this.getAttribute("closeButton")){{new Element("button",{html:"<span>"+this.getAttribute("closeButtonText")+"</span>","class":"qui-button btn-red",events:{click:this.cancel},styles:{display:"inline","float":"none",width:150,textAlign:"center"}}).inject(this.$Buttons)}this.$Buttons.setStyles({"float":"left",margin:"0 auto",textAlign:"center",width:"100%"})}return this.getAttribute("buttons")||this.$Buttons.setStyle("display","none"),this.getAttribute("content")&&this.setContent(this.getAttribute("content")),this.getAttribute("class")&&this.$Elm.addClass(this.getAttribute("class")),this.Loader.inject(this.$Elm),this.fireEvent("create",[this]),this.$Elm},open:function(){var t=this;this.Background.create(),this.Background.getElm().addEvent("click",this.cancel),this.Background.show(),this.inject(document.body),this.$oldBodyStyle={overflow:document.body.style.overflow,position:document.body.style.position,width:document.body.style.width,top:document.body.style.top,scroll:document.body.getScroll()},document.body.setStyles({width:document.body.getSize().x}),document.body.setStyles({overflow:"hidden",position:"fixed",top:-1*this.$oldBodyStyle.scroll.y}),function(){var e=document.body.getStyle("width").toInt(),i=document.getSize().x;i-e&&new Element("div",{"class":"__qui-scroll-bar-placeholder",styles:{background:"#CCC",height:"100%",position:"fixed",right:0,top:0,width:i-e}}).inject(document.body),t.resize(!0),t.fireEvent("open",[t])}.delay(20)},resize:function(t){if(this.$Elm){t=t||!1,this.fireEvent("resizeBegin",[this]);var e=this,i=document.body.getSize(),s=Math.max(document.documentElement.clientWidth,window.innerWidth||0),n=Math.max(document.documentElement.clientHeight,window.innerHeight||0);s>this.getAttribute("maxWidth")&&(s=this.getAttribute("maxWidth")),n>this.getAttribute("maxHeight")&&(n=this.getAttribute("maxHeight"));var o=(i.y-n)/2,r=-1*i.x;if(0>o&&(o=0),0>r&&(r=0),this.$Elm.setStyles({height:n,width:s,top:o}),t===!1&&this.$Elm.setStyles({left:r}),this.$Buttons){for(var l=this.$Buttons.getChildren(),u=0,a=l.length-1;a>u;u++)"undefined"!=typeof l[u]&&l[u].setStyle("marginRight",10);l.length&&this.$Buttons.setStyles({height:l[0].getComputedSize().totalHeight+20})}var d=n-this.$Buttons.getSize().y-this.$Title.getSize().y;this.$Content.setStyles({height:d});var r=(i.x-s)/2;return 0==t?(this.$Elm.setStyle("left",r),void this.fireEvent("resize",[this])):void moofx(this.$Elm).animate({left:r},{equation:"ease-out",callback:function(){e.$Elm.focus(),e.fireEvent("resize",[e])}})}},close:function(){if(window.removeEvent("resize",this.resize),document.getElements(".__qui-scroll-bar-placeholder").destroy(),"undefined"!=typeof this.$oldBodyStyle&&(document.body.setStyles({overflow:this.$oldBodyStyle.overflow||null,position:this.$oldBodyStyle.position||null,width:this.$oldBodyStyle.width||null,top:this.$oldBodyStyle.top||null}),document.body.scrollTo(this.$oldBodyStyle.scroll.x,this.$oldBodyStyle.scroll.y)),this.$Elm){var t=this;moofx(this.$Elm).animate({left:-1*document.getSize().x,opacity:0},{equation:"ease-in",callback:function(){t.fireEvent("close",[t]),t.$Elm.destroy(),t.Background.destroy()}})}},cancel:function(){this.fireEvent("cancel",[this]),this.close()},getContent:function(){return this.$Content},setContent:function(t){this.getContent().set("html",t)},addButton:function(t){if(!this.$Buttons)return this;var e=t;return t.inject(this.$Buttons,"top"),"element"!=typeOf(t)&&(e=t.getElm()),e.setStyles({display:"inline","float":"none"}),this.$Buttons.setStyles({height:e.getComputedSize().totalHeight}),this},hideButtons:function(){return this.$Buttons?void this.$Buttons.setStyle("display","none"):this},showButtons:function(){return this.$Buttons?void this.$Buttons.setStyle("display",""):this},openSheet:function(t){var e=new Element("div",{"class":"qui-window-popup-sheet box",html:'<div class="qui-window-popup-sheet-content box"></div><div class="qui-window-popup-sheet-buttons box"><div class="back button btn-white"><span>'+s.get("qui/controls/windows/Popup","btn.back")+"</span></div></div>",styles:{left:"-110%"}}).inject(this.$Elm);e.getElement(".back").addEvent("click",function(){e.fireEvent("close")}),e.addEvent("close",function(){moofx(e).animate({left:"-100%"},{callback:function(){e.destroy()}})});var i=e.getElement(".qui-window-popup-sheet-content");i.setStyles({height:e.getSize().y-80}),moofx(e).animate({left:0},{callback:function(){t(i,e)}})}})});
//# sourceMappingURL=Popup.js.map