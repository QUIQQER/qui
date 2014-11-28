define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t),this.fireEvent("init",[this])},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return this.options[t]=e,this;var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)t.hasOwnProperty(e)&&this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([e],i)},isControl:function(t){return"undefined"!=typeof t&&t?"undefined"!=typeof t.getType:!1},add:function(t){var e=this,i=t.getAttribute("name"),s=typeOf(t);i&&""!==i||(i="#unknown"),"undefined"==typeof this.$controls[i]&&(this.$controls[i]=[]),"undefined"==typeof this.$types[s]&&(this.$types[s]=[]),this.$controls[i].push(t),this.$types[s].push(t),this.$cids[t.getId()]=t,t.addEvent("onDestroy",function(){e.destroy(t)})},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),s=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[s]&&delete this.$cids[s];var n,r,o=[];if("undefined"!=typeof this.$controls[e]){for(n=0,r=this.$controls[e].length;r>n;n++)s!==this.$controls[e][n].getId()&&o.push(this.$controls[e][n]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[i])for(n=0,r=this.$types[i].length;r>n;n++)s!==this.$types[i][n].getId()&&o.push(this.$types[i][n]);this.$types[i]=o}})});var needle=["qui/classes/DOM"];("undefined"==typeof window.localStorage||"undefined"==typeof window.sessionStorage)&&needle.push("qui/classes/storage/Polyfill"),define("qui/classes/storage/Storage",needle,function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/storage/Storage",$data:{},set:function(t,e){try{window.localStorage.setItem(t,e)}catch(i){this.$data[t]=e}},get:function(t){try{return window.localStorage.getItem(t)}catch(e){}return"undefined"!=typeof this.$data[t]?this.$data[t]:null},remove:function(t){try{window.localStorage.removeItem(t)}catch(e){}"undefined"!=typeof this.$data[t]&&delete this.$data[t]},clear:function(){this.$data={};try{window.localStorage.clear()}catch(t){}}})}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls","qui/classes/storage/Storage"],function(t,e,i,s){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){if(this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")){var n=this;t.onError=function(t,e){n.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)}this.Controls=new i,this.Storage=new s,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,s=0,n=0,r=e.length,o=null,u=null;r>s;s+=1)for(o=e[s].split("."),t=o.length,n=0;t>n;n+=1)u=o[n],i[u]=i[u]||{},i=i[u];return i},parse:function(e,i){if("undefined"==typeof e&&(e=document.body),"element"!==typeOf(e))return void("undefined"!=typeof i&&i());var s=e.getElements("[data-qui]"),n=s.map(function(t){return t.get("data-qui")});t(n,function(){var t,e,r,o,u={TEXTAREA:!0,INPUT:!0};for(t=0,e=n.length;e>t;t++)r=arguments[t],o=s[t],o.get("data-quiid")||(""!==o.get("html").trim()||"undefined"!=typeof u[o.nodeName]?(new r).import(o):(new r).replaces(o));"undefined"!=typeof i&&i()})},triggerError:function(t){return this.trigger(t.getMessage(),"",0)},trigger:function(t,e,i){return this.fireEvent("error",[t,e,i]),this},getMessageHandler:function(e){if("undefined"!=typeof this.$execGetMessageHandler&&!this.MessageHandler)return this.$execGetMessageHandler=!0,void function(){this.getMessageHandler(e)}.delay(20,this);if(this.$execGetMessageHandler=!0,this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){this.Controls&&t(this.Controls)}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),document.addEvent("domready",function(){window.QUI.parse(document.body)}),window.QUI}),define("qui/classes/Locale",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/Locale",current:"en",langs:{},no_translation:!1,initialize:function(t){this.parent(t)},setCurrent:function(t){this.current=t},getCurrent:function(){return this.current},set:function(t,e,i,s){if(this.langs[t]||(this.langs[t]={}),this.langs[t][e]||(this.langs[t][e]={}),"undefined"!=typeof s)return this.langs[t][e][i]=s,this;var n=this.langs[t][e];for(var r in i)i.hasOwnProperty(r)&&(n[r]=i[r]);this.langs[t][e]=n},get:function(t,e,i){if("undefined"==typeof i)return this.$get(t,e);var s=this.$get(t,e);for(t in i)i.hasOwnProperty(t)&&(s=s.replace("["+t+"]",i[t]));return s},$get:function(t,e){return this.no_translation?"["+t+"] "+e:this.langs[this.current]&&this.langs[this.current][t]&&this.langs[this.current][t][e]?this.langs[this.current][t][e]:this.langs[this.current]&&this.langs[this.current][t]&&"undefined"==typeof e?this.langs[this.current][t]:(this.fireEvent("error",["No translation found for ["+t+"] "+e,this]),"["+t+"] "+e)}})}),define("qui/Locale",["qui/classes/Locale"],function(t){"use strict";return"undefined"==typeof window.QUILocale&&(window.QUILocale=new t),window.QUILocale}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,n){if(t.match(u)||t.match(o))return t;t=r(t);var h=n.match(o),a=i.match(o);return!a||h&&h[1]==a[1]&&h[2]==a[2]?s(e(t,i),n):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(o))return t;var i=e.split("/"),s=t.split("/");for(i.pop();curPart=s.shift();)".."==curPart?i.pop():i.push(curPart);return i.join("/")}function s(t,e){var s=e.split("/");for(s.pop(),e=s.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),s=e.split("/");var n=t.split("/");for(out="";s.shift();)out+="../";for(;curPart=n.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var n=/([^:])\/+/g,r=function(t){return t.replace(n,"$1/")},o=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,h=function(e,i,s){i=r(i),s=r(s);for(var n,o,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;n=u.exec(e);){o=n[3]||n[2]||n[5]||n[6]||n[4];var h;h=t(o,i,s);var a=n[5]||n[6]?1:0;e=e.substr(0,u.lastIndex-o.length-a-1)+h+e.substr(u.lastIndex-a-1),u.lastIndex=u.lastIndex+(h.length-o.length)}return e};return h.convertURIBase=t,h.absoluteURI=e,h.relativeURI=s,h}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,i){i()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,i=!1,s=!0;e[1]||e[7]?i=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?s=!1:e[4]&&(i=parseInt(e[4])<18);var n={};n.pluginBuilder="./css-builder";var r,o,u,h=function(){r=document.createElement("style"),t.appendChild(r),o=r.styleSheet||r.sheet},a=0,l=[],c=function(t){a++,32==a&&(h(),a=0),o.addImport(t),r.onload=d},d=function(){u();var t=l.shift();return t?(u=t[1],void c(t[0])):void(u=null)},f=function(t,e){if(o&&o.addImport||h(),o&&o.addImport)u?l.push([t,e]):(c(t),u=e);else{r.textContent='@import "'+t+'";';var i=setInterval(function(){try{r.sheet.cssRules,clearInterval(i),e()}catch(t){}},10)}},g=function(e,i){var n=document.createElement("link");if(n.type="text/css",n.rel="stylesheet",s)n.onload=function(){n.onload=function(){},setTimeout(i,7)};else var r=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==n.href)return clearInterval(r),i()}},10);n.href=e,t.appendChild(n)};return n.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},n.load=function(t,e,s){(i?f:g)(e.toUrl(t+".css"),s)},n}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/Locale","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e,i){"use strict";return new Class({Extends:i,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),this.addEvent("onDestroy",function(){"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null}.bind(this)),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.qui-control"),this.$Elm.set("data-quiid",this.getId()),this.$Elm)},inject:function(e,i){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,i),this.$Elm.set("data-quiid",this.getId()),this.fireEvent("inject",[this]),this},"import":function(t){return this.$Elm=t,this.$Elm.set("data-quiid",this.getId()),this.fireEvent("import",[this,t]),this},replaces:function(t){return this.$Elm?this.$Elm:("styles"in t&&this.setAttribute("styles",t.styles),this.$Elm=this.create(),this.$Elm.set("data-quiid",this.getId()),this.$Elm.set("data-qui",t.get("data-qui")),t.getParent()&&this.$Elm.replaces(t),this)},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},isHidden:function(){return this.$Elm?"none"==this.$Elm.getStyle("display"):!0},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){if(this.$Elm)try{this.$Elm.focus()}catch(t){}return this},resize:function(){this.fireEvent("resize",[this])},openSheet:function(t,i){var s=this;i=i||{},i=Object.merge({buttons:!0},i);var n=new Element("div",{"class":"qui-sheet qui-box",html:'<div class="qui-sheet-content box"></div><div class="qui-sheet-buttons box"><div class="qui-sheet-buttons-back qui-button btn-white"><span>'+e.get("qui/controls/Control","btn.back")+"</span></div></div>",styles:{left:"-110%"}}).inject(this.$Elm);n.getElement(".qui-sheet-buttons-back").addEvent("click",function(){n.fireEvent("close")});var r=this.getElm().getStyle("overflow");n.addEvent("close",function(){s.getElm().setStyle("overflow",r),moofx(n).animate({left:"-100%",opacity:0},{equation:"ease-in",callback:function(){n.destroy()}})});var o=n.getElement(".qui-sheet-content");return o.setStyles({height:n.getSize().y-50}),this.getElm().setStyle("overflow","hidden"),i.buttons===!1&&n.getElement(".qui-sheet-buttons").destroy(),moofx(n).animate({left:0},{equation:"ease-out",callback:function(){t(o,n)}}),n}})}),define("qui/utils/Elements",{isInViewport:function(t){"use strict";var e=t.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)},getComputedZIndex:function(t){"use strict";var e,i,s,n=0,r=t.getParents();for(e=0,s=r.length;s>e;e++)i=r[e].getStyle("zIndex"),"auto"!=i&&i>n&&(n=i);return n},getChildIndex:function(t){"use strict";return Array.prototype.indexOf.call(t.getParent().children,t)},getCursorPosition:function(t){"use strict";if("INPUT"!==t.nodeName)return null;if("selectionStart"in t)return t.selectionStart;if(document.selection){t.focus();var e=document.selection.createRange(),i=e.text.length;return e.moveStart("character",-t.value.length),e.text.length-i}return null},setCursorPosition:function(t,e){"use strict";if("INPUT"!==t.nodeName&&"TEXTAREA"!==t.nodeName)return null;if(t.createTextRange){var i=t.createTextRange();return i.move("character",e),void i.select()}return t.selectionStart?(t.focus(),void t.setSelectionRange(e+1,e+1)):void t.focus()}}),define("qui/lib/require-css/css!qui/controls/contextmenu/Menu",[],function(){}),define("qui/controls/contextmenu/Menu",["qui/QUI","qui/controls/Control","qui/utils/Elements","css!qui/controls/contextmenu/Menu.css"],function(t,e,i){"use strict";return new Class({Extends:e,Type:"qui/controls/contextmenu/Menu",Binds:["$keyup"],options:{styles:null,width:200,title:!1,shadow:!0,corner:!1,dragable:!1},initialize:function(t){this.parent(t),this.$items=[],this.$Title=null,this.$Active=null},create:function(){this.$Elm=new Element("div.qui-contextmenu",{html:'<div class="qui-contextmenu-container"></div>',tabindex:-1,styles:{display:"none",outline:"none","-moz-outline":"none"},events:{blur:function(){this.fireEvent("blur",[this])}.bind(this),keyup:this.$keyup},"data-quiid":this.getId()}),this.$Container=this.$Elm.getElement(".qui-contextmenu-container"),this.getAttribute("width")&&this.$Elm.setStyle("width",this.getAttribute("width")),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.getAttribute("title")&&this.setTitle(this.getAttribute("title")),this.getAttribute("shadow")&&this.$Container.addClass("qui-contextmenu-shadow");for(var t=0,e=this.$items.length;e>t;t++)this.$items[t].inject(this.$Container);return this.$Elm},show:function(){if(!this.$Elm)return this;var e=this.$Elm.getParent(),s=this.$Elm;switch(this.getAttribute("corner")&&(s.removeClass("qui-context-corner-top"),s.removeClass("qui-context-corner-bottom"),s.removeClass("qui-context-corner-left"),s.removeClass("qui-context-corner-left")),this.getAttribute("corner")){case"top":s.addClass("qui-context-corner-top");break;case"bottom":s.addClass("qui-context-corner-bottom");break;case"left":s.addClass("qui-context-corner-left");break;case"right":s.addClass("qui-context-corner-right")}if(this.getParent()&&t.Controls.isControl(this.getParent())){var n=this.getParent().getElm();n&&s.setStyle("zIndex",i.getComputedZIndex(n)+1)}s.setStyles({display:""});var r=s.getSize();if(this.$Container.setStyles({height:r.y}),this.setAttribute("menuPosLeft",!1),"BODY"===e.nodeName){var o=s.getPosition(),u=e.getSize();o.x+r.x+50>u.x&&this.$Elm.setStyle("left",u.x-r.x-50),o.y+r.y+50>u.y&&this.$Elm.setStyle("top",u.y-r.y-50)}return this.$Active&&this.$Active.setActive(),this.fireEvent("show",[this]),this},hide:function(){return this.getElm().setStyles({display:"none"}),this.fireEvent("hide",[this]),this},focus:function(){return this.getElm().focus(),this.fireEvent("focus",[this]),this},setPosition:function(t,e){return this.$Elm&&this.$Elm.setStyles({left:t,top:e}),this},setTitle:function(t){return this.$Container&&!this.$Title&&(this.$Title=new Element("div.qui-contextmenu-title"),this.$Title.inject(this.$Container,"top")),this.$Title&&this.$Title.set("html",t),this.setAttribute("title",t),this},getChildren:function(t){if("undefined"!=typeof t){var e,i,s=this.$items;for(e=0,i=s.length;i>e;e++)if(s[e].getAttribute("name")==t)return s[e];return!1}return this.$items},firstChild:function(){return this.$items[0]?this.$items[0]:!1},count:function(){return this.$items.length},appendChild:function(t){return t&&"undefined"!=typeof t?(this.$items.push(t),t.setParent(this),this.getAttribute("dragable")&&t.setAttribute("dragable",!0),this.$Container&&t.inject(this.$Container),this):this},clearChildren:function(){for(var t=0,e=this.$items.length;e>t;t++)this.$items[t]&&this.$items[t].destroy();return this.$items=[],this},clear:function(){return this.clearChildren()},getActive:function(){return this.$Active?this.$Active:!1},getNext:function(t){for(var e=0,i=this.$items.length;i>e;e++)if(this.$items[e]==t&&"undefined"!=typeof this.$items[e+1])return this.$items[e+1];return!1},getPrevious:function(t){for(var e=this.$items.length-1;e>=0;e--){if(0===e)return!1;if(this.$items[e]==t)return this.$items[e-1]}return!1},deselectItems:function(){return this.$Active&&(this.$Active=null),this},$keyup:function(t){return"down"===t.key?void this.down():"up"===t.key?void this.up(t):void("enter"===t.key&&this.select(t))},up:function(){if(this.$items.length){var t=this.$items.length;if(!this.$Active)return void this.$items[t-1].setActive();var e=this.getPrevious(this.$Active);return this.$Active.setNormal(),e?void e.setActive():void this.$items[t-1].setActive()}},down:function(){if(this.$items.length){if(!this.$Active)return void this.$items[0].setActive();var t=this.getNext(this.$Active);return this.$Active.setNormal(),t?void t.setActive():void this.$items[0].setActive()}},select:function(t){this.$Active&&(this.$Active.fireEvent("mouseDown",[this.$Active,t]),this.$Active.fireEvent("click",[this.$Active,t]))}})}),define("qui/classes/utils/DragDrop",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/utils/DragDrop",Binds:["$complete","$onDrag","$onDrop","$onLeave","$onEnter"],options:{dropables:[document.body],styles:!1,cssClass:!1,delay:500,limit:{x:!1,y:!1}},initialize:function(t,e){var i=this;this.parent(e),this.$Drag=null,this.$Element=t,this.$enable=!0,"undefined"!=typeof t&&t.addEvents({mousedown:function(t){i.$enable&&(i.setAttribute("_stopdrag",!1),i.$timer=i.$start.delay(i.getAttribute("delay"),i,t),t.stop())},mouseup:function(t){"undefined"!=typeof i.$timer&&clearTimeout(i.$timer),i.$stop(t)}})},getElm:function(){return this.$Elm},enable:function(){this.$enable=!0},disable:function(){this.$enable=!1},$start:function(t){if(this.$enable&&!(t.rightClick||Browser.ie8||this.getAttribute("_mousedown")||this.getAttribute("_stopdrag"))){this.setAttribute("_mousedown",!0);var e=t.page.x,i=t.page.y,s=this.$Element,n=s.getSize(),r=this.getAttribute("limit"),o=document.body.getSize();this.$Drag=new Element("div",{"class":"box",styles:{position:"absolute",top:i-20,left:e-40,zIndex:1e3,MozOutline:"none",outline:0,color:"#fff",padding:10,cursor:"pointer",width:n.x,height:n.y,background:"rgba(0,0,0, 0.5)"}}).inject(document.body),this.getAttribute("styles")&&this.$Drag.setStyles(this.getAttribute("styles")),this.getAttribute("cssClass")&&this.$Drag.addClass(this.getAttribute("cssClass")),this.$Drag.focus(),this.fireEvent("start",[this,this.$Drag,t]),r.x||(r.x=[0,o.x-this.$Drag.getSize().x]),r.y||(r.y=[0,o.y-this.$Drag.getSize().y]);var u=this.getAttribute("dropables");"array"===typeOf(u)&&(u=u.join(",")),new Drag.Move(this.$Drag,{precalculate:!0,droppables:u,onComplete:this.$complete,onDrop:this.$onDrop,onEnter:this.$onEnter,onLeave:this.$onLeave,onDrag:this.$onDrag,limit:r}).start({page:{x:e,y:i}})}},$stop:function(){if(!Browser.ie8){if(!this.getAttribute("_mousedown"))return void this.setAttribute("_stopdrag",!0);this.setAttribute("_mousedown",!1),("undefined"!=typeof this.$Drag||this.$Drag)&&(this.fireEvent("stop",[this,this.$Drag]),this.$Drag.destroy(),this.$Drag=null)}},$complete:function(t){this.fireEvent("complete",[this,t]),this.$stop()},$onDrag:function(t,e){this.fireEvent("drag",[this,t,e])},$onDrop:function(t,e,i){this.fireEvent("drop",[this,t,e,i])},$onEnter:function(t,e){this.fireEvent("enter",[this,t,e])},$onLeave:function(t,e){this.fireEvent("leave",[this,t,e])}})}),define("qui/utils/Controls",["qui/QUI"],function(t){"use strict";return{isFontAwesomeClass:function(t){return t?(t.match(/icon-/)||t.match(/fa-/))&&!t.match(/\./):!1},highlight:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).highlight()}},normalize:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).normalize()}}}}),define("qui/lib/require-css/css!qui/controls/contextmenu/Item",[],function(){}),define("qui/controls/contextmenu/Item",["qui/QUI","qui/controls/Control","qui/classes/utils/DragDrop","qui/controls/contextmenu/Menu","qui/utils/Controls","css!qui/controls/contextmenu/Item.css"],function(QUI,Control,DragDrop,ContextMenu,Utils){"use strict";return new Class({Extends:Control,Type:"qui/controls/contextmenu/Item",Binds:["$onSetAttribute","$stringEvent","$onClick","$onInject","$onMouseEnter","$onMouseLeave","$onMouseUp","$onMouseDown"],options:{text:"",icon:"",styles:null,dragable:!1},initialize:function(options){options=options||{};var self=this,items=options.items||[];delete options.items,this.parent(options),this.$items=[],this.$path="",this.$disabled=!1,this.$Elm=null,this.$Container=null,this.$Menu=null,this.$Text=null,"undefined"!=typeof options.disabled&&options.disabled&&(this.$disabled=!0),this.addEvent("onSetAttribute",this.$onSetAttribute),this.addEvent("onInject",this.$onInject),items.length&&this.insert(items),this.getAttribute("onClick")&&this.addEvent("onClick",function(){try{eval(self.getAttribute("onClick")+"( self )")}catch(e){console.error(e)}})},create:function(){var t,e,i=this;if(this.$Elm=new Element("div.qui-contextitem",{html:'<div class="qui-contextitem-container"><span class="qui-contextitem-icon"></span><span class="qui-contextitem-text"></span></div>',"data-quiid":this.getId(),tabindex:-1,events:{mouseenter:this.$onMouseEnter,mouseleave:this.$onMouseLeave}}),this.$Container=this.$Elm.getElement(".qui-contextitem-container"),this.$Text=this.$Elm.getElement(".qui-contextitem-text"),this.$Container.addEvents({click:this.$onClick,mousedown:this.$onMouseDown,mouseup:this.$onMouseUp}),this.getAttribute("icon")&&""!==this.getAttribute("icon")){var s=this.$Elm.getElement(".qui-contextitem-icon"),n=this.getAttribute("icon");Utils.isFontAwesomeClass(n)?s.addClass(n):s.setStyle("background-image","url("+n+")")}if(this.getAttribute("text")&&""!==this.getAttribute("text")){var r=this.$Elm.getElement(".qui-contextitem-text");r.set({html:this.getAttribute("text")}),this.$onInject.delay(500)}if(this.getAttribute("dragable")&&new DragDrop(this.$Elm,{dropables:".qui-contextitem-dropable",events:{onEnter:function(t,e,i){if(i){var s=i.get("data-quiid");s&&QUI.Controls.getById(s).highlight()}},onLeave:function(t,e,i){if(i){var s=i.get("data-quiid");s&&QUI.Controls.getById(s).normalize()}},onDrop:function(t,e,s){if(s){var n=s.get("data-quiid");if(n){var r=QUI.Controls.getById(n);r.normalize(),r.appendChild(i)}}}}}),e=this.$items.length){this.$Elm.addClass("haschildren");var o=this.getContextMenu();for(t=0;e>t;t++)o.appendChild(this.$items[t])}return this.isDisabled()&&this.disable(),this.$Elm},$onInject:function(){var t=this.$Container.getElement(".qui-contextitem-icon"),e=this.$Container.getElement(".qui-contextitem-text"),i=t.measure(function(){return this.getComputedSize()}),s=this.$Container.measure(function(){return this.getComputedSize()});e.setStyle("width",s.width-i.totalWidth)},insert:function(t){var e=this;return require(["qui/controls/contextmenu/Item","qui/controls/contextmenu/Seperator"],function(i,s){for(var n=0,r=t.length;r>n;n++)e.getAttribute("dragable")&&(t[n].dragable=!0),e.appendChild("qui/controls/contextmenu/Seperator"!=t[n].type?new i(t[n]):new s(t[n]))}),this},click:function(){this.$onClick(!1)},appendChild:function(t){return this.$items.push(t),t.setParent(this),this.$Elm&&(this.$Elm.addClass("haschildren"),t.inject(this.getContextMenu())),this.fireEvent("append",[this,t]),this},disable:function(){return this.$disabled=!0,this.$Elm?(this.$Elm.addClass("qui-contextitem-disabled"),this):this},isDisabled:function(){return this.$disabled},enable:function(){return this.$disabled=!1,this.$Elm?(this.$Elm.removeClass("qui-contextitem-disabled"),this):this},setActive:function(){return this.$Elm&&this.$Elm.hasClass("qui-contextitem-active")?this:(this.$Elm&&(this.$Menu?this.$Container.addClass("qui-contextitem-active"):this.$Elm.addClass("qui-contextitem-active")),this.fireEvent("active",[this]),this)},setNormal:function(){return this.$Elm?(this.$Menu?this.$Container.removeClass("qui-contextitem-active"):this.$Elm.removeClass("qui-contextitem-active"),this.fireEvent("normal",[this]),this):this},getChildren:function(t){return"undefined"!=typeof t?t==this.getAttribute("name")+"-menu"?this.getContextMenu():this.getContextMenu().getChildren(t):this.getContextMenu().getChildren()},getTextElm:function(){return this.$Text},clear:function(){return this.getContextMenu().clear(),this.$items=[],this},getContextMenu:function(){return this.$Menu?this.$Menu:(this.$Menu=new ContextMenu({name:this.getAttribute("name")+"-menu",corner:"left",events:{onShow:function(t){for(var e=t.getChildren(),i=0,s=e.length;s>i;i++)e[i].setNormal()}}}),this.$Menu.inject(this.$Elm),this.$Menu.hide(),this.$Menu.setParent(this),this.$Menu)},$onSetAttribute:function(t,e){if(this.$Elm){if("text"==t)return void this.$Elm.getElement(".qui-contextitem-text").set("html",e);if("icon"==t){var i=this.$Elm.getElement(".qui-contextitem-icon");i.className="qui-contextitem-icon",i.setStyle("background-image",null),Utils.isFontAwesomeClass(e)?i.addClass(e):this.$Container.setStyle("background-image","url("+e+")")}}},$stringEvent:function(event){eval("("+event+"(this));")},$onClick:function(t){if(!this.$disabled){this.fireEvent("click",[this,t]);var e=this.getParent();e&&this.getParent().hide()}},$onMouseEnter:function(){if(!this.$disabled){if(this.$Menu){var t=this.$Elm.getSize(),e=this.$Menu.getParent();if(this.$Menu.setPosition(t.x,0),this.$Menu.show(),e){var i=this.$Menu.getElm(),s=i.getPosition(),n=i.getSize(),r=document.body.getSize();s.x+t.x>r.x&&this.$Menu.setPosition(0-n.x,0)}this.$Container.addClass("qui-contextitem-active")}this.setActive()}},$onMouseLeave:function(){this.$disabled||(this.$Menu&&this.$Menu.hide(),this.$Container.removeClass("qui-contextitem-active"),this.setNormal())},$onMouseUp:function(t){this.fireEvent("mouseUp",[this,t]),this.getAttribute("dragable")===!1&&t.stop()},$onMouseDown:function(t){this.fireEvent("mouseDown",[this,t]),this.getAttribute("dragable")===!1&&t.stop()}})}),define("qui/lib/require-css/css!qui/controls/taskbar/Task",[],function(){}),define("qui/controls/taskbar/Task",["qui/QUI","qui/controls/Control","qui/classes/utils/DragDrop","qui/utils/Controls","css!qui/controls/taskbar/Task.css"],function(t,e,i,s){"use strict";return new Class({Extends:e,Type:"qui/controls/taskbar/Task",Binds:["close","click","$onDestroy"],options:{name:"qui-task",icon:!1,text:"",cssClass:"",closeable:!0,dragable:!0},initialize:function(t,e){if(this.$Instance=t||null,this.$Elm=null,this.addEvents({onDestroy:this.$onDestroy}),"undefined"!=typeof t){var i=this;t.setAttribute("Task",this),t.addEvent("onRefresh",function(){i.refresh()}),t.addEvent("onSetAttribute",function(){i.refresh()}),t.addEvent("onDestroy",function(){i.$Instance=null,i.destroy()}),this.parent(e)}},serialize:function(){return{attributes:this.getAttributes(),type:this.getType(),instance:this.getInstance()?this.getInstance().serialize():""}},unserialize:function(t){this.setAttributes(t.attributes);var e=t.instance;return e?void require([e.type],function(e){var i=new e(t.instance);i.unserialize(t.instance),this.initialize(i,t.attributes)}.bind(this)):this},create:function(){if(this.$Elm)return this.$Elm;var e=this;if(this.$Elm=new Element("div",{"class":"qui-task box",html:'<span class="qui-task-icon"></span><span class="qui-task-text"></span>',styles:{outline:"none"},tabindex:-1,events:{click:e.click,focus:function(t){e.fireEvent("focus",[e,t])},blur:function(t){e.fireEvent("blur",[e,t])},contextmenu:function(t){e.fireEvent("contextMenu",[e,t]),t.stop()}}}),this.getAttribute("dragable")){var s=null;new i(this.$Elm,{dropables:".qui-task-drop",events:{onStart:function(t,i,s){e.fireEvent("dragDropStart",[e,i,s])},onComplete:function(){e.fireEvent("dragDropComplete",[e])},onDrag:function(t,i,n){e.fireEvent("drag",[e,n]),s&&s.fireEvent("dragDropDrag",[e,n])},onEnter:function(i,n,r){var o=r.get("data-quiid");o&&(s=t.Controls.getById(o),s&&s&&s.fireEvent("dragDropEnter",[e,n]))},onLeave:function(t,i){s&&(s.fireEvent("dragDropLeave",[e,i]),s=null)},onDrop:function(t,i,n,r){n&&s&&s.fireEvent("dragDropDrop",[e,i,n,r])}}})}return this.getAttribute("cssClass")&&this.$Elm.addClass(this.getAttribute("cssClass")),this.getAttribute("closeable")&&new Element("div",{"class":"qui-task-close",html:'<span class="icon-remove"></span>',events:{click:this.close}}).inject(this.$Elm),"undefined"!=typeof this.$serialize&&this.unserialize(this.$serialize),this.refresh(),this.$Elm},refresh:function(){if(!this.$Elm)return void this.fireEvent("refresh",[this]);var t=this.$Elm.getElement(".qui-task-icon"),e=this.$Elm.getElement(".qui-task-text");if(this.getIcon()){var i=this.getIcon();t.className="qui-task-icon",t.setStyle("background-image",null),s.isFontAwesomeClass(i)?t.addClass(i):t.setStyle("background-image","url("+i+")")}var n=this.getDescription(),r=this.getText();r||(r=""),!n&&r&&(n=r),n||(n=""),this.$Elm.set("title",n),e.set("html",r),this.fireEvent("refresh",[this])},getIcon:function(){return this.getInstance()?this.getInstance().getAttribute("icon"):""},getText:function(){return this.getInstance()?this.getInstance().getAttribute("title"):""},getDescription:function(){return this.getInstance()?this.getInstance().getAttribute("description"):""},getInstance:function(){return this.$Instance},setInstance:function(t){this.$Instance=t},getTaskbar:function(){var t=this.getParent();return"qui/controls/taskbar/Group"==typeOf(t)&&(t=t.getParent()),t},activate:function(){return this.isActive()||!this.$Elm?this:(this.$Elm.addClass("active"),this.fireEvent("activate",[this]),this)},normalize:function(){return this.$Elm&&(this.$Elm.removeClass("active"),this.$Elm.removeClass("highlight"),this.$Elm.removeClass("select"),this.$Elm.setStyle("display",null)),this.fireEvent("normalize",[this]),this},highlight:function(){return this.$Elm&&this.$Elm.addClass("highlight"),this.fireEvent("highlight",[this]),this},deHighlight:function(){return this.$Elm&&this.$Elm.removeClass("highlight"),this.fireEvent("deHighlight",[this]),this},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},isActive:function(){return this.$Elm?this.$Elm.hasClass("active"):!1},click:function(t){return this.fireEvent("click",[this,t]),this.isActive()||this.activate(),this
},close:function(t){return this.fireEvent("close",[this,t]),this.destroy(),this},focus:function(){return this.$Elm&&this.$Elm.focus(),this},select:function(){return this.$Elm&&this.$Elm.addClass("select"),this.fireEvent("select",[this]),this},isSelected:function(){return this.$Elm?this.$Elm.hasClass("select"):!1},unselect:function(){return this.$Elm&&this.$Elm.removeClass("select"),this.fireEvent("unselect",[this]),this},$onDestroy:function(){this.getInstance()&&this.getInstance().destroy(),this.$Instance=null}})}),define("qui/lib/require-css/css!qui/controls/taskbar/Group",[],function(){}),define("qui/controls/taskbar/Group",["qui/QUI","qui/controls/Control","qui/controls/contextmenu/Menu","qui/controls/contextmenu/Item","qui/classes/utils/DragDrop","qui/controls/taskbar/Task","css!qui/controls/taskbar/Group.css"],function(t,e,i,s,n){"use strict";return new Class({Extends:e,Type:"qui/controls/taskbar/Group",Binds:["dissolve","close","click","$onTaskRefresh","$onMenuClick"],options:{icon:!1,text:"..."},initialize:function(t){t=t||{},this.parent(t),this.$tasks={},this.$Elm=null,this.$Menu=null,this.$Active=null,this.$ContextMenu=null;var e=this;this.addEvent("onDestroy",function(){e.$Menu&&e.$Menu.destroy(),e.$ContextMenu&&e.$ContextMenu.destroy();for(var t=e.getTasks(),i=0,s=t.length;s>i;i++)t[i].removeEvent("refresh",e.$onTaskRefresh)})},create:function(){var e=this;this.$Elm=new Element("div",{"class":"qui-taskgroup radius5 box",html:'<div class="qui-taskgroup-container"><span class="qui-taskgroup-icon"></span><span class="qui-taskgroup-text"></span></div><div class="qui-taskgroup-menu"></div>',styles:{outline:"none"},tabindex:-1,events:{focus:function(){e.fireEvent("focus",[e])},blur:function(){e.fireEvent("blur",[e])},contextmenu:function(t){e.$getContextMenu().setPosition(t.page.x,t.page.y).show().focus(),e.fireEvent("contextMenu",[e,t]),t.stop()}}}),this.$Elm.getElement(".qui-taskgroup-container").addEvents({click:this.click});var s=this.$Elm.getElement(".qui-taskgroup-menu");return this.$Menu=new i({name:this.getId()+"-menu",type:"bottom",events:{onBlur:function(t){t.hide()},onShow:function(t){var i=t.getElm(),s=i.getSize(),n=e.getElm().getPosition(),r=n.x,o=n.y-s.y;t.setPosition(r,o).focus()}}}),this.$Menu.inject(document.body),this.$Menu.hide(),s.addEvents({click:function(){e.$Menu.count()&&e.$Menu.show()}}),this.refresh(),new n(this.$Elm,{dropables:[".qui-taskbar"],cssClass:"radius5",events:{onEnter:function(e,i){if(i){var s=i.get("data-quiid");s&&t.Controls.getById(s).highlight()}}.bind(this),onLeave:function(e,i){if(i){var s=i.get("data-quiid");s&&t.Controls.getById(s).normalize()}},onDrop:function(e,i){if(i){var s=i.get("data-quiid");if(s){var n=t.Controls.getById(s);n.normalize(),n.appendChild(this)}}}.bind(this)}}),this.$Elm},getInstance:function(){return this.$Active?this.$Active.getInstance():null},getIcon:function(){var t=this.getInstance();return t?t.getAttribute("icon"):!1},getTitle:function(){var t=this.getInstance();return t?t.getAttribute("title"):!1},getTaskbar:function(){return this.getParent()},refresh:function(t){var e=this.$Elm.getElement(".qui-taskgroup-icon"),i=this.$Elm.getElement(".qui-taskgroup-text");"undefined"!=typeof t&&(this.setAttribute("icon",t.getIcon()),this.setAttribute("text",t.getTitle()),this.$Active=t),this.getAttribute("text")&&i.set("html",this.getAttribute("text")),this.getAttribute("icon")&&e.setStyle("background-image","url("+this.getAttribute("icon")+")")},click:function(){return this.$Active?(this.$Active.click(),this.fireEvent("click",[this]),this.activate(),this.focus(),this):(this.count()&&this.firstTask()&&this.refresh(this.firstTask()),this)},focus:function(){return this.$Elm&&this.$Elm.focus(),this},highlight:function(){return this.$Elm&&this.$Elm.addClass("highlight"),this.fireEvent("highlight",[this]),this},normalize:function(){return this.$Elm&&(this.$Elm.removeClass("highlight"),this.$Elm.removeClass("active")),this.fireEvent("normalize",[this]),this},activate:function(){return this.$Active&&this.$Active.activate(),this.isActive()?(this.fireEvent("activate",[this]),this):(this.$Elm&&this.$Elm.addClass("active"),this.fireEvent("activate",[this]),this)},close:function(){var t=this.getParent();for(var e in this.$tasks)this.$tasks.hasOwnProperty(e)&&this.$tasks[e].close();this.$tasks=null,this.destroy(),t.firstChild().show()},dissolve:function(){for(var t=this.getTaskbar(),e=this.getTasks(),i=0,s=e.length;s>i;i++)e[i].removeEvent("refresh",this.$onTaskRefresh),t.appendChild(e[i]);this.$tasks={},this.destroy(),this.isActive()&&t.firstChild().show()},isActive:function(){return this.$Elm?this.$Elm.hasClass("active"):!1},appendChild:function(t){this.$tasks[t.getId()]=t,this.fireEvent("appendChildBegin",[this,t]),t.hide(),this.$Menu.appendChild(new s({name:t.getId(),text:t.getTitle(),icon:t.getIcon(),Task:t,events:{onClick:this.$onMenuClick}})),t.setParent(this),t.addEvent("onRefresh",this.$onTaskRefresh),1==this.count()||t.isActive()?this.refresh(t):this.refresh(),t.isActive()&&this.click(),this.fireEvent("appendChild",[this,t])},getTasks:function(){var t=[];for(var e in this.$tasks)this.$tasks.hasOwnProperty(e)&&t.push(this.$tasks[e]);return t},firstTask:function(){for(var t in this.$tasks)if(this.$tasks.hasOwnProperty(t))return this.$tasks[t];return null},count:function(){var t,e=0;for(t in this.$tasks)e++;return e},$getContextMenu:function(){return this.$ContextMenu?this.$ContextMenu:(this.$ContextMenu=new i({name:this.getId()+"-menu",type:"bottom",events:{onBlur:function(t){t.hide()}}}),this.$ContextMenu.appendChild(new i({text:"Gruppe auflösen",events:{onClick:this.dissolve}})).appendChild(new i({text:"Gruppe und Tasks schließen",events:{onClick:this.close}})),this.$ContextMenu.inject(document.body),this.$ContextMenu.hide(),this.$ContextMenu)},$onTaskRefresh:function(t){var e=this.$Menu.getChildren(t.getId());e&&(e.setAttribute("text",t.getTitle()),e.setAttribute("icon",t.getIcon()),this.$Active.getId()==t.getId()&&this.refresh(this.$Active))},$onMenuClick:function(t){this.refresh(t.getAttribute("Task")),this.click()}})});
//# sourceMappingURL=Group.js.map