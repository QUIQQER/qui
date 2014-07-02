define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t)},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([modul],i)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=t.getAttribute("name"),i=typeOf(t);e&&""!==e||(e="#unknown"),"undefined"==typeof this.$controls[e]&&(this.$controls[e]=[]),"undefined"==typeof this.$types[i]&&(this.$types[i]=[]),this.$controls[e].push(t),this.$types[i].push(t),this.$cids[t.getId()]=t},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),n=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[n]&&delete this.$cids[n];var s,r,o=[];if("undefined"!=typeof this.$controls[e]){for(s=0,r=this.$controls[e].length;r>s;s++)n!==this.$controls[e][s].getId()&&o.push(this.$controls[e][s]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[i])for(s=0,r=this.$types[i].length;r>s;s++)n!==this.$types[i][s].getId()&&o.push(this.$types[i][s]);this.$types[i]=o}})}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls"],function(t,e,i){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new i,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,n=0,s=0,r=e.length,o=null,u=null;r>n;n+=1)for(o=e[n].split("."),t=o.length,s=0;t>s;s+=1)u=o[s],i[u]=i[u]||{},i=i[u];return i},triggerError:function(t,e){return this.fireEvent("onError",[t,e]),this.trigger(t.getMessage()),this},trigger:function(t,e,i){var n=t+"\nFile: "+e+"\nLinenumber: "+i;return console.error(n),this},getMessageHandler:function(e){if(this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),window.QUI}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,s){if(t.match(u)||t.match(o))return t;t=r(t);var h=s.match(o),l=i.match(o);return!l||h&&h[1]==l[1]&&h[2]==l[2]?n(e(t,i),s):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(o))return t;var i=e.split("/"),n=t.split("/");for(i.pop();curPart=n.shift();)".."==curPart?i.pop():i.push(curPart);return i.join("/")}function n(t,e){var n=e.split("/");for(n.pop(),e=n.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),n=e.split("/");var s=t.split("/");for(out="";n.shift();)out+="../";for(;curPart=s.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var s=/([^:])\/+/g,r=function(t){return t.replace(s,"$1/")},o=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,h=function(e,i,n){i=r(i),n=r(n);for(var s,o,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;s=u.exec(e);){o=s[3]||s[2]||s[5]||s[6]||s[4];var h;h=t(o,i,n);var l=s[5]||s[6]?1:0;e=e.substr(0,u.lastIndex-o.length-l-1)+h+e.substr(u.lastIndex-l-1),u.lastIndex=u.lastIndex+(h.length-o.length)}return e};return h.convertURIBase=t,h.absoluteURI=e,h.relativeURI=n,h}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,i){i()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,i=!1,n=!0;e[1]||e[7]?i=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?n=!1:e[4]&&(i=parseInt(e[4])<18);var s={};s.pluginBuilder="./css-builder";var r,o,u,h=function(){r=document.createElement("style"),t.appendChild(r),o=r.styleSheet||r.sheet},l=0,c=[],a=function(t){l++,32==l&&(h(),l=0),o.addImport(t),r.onload=d},d=function(){u();var t=c.shift();return t?(u=t[1],void a(t[0])):void(u=null)},f=function(t,e){if(o&&o.addImport||h(),o&&o.addImport)u?c.push([t,e]):(a(t),u=e);else{r.textContent='@import "'+t+'";';var i=setInterval(function(){try{r.sheet.cssRules,clearInterval(i),e()}catch(t){}},10)}},m=function(e,i){var s=document.createElement("link");if(s.type="text/css",s.rel="stylesheet",n)s.onload=function(){s.onload=function(){},setTimeout(i,7)};else var r=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==s.href)return clearInterval(r),i()}},10);s.href=e,t.appendChild(s)};return s.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},s.load=function(t,e,n){(i?f:m)(e.toUrl(t+".css"),n)},s}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.QUI-control"),this.$Elm)},inject:function(e,i){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,i),this.fireEvent("inject",[this]),this},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},destroy:function(){this.fireEvent("destroy",[this]),"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null,t.Controls.destroy(this)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){return this.$Elm&&this.$Elm.focus(),this},resize:function(){this.fireEvent("resize",[this])}})}),define("qui/lib/require-css/css!qui/controls/contextmenu/Menu",[],function(){}),define("qui/controls/contextmenu/Menu",["qui/controls/Control","css!qui/controls/contextmenu/Menu.css"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/contextmenu/Menu",Binds:["$keyup"],options:{styles:null,width:200,title:!1,shadow:!0,corner:!1,dragable:!1},initialize:function(t){this.parent(t),this.$items=[],this.$Title=null,this.$Active=null},create:function(){this.$Elm=new Element("div.qui-contextmenu",{html:'<div class="qui-contextmenu-container"></div>',tabindex:-1,styles:{display:"none",outline:"none","-moz-outline":"none"},events:{blur:function(){this.fireEvent("blur",[this])}.bind(this),keyup:this.$keyup},"data-quiid":this.getId()}),this.$Container=this.$Elm.getElement(".qui-contextmenu-container"),this.getAttribute("width")&&this.$Elm.setStyle("width",this.getAttribute("width")),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.getAttribute("title")&&this.setTitle(this.getAttribute("title")),this.getAttribute("shadow")&&this.$Container.addClass("qui-contextmenu-shadow");for(var t=0,e=this.$items.length;e>t;t++)this.$items[t].inject(this.$Container);return this.$Elm},show:function(){if(!this.$Elm)return this;var t=this.$Elm.getParent(),e=this.$Elm;switch(this.getAttribute("corner")&&(e.removeClass("qui-context-corner-top"),e.removeClass("qui-context-corner-bottom"),e.removeClass("qui-context-corner-left"),e.removeClass("qui-context-corner-left")),this.getAttribute("corner")){case"top":e.addClass("qui-context-corner-top");break;case"bottom":e.addClass("qui-context-corner-bottom");break;case"left":e.addClass("qui-context-corner-left");break;case"right":e.addClass("qui-context-corner-right")}e.setStyles({display:""});var i=e.getSize();if(this.$Container.setStyles({height:i.y}),this.setAttribute("menuPosLeft",!1),"BODY"===t.nodeName){var n=e.getPosition(),s=t.getSize();n.x+i.x+50>s.x&&this.$Elm.setStyle("left",s.x-i.x-50),n.y+i.y+50>s.y&&this.$Elm.setStyle("top",s.y-i.y-50)}return this.$Active&&this.$Active.setActive(),this.fireEvent("show",[this]),this},hide:function(){return this.getElm().setStyles({display:"none"}),this.fireEvent("hide",[this]),this},focus:function(){return this.getElm().focus(),this.fireEvent("focus",[this]),this},setPosition:function(t,e){return this.$Elm&&this.$Elm.setStyles({left:t,top:e}),this},setTitle:function(t){return this.$Container&&!this.$Title&&(this.$Title=new Element("div.qui-contextmenu-title"),this.$Title.inject(this.$Container,"top")),this.$Title&&this.$Title.set("html",t),this.setAttribute("title",t),this},getChildren:function(t){if("undefined"!=typeof t){var e,i,n=this.$items;for(e=0,i=n.length;i>e;e++)if(n[e].getAttribute("name")==t)return n[e];return!1}return this.$items},firstChild:function(){return this.$items[0]?this.$items[0]:!1},count:function(){return this.$items.length},appendChild:function(t){return t&&"undefined"!=typeof t?(this.$items.push(t),t.setParent(this),this.getAttribute("dragable")&&t.setAttribute("dragable",!0),this.$Container&&t.inject(this.$Container),this):this},clearChildren:function(){for(var t=0,e=this.$items.length;e>t;t++)this.$items[t]&&this.$items[t].destroy();return this.$items=[],this},getActive:function(){return this.$Active?this.$Active:!1},getNext:function(t){for(var e=0,i=this.$items.length;i>e;e++)if(this.$items[e]==t&&"undefined"!=typeof this.$items[e+1])return this.$items[e+1];return!1},getPrevious:function(t){for(var e=this.$items.length-1;e>=0;e--){if(0===e)return!1;if(this.$items[e]==t)return this.$items[e-1]}return!1},deselectItems:function(){return this.$Active&&(this.$Active=null),this},$keyup:function(t){return"down"===t.key?void this.down():"up"===t.key?void this.up(t):"enter"===t.key?void this.select(t):void 0},up:function(){if(this.$items.length){var t=this.$items.length;if(!this.$Active)return void this.$items[t-1].setActive();var e=this.getPrevious(this.$Active);return this.$Active.setNormal(),e?void e.setActive():void this.$items[t-1].setActive()}},down:function(){if(this.$items.length){if(!this.$Active)return void this.$items[0].setActive();var t=this.getNext(this.$Active);return this.$Active.setNormal(),t?void t.setActive():void this.$items[0].setActive()}},select:function(t){this.$Active&&(this.$Active.fireEvent("mouseDown",[this.$Active,t]),this.$Active.fireEvent("click",[this.$Active,t]))}})}),define("qui/classes/utils/DragDrop",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/utils/DragDrop",Binds:["$complete","$onDrag","$onDrop","$onLeave","$onEnter"],options:{dropables:[document.body],styles:!1,cssClass:!1,delay:500,limit:{x:!1,y:!1}},initialize:function(t,e){var i=this;this.parent(e),this.$Drag=null,this.$Element=t,this.$enable=!0,t.addEvents({mousedown:function(t){i.$enable&&(i.setAttribute("_stopdrag",!1),i.$timer=i.$start.delay(i.getAttribute("delay"),i,t),t.stop())},mouseup:function(t){"undefined"!=typeof i.$timer&&clearTimeout(i.$timer),i.$stop(t)}})},getElm:function(){return this.$Elm},enable:function(){this.$enable=!0},disable:function(){this.$enable=!1},$start:function(t){if(this.$enable&&!(t.rightClick||Browser.ie8||this.getAttribute("_mousedown")||this.getAttribute("_stopdrag"))){this.setAttribute("_mousedown",!0);var e=t.page.x,i=t.page.y,n=this.$Element,s=n.getSize(),r=this.getAttribute("limit"),o=document.body.getSize();this.$Drag=new Element("div",{"class":"box",styles:{position:"absolute",top:i-20,left:e-40,zIndex:1e3,MozOutline:"none",outline:0,color:"#fff",padding:10,cursor:"pointer",width:s.x,height:s.y,background:"rgba(0,0,0, 0.5)"}}).inject(document.body),this.getAttribute("styles")&&this.$Drag.setStyles(this.getAttribute("styles")),this.getAttribute("cssClass")&&this.$Drag.addClass(this.getAttribute("cssClass")),this.$Drag.focus(),this.fireEvent("start",[this,this.$Drag,t]),r.x||(r.x=[0,o.x-this.$Drag.getSize().x]),r.y||(r.y=[0,o.y-this.$Drag.getSize().y]);var u=this.getAttribute("dropables");"array"===typeOf(u)&&(u=u.join(",")),new Drag.Move(this.$Drag,{precalculate:!0,droppables:u,onComplete:this.$complete,onDrop:this.$onDrop,onEnter:this.$onEnter,onLeave:this.$onLeave,onDrag:this.$onDrag,limit:r}).start({page:{x:e,y:i}})}},$stop:function(){if(!Browser.ie8){if(!this.getAttribute("_mousedown"))return void this.setAttribute("_stopdrag",!0);this.setAttribute("_mousedown",!1),("undefined"!=typeof this.$Drag||this.$Drag)&&(this.fireEvent("stop",[this,this.$Drag]),this.$Drag.destroy(),this.$Drag=null)}},$complete:function(t){this.fireEvent("complete",[this,t]),this.$stop()},$onDrag:function(t,e){this.fireEvent("drag",[this,t,e])},$onDrop:function(t,e,i){this.fireEvent("drop",[this,t,e,i])},$onEnter:function(t,e){this.fireEvent("enter",[this,t,e])},$onLeave:function(t,e){this.fireEvent("leave",[this,t,e])}})}),define("qui/utils/Controls",["qui/QUI"],function(t){"use strict";return{isFontAwesomeClass:function(t){return t?!t.match(/icon-/)&&!t.match(/fa-/)||t.match(/\./)?!1:!0:!1},highlight:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).highlight()}},normalize:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).normalize()}}}}),define("qui/lib/require-css/css!qui/controls/contextmenu/Item",[],function(){}),define("qui/controls/contextmenu/Item",["qui/QUI","qui/controls/Control","qui/classes/utils/DragDrop","qui/controls/contextmenu/Menu","qui/utils/Controls","css!qui/controls/contextmenu/Item.css"],function(QUI,Control,DragDrop,ContextMenu,Utils){"use strict";return new Class({Extends:Control,Type:"qui/controls/contextmenu/Item",Binds:["$onSetAttribute","$stringEvent","$onClick","$onMouseEnter","$onMouseLeave","$onMouseUp","$onMouseDown"],options:{text:"",icon:"",styles:null,dragable:!1},initialize:function(options){var self=this,items=options.items||[];delete options.items,this.parent(options),this.$items=[],this.$Elm=null,this.$Menu=null,this.$path="",this.$disabled=!1,"undefined"!=typeof options.disabled&&options.disabled&&(this.$disabled=!0),this.addEvent("onSetAttribute",this.$onSetAttribute),items.length&&this.insert(items),this.getAttribute("onClick")&&this.addEvent("onClick",function(){try{eval(self.getAttribute("onClick")+"( self )")}catch(e){console.error(e)}})},create:function(){var t,e,i=this;if(this.$Elm=new Element("div.qui-contextitem",{html:'<div class="qui-contextitem-container"><span class="qui-contextitem-icon"></span><span class="qui-contextitem-text"></span></div>',"data-quiid":this.getId(),tabindex:-1,events:{mouseenter:this.$onMouseEnter,mouseleave:this.$onMouseLeave}}),this.$Elm.getElement(".qui-contextitem-container").addEvents({click:this.$onClick,mousedown:this.$onMouseDown,mouseup:this.$onMouseUp}),this.getAttribute("icon")&&""!==this.getAttribute("icon")){var n=this.$Elm.getElement(".qui-contextitem-icon"),s=this.getAttribute("icon");Utils.isFontAwesomeClass(s)?n.addClass(s):n.setStyle("background-image","url("+s+")")}if(this.getAttribute("text")&&""!==this.getAttribute("text")){var r=this.$Elm.getElement(".qui-contextitem-text");this.$Elm.getComputedSize().width?r.set({html:this.getAttribute("text"),styles:{width:this.$Elm.getComputedSize().width}}):function(){r.set({html:i.getAttribute("text"),styles:{width:i.$Elm.getComputedSize().width}})}.delay(500)}if(this.getAttribute("dragable")&&new DragDrop(this.$Elm,{dropables:".qui-contextitem-dropable",events:{onEnter:function(t,e,i){if(i){var n=i.get("data-quiid");n&&QUI.Controls.getById(n).highlight()}},onLeave:function(t,e,i){if(i){var n=i.get("data-quiid");n&&QUI.Controls.getById(n).normalize()}},onDrop:function(t,e,n){if(n){var s=n.get("data-quiid");if(s){var r=QUI.Controls.getById(s);r.normalize(),r.appendChild(i)}}}}}),e=this.$items.length){this.$Elm.addClass("haschildren");var o=this.getContextMenu();for(t=0;e>t;t++)o.appendChild(this.$items[t])}return this.isDisabled()&&this.disable(),this.$Elm},insert:function(t){var e=this;return require(["qui/controls/contextmenu/Item","qui/controls/contextmenu/Seperator"],function(i,n){for(var s=0,r=t.length;r>s;s++)e.getAttribute("dragable")&&(t[s].dragable=!0),e.appendChild("qui/controls/contextmenu/Seperator"!=t[s].type?new i(t[s]):new n(t[s]))}),this},click:function(){this.$onClick()},appendChild:function(t){return this.$items.push(t),t.setParent(this),this.$Elm&&(this.$Elm.addClass("haschildren"),t.inject(this.getContextMenu())),this.fireEvent("append",[this,t]),this},disable:function(){return this.$disabled=!0,this.$Elm?(this.$Elm.addClass("qui-contextitem-disabled"),this):this},isDisabled:function(){return this.$disabled},enable:function(){return this.$disabled=!1,this.$Elm?(this.$Elm.removeClass("qui-contextitem-disabled"),this):this},setActive:function(){return this.$Elm&&this.$Elm.hasClass("qui-contextitem-active")?this:(this.$Elm&&(this.$Menu?this.$Elm.getChildren(".qui-contextitem-container").addClass("qui-contextitem-active"):this.$Elm.addClass("qui-contextitem-active")),this.fireEvent("active",[this]),this)},setNormal:function(){return this.$Elm?(this.$Menu?this.$Elm.getChildren(".qui-contextitem-container").removeClass("qui-contextitem-active"):this.$Elm.removeClass("qui-contextitem-active"),this.fireEvent("normal",[this]),this):this},getChildren:function(t){return"undefined"!=typeof t?t==this.getAttribute("name")+"-menu"?this.getContextMenu():this.getContextMenu().getChildren(t):this.getContextMenu().getChildren()},clear:function(){return this.getContextMenu().clear(),this.$items=[],this},getContextMenu:function(){return this.$Menu?this.$Menu:(this.$Menu=new ContextMenu({name:this.getAttribute("name")+"-menu",corner:"left",events:{onShow:function(t){for(var e=t.getChildren(),i=(t.getElm(),0),n=e.length;n>i;i++)e[i].setNormal()}}}),this.$Menu.inject(this.$Elm),this.$Menu.hide(),this.$Menu.setParent(this),this.$Menu)},$onSetAttribute:function(t,e){if(this.$Elm){if("text"==t)return void this.$Elm.getElement(".qui-contextitem-text").set("html",e);if("icon"==t){var i=this.$Elm.getElement(".qui-contextitem-icon");return i.className="qui-contextitem-icon",i.setStyle("background-image",null),void(Utils.isFontAwesomeClass(e)?i.addClass(e):this.$Elm.getElement(".qui-contextitem-container").setStyle("background-image","url("+e+")"))}}},$stringEvent:function(event){eval("("+event+"(this));")},$onClick:function(t){this.fireEvent("click",[this,t]);var e=this.getParent();e&&this.getParent().hide()},$onMouseEnter:function(){if(!this.$disabled){if(this.$Menu){var t=this.$Elm.getSize(),e=this.$Menu.getParent();if(this.$Menu.setPosition(t.x,0),this.$Menu.show(),e){var i=this.$Menu.getElm(),n=i.getPosition(),s=i.getSize(),r=document.body.getSize();n.x+t.x>r.x&&this.$Menu.setPosition(0-s.x,0)}this.$Elm.getChildren(".qui-contextitem-container").addClass("qui-contextitem-active")}this.setActive()}},$onMouseLeave:function(){this.$disabled||(this.$Menu&&this.$Menu.hide(),this.$Elm.getChildren(".qui-contextitem-container").removeClass("qui-contextitem-active"),this.setNormal())},$onMouseUp:function(t){this.fireEvent("mouseUp",[this,t]),this.getAttribute("dragable")===!1&&t.stop()},$onMouseDown:function(t){this.fireEvent("mouseDown",[this,t]),this.getAttribute("dragable")===!1&&t.stop()}})}),define("qui/lib/require-css/css!qui/controls/contextmenu/Seperator",[],function(){}),define("qui/controls/contextmenu/Seperator",["qui/controls/Control","css!qui/controls/contextmenu/Seperator.css"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/contextmenu/Seperator",options:{styles:null},initialize:function(t){this.parent(t),this.$Elm=null},create:function(){return this.$Elm=new Element("div.qui-context-seperator",{"data-quiid":this.getId()}),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.$Elm},setNormal:function(){},setActive:function(){}})}),define("qui/lib/require-css/css!qui/controls/contextmenu/BarItem",[],function(){}),define("qui/controls/contextmenu/BarItem",["qui/controls/Control","qui/controls/contextmenu/Menu","qui/controls/contextmenu/Item","qui/controls/contextmenu/Seperator","css!qui/controls/contextmenu/BarItem.css"],function(t,e,i,n){"use strict";return new Class({Extends:t,Type:"qui/controls/contextmenu/BarItem",Binds:["$onSetAttribute","$onClick","$onMouseEnter","$onMouseLeave","blur","focus","appendChild"],options:{text:"",icon:"",styles:null,dragable:!1},initialize:function(t){var e=t.items||[];delete t.items,this.parent(t),this.$Elm=null,this.$Menu=null,this.$show=!1,this.addEvents({onSetAttribute:this.$onSetAttribute}),e.length&&this.insert(e)},create:function(){var t=this;return this.$Elm=new Element("div",{"class":"qui-contextmenu-baritem smooth",html:'<span class="qui-contextmenu-baritem-text smooth"></span>',"data-quiid":this.getId(),tabindex:-1,styles:{outline:0},events:{click:this.$onClick,blur:function(){return t.blur(),!0},focus:function(){return t.focus(),!0},mouseenter:this.$onMouseEnter,mouseleave:this.$onMouseLeave,mousedown:function(t){t.stop()},mouseup:function(t){t.stop()}}}),this.getAttribute("icon")&&""!==this.getAttribute("icon")&&this.$Elm.setStyle("background-image","url("+this.getAttribute("icon")+")"),this.getAttribute("text")&&""!==this.getAttribute("text")&&this.$Elm.getElement(".qui-contextmenu-baritem-text").set("html",this.getAttribute("text")),this.$Menu&&this.$Menu.inject(this.$Elm),this.$Elm},focus:function(){return this.$show?this:(this.$Elm.focus(),this.fireEvent("focus",[this]),this.show(),this.setActive(),this)},blur:function(){return this.fireEvent("blur",[this]),this.hide(),this.setNormal(),this},insert:function(t){for(var e=0,s=t.length;s>e;e++)this.getAttribute("dragable")&&(t[e].dragable=!0),this.appendChild("qui/controls/contextmenu/Seperator"!=t[e].type?new i(t[e]):new n(t[e]));return this},show:function(){return this.isActive()?this:this.$show?this:(this.$show=!0,this.getContextMenu().count()&&(this.getContextMenu().$Active&&this.getContextMenu().$Active.setNormal(),this.getContextMenu().show(),this.getElm().addClass("bar-menu")),this)},hide:function(){this.$show=!1,this.getElm().removeClass("bar-menu"),this.getContextMenu().hide()},appendChild:function(t){return this.getAttribute("dragable")&&t.setAttribute("dragable",!0),this.getContextMenu().appendChild(t),t.setParent(this),this.fireEvent("append",[this,t]),this},getChildren:function(t){return"undefined"!=typeof t?this.getContextMenu().getChildren(t):this.getContextMenu().getChildren()},clear:function(){return this.getContextMenu().clear(),this},getContextMenu:function(){return this.$Menu||(this.$Menu=new e({name:this.getAttribute("name")+"-menu",shadow:!0,corner:"top",events:{onShow:function(t){for(var e=t.getChildren(),i=0,n=e.length;n>i;i++)e[i].setNormal()}}})),this.$Elm&&(this.$Menu.inject(this.$Elm),this.$Menu.hide(),this.$Menu.setPosition(0,this.$Elm.getSize().y+20)),this.getAttribute("dragable")&&this.$Menu.setAttribute("dragable",!0),this.$Menu},setActive:function(){return this.isActive()?this:(this.fireEvent("active",[this]),this.$Elm.addClass("qui-contextmenu-baritem-active"),this)},isActive:function(){return this.$Elm&&this.$Elm.hasClass(".qui-contextmenu-baritem-active")?!0:!1},setNormal:function(){return this.$Elm.removeClass("qui-contextmenu-baritem-active"),this.fireEvent("normal",[this]),this},$onSetAttribute:function(t,e){return this.$Elm?"text"==t?void this.$Elm.getElement(".qui-contextmenu-baritem-text").set("html",e):"icon"==t?void this.$Elm.setStyle("background-image","url("+e+")"):void 0:void 0},$onClick:function(t){this.fireEvent("click",[this,t]),this.focus()},$onMouseEnter:function(){this.fireEvent("mouseEnter",[this])},$onMouseLeave:function(){this.fireEvent("mouseLeave",[this])}})}),define("qui/lib/require-css/css!qui/controls/contextmenu/Bar",[],function(){}),define("qui/controls/contextmenu/Bar",["qui/controls/Control","qui/controls/contextmenu/BarItem","qui/controls/contextmenu/Menu","qui/controls/contextmenu/Item","qui/controls/contextmenu/Seperator","css!qui/controls/contextmenu/Bar.css"],function(t,e){"use strict";return new Class({Extends:t,Type:"qui/controls/contextmenu/Bar",Binds:["$onItemEnter","$onItemLeave","$onItemClick","$onItemBlur"],options:{styles:null,width:200,openening:!1,dragable:!1},initialize:function(t){this.parent(t),this.$items=[],this.$Elm=null,this.$Menu=null,this.$cActive=null},create:function(){return this.$Elm=new Element("div",{"class":"qui-contextmenu-bar"}),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.$Elm},insert:function(t){for(var i=0,n=t.length;n>i;i++)this.getAttribute("dragable")&&(t[i].dragable=!0),this.appendChild(new e(t[i]));return this},getChildren:function(t){if("undefined"!=typeof t){var e,i,n=this.$items;for(e=0,i=n.length;i>e;e++)if(n[e].getAttribute("name")==t)return n[e];return!1}return this.$items},firstChild:function(){return this.$items[0]?this.$items[0]:!1},count:function(){return this.$items.length},appendChild:function(t){return t&&"undefined"!=typeof t?(this.getAttribute("dragable")&&t.setAttribute("dragable",!0),this.$items.push(t),t.addEvents({onMouseEnter:this.$onItemEnter,onMouseLeave:this.$onItemLeave,onBlur:this.$onItemBlur,onClick:this.$onItemClick}),this.$Elm&&t.inject(this.$Elm),t.setParent(this),this):this},clearChildren:function(){for(var t=0,e=this.$items.length;e>t;t++)this.$items[t]&&this.$items[t].destroy();return this.$items=[],this},getNext:function(t){for(var e=0,i=this.$items.length;i>e;e++)if(this.$items[e]==t&&"undefined"!=typeof this.$items[e+1])return this.$items[e+1];return!1},getPrevious:function(t){for(var e=this.$items.length-1;e>=0;e--){if(0===e)return!1;if(this.$items[e]==t)return this.$items[e-1]}return!1},$onItemEnter:function(t){this.getAttribute("openening")!==!1&&this.$Active!=t&&(this.$Active&&this.$Active.blur(),"undefined"!=typeof this.$delay&&this.$delay&&clearTimeout(this.$delay),t.focus(),this.$Active=t)},$onItemLeave:function(){},$onItemClick:function(){this.setAttribute("openening",!0)},$onItemBlur:function(){this.$Active=null,this.$delay=function(){this.$Active||this.setAttribute("openening",!1)}.delay(200,this)}})});
//# sourceMappingURL=Bar.js.map