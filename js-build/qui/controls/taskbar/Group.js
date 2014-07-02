define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t)},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([modul],i)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=t.getAttribute("name"),i=typeOf(t);e&&""!==e||(e="#unknown"),"undefined"==typeof this.$controls[e]&&(this.$controls[e]=[]),"undefined"==typeof this.$types[i]&&(this.$types[i]=[]),this.$controls[e].push(t),this.$types[i].push(t),this.$cids[t.getId()]=t},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),s=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[s]&&delete this.$cids[s];var n,r,o=[];if("undefined"!=typeof this.$controls[e]){for(n=0,r=this.$controls[e].length;r>n;n++)s!==this.$controls[e][n].getId()&&o.push(this.$controls[e][n]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[i])for(n=0,r=this.$types[i].length;r>n;n++)s!==this.$types[i][n].getId()&&o.push(this.$types[i][n]);this.$types[i]=o}})}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls"],function(t,e,i){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new i,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,s=0,n=0,r=e.length,o=null,u=null;r>s;s+=1)for(o=e[s].split("."),t=o.length,n=0;t>n;n+=1)u=o[n],i[u]=i[u]||{},i=i[u];return i},triggerError:function(t,e){return this.fireEvent("onError",[t,e]),this.trigger(t.getMessage()),this},trigger:function(t,e,i){var s=t+"\nFile: "+e+"\nLinenumber: "+i;return console.error(s),this},getMessageHandler:function(e){if(this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),window.QUI}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,n){if(t.match(u)||t.match(o))return t;t=r(t);var h=n.match(o),l=i.match(o);return!l||h&&h[1]==l[1]&&h[2]==l[2]?s(e(t,i),n):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(o))return t;var i=e.split("/"),s=t.split("/");for(i.pop();curPart=s.shift();)".."==curPart?i.pop():i.push(curPart);return i.join("/")}function s(t,e){var s=e.split("/");for(s.pop(),e=s.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),s=e.split("/");var n=t.split("/");for(out="";s.shift();)out+="../";for(;curPart=n.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var n=/([^:])\/+/g,r=function(t){return t.replace(n,"$1/")},o=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,h=function(e,i,s){i=r(i),s=r(s);for(var n,o,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;n=u.exec(e);){o=n[3]||n[2]||n[5]||n[6]||n[4];var h;h=t(o,i,s);var l=n[5]||n[6]?1:0;e=e.substr(0,u.lastIndex-o.length-l-1)+h+e.substr(u.lastIndex-l-1),u.lastIndex=u.lastIndex+(h.length-o.length)}return e};return h.convertURIBase=t,h.absoluteURI=e,h.relativeURI=s,h}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,i){i()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,i=!1,s=!0;e[1]||e[7]?i=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?s=!1:e[4]&&(i=parseInt(e[4])<18);var n={};n.pluginBuilder="./css-builder";var r,o,u,h=function(){r=document.createElement("style"),t.appendChild(r),o=r.styleSheet||r.sheet},l=0,a=[],c=function(t){l++,32==l&&(h(),l=0),o.addImport(t),r.onload=d},d=function(){u();var t=a.shift();return t?(u=t[1],void c(t[0])):void(u=null)},f=function(t,e){if(o&&o.addImport||h(),o&&o.addImport)u?a.push([t,e]):(c(t),u=e);else{r.textContent='@import "'+t+'";';var i=setInterval(function(){try{r.sheet.cssRules,clearInterval(i),e()}catch(t){}},10)}},m=function(e,i){var n=document.createElement("link");if(n.type="text/css",n.rel="stylesheet",s)n.onload=function(){n.onload=function(){},setTimeout(i,7)};else var r=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==n.href)return clearInterval(r),i()}},10);n.href=e,t.appendChild(n)};return n.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},n.load=function(t,e,s){(i?f:m)(e.toUrl(t+".css"),s)},n}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.QUI-control"),this.$Elm)},inject:function(e,i){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,i),this.fireEvent("inject",[this]),this},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},destroy:function(){this.fireEvent("destroy",[this]),"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null,t.Controls.destroy(this)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){return this.$Elm&&this.$Elm.focus(),this},resize:function(){this.fireEvent("resize",[this])}})}),define("qui/lib/require-css/css!qui/controls/contextmenu/Menu",[],function(){}),define("qui/controls/contextmenu/Menu",["qui/controls/Control","css!qui/controls/contextmenu/Menu.css"],function(t){"use strict";return new Class({Extends:t,Type:"qui/controls/contextmenu/Menu",Binds:["$keyup"],options:{styles:null,width:200,title:!1,shadow:!0,corner:!1,dragable:!1},initialize:function(t){this.parent(t),this.$items=[],this.$Title=null,this.$Active=null},create:function(){this.$Elm=new Element("div.qui-contextmenu",{html:'<div class="qui-contextmenu-container"></div>',tabindex:-1,styles:{display:"none",outline:"none","-moz-outline":"none"},events:{blur:function(){this.fireEvent("blur",[this])}.bind(this),keyup:this.$keyup},"data-quiid":this.getId()}),this.$Container=this.$Elm.getElement(".qui-contextmenu-container"),this.getAttribute("width")&&this.$Elm.setStyle("width",this.getAttribute("width")),this.getAttribute("styles")&&this.$Elm.setStyles(this.getAttribute("styles")),this.getAttribute("title")&&this.setTitle(this.getAttribute("title")),this.getAttribute("shadow")&&this.$Container.addClass("qui-contextmenu-shadow");for(var t=0,e=this.$items.length;e>t;t++)this.$items[t].inject(this.$Container);return this.$Elm},show:function(){if(!this.$Elm)return this;var t=this.$Elm.getParent(),e=this.$Elm;switch(this.getAttribute("corner")&&(e.removeClass("qui-context-corner-top"),e.removeClass("qui-context-corner-bottom"),e.removeClass("qui-context-corner-left"),e.removeClass("qui-context-corner-left")),this.getAttribute("corner")){case"top":e.addClass("qui-context-corner-top");break;case"bottom":e.addClass("qui-context-corner-bottom");break;case"left":e.addClass("qui-context-corner-left");break;case"right":e.addClass("qui-context-corner-right")}e.setStyles({display:""});var i=e.getSize();if(this.$Container.setStyles({height:i.y}),this.setAttribute("menuPosLeft",!1),"BODY"===t.nodeName){var s=e.getPosition(),n=t.getSize();s.x+i.x+50>n.x&&this.$Elm.setStyle("left",n.x-i.x-50),s.y+i.y+50>n.y&&this.$Elm.setStyle("top",n.y-i.y-50)}return this.$Active&&this.$Active.setActive(),this.fireEvent("show",[this]),this},hide:function(){return this.getElm().setStyles({display:"none"}),this.fireEvent("hide",[this]),this},focus:function(){return this.getElm().focus(),this.fireEvent("focus",[this]),this},setPosition:function(t,e){return this.$Elm&&this.$Elm.setStyles({left:t,top:e}),this},setTitle:function(t){return this.$Container&&!this.$Title&&(this.$Title=new Element("div.qui-contextmenu-title"),this.$Title.inject(this.$Container,"top")),this.$Title&&this.$Title.set("html",t),this.setAttribute("title",t),this},getChildren:function(t){if("undefined"!=typeof t){var e,i,s=this.$items;for(e=0,i=s.length;i>e;e++)if(s[e].getAttribute("name")==t)return s[e];return!1}return this.$items},firstChild:function(){return this.$items[0]?this.$items[0]:!1},count:function(){return this.$items.length},appendChild:function(t){return t&&"undefined"!=typeof t?(this.$items.push(t),t.setParent(this),this.getAttribute("dragable")&&t.setAttribute("dragable",!0),this.$Container&&t.inject(this.$Container),this):this},clearChildren:function(){for(var t=0,e=this.$items.length;e>t;t++)this.$items[t]&&this.$items[t].destroy();return this.$items=[],this},getActive:function(){return this.$Active?this.$Active:!1},getNext:function(t){for(var e=0,i=this.$items.length;i>e;e++)if(this.$items[e]==t&&"undefined"!=typeof this.$items[e+1])return this.$items[e+1];return!1},getPrevious:function(t){for(var e=this.$items.length-1;e>=0;e--){if(0===e)return!1;if(this.$items[e]==t)return this.$items[e-1]}return!1},deselectItems:function(){return this.$Active&&(this.$Active=null),this},$keyup:function(t){return"down"===t.key?void this.down():"up"===t.key?void this.up(t):"enter"===t.key?void this.select(t):void 0},up:function(){if(this.$items.length){var t=this.$items.length;if(!this.$Active)return void this.$items[t-1].setActive();var e=this.getPrevious(this.$Active);return this.$Active.setNormal(),e?void e.setActive():void this.$items[t-1].setActive()}},down:function(){if(this.$items.length){if(!this.$Active)return void this.$items[0].setActive();var t=this.getNext(this.$Active);return this.$Active.setNormal(),t?void t.setActive():void this.$items[0].setActive()}},select:function(t){this.$Active&&(this.$Active.fireEvent("mouseDown",[this.$Active,t]),this.$Active.fireEvent("click",[this.$Active,t]))}})}),define("qui/classes/utils/DragDrop",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/utils/DragDrop",Binds:["$complete","$onDrag","$onDrop","$onLeave","$onEnter"],options:{dropables:[document.body],styles:!1,cssClass:!1,delay:500,limit:{x:!1,y:!1}},initialize:function(t,e){var i=this;this.parent(e),this.$Drag=null,this.$Element=t,this.$enable=!0,t.addEvents({mousedown:function(t){i.$enable&&(i.setAttribute("_stopdrag",!1),i.$timer=i.$start.delay(i.getAttribute("delay"),i,t),t.stop())},mouseup:function(t){"undefined"!=typeof i.$timer&&clearTimeout(i.$timer),i.$stop(t)}})},getElm:function(){return this.$Elm},enable:function(){this.$enable=!0},disable:function(){this.$enable=!1},$start:function(t){if(this.$enable&&!(t.rightClick||Browser.ie8||this.getAttribute("_mousedown")||this.getAttribute("_stopdrag"))){this.setAttribute("_mousedown",!0);var e=t.page.x,i=t.page.y,s=this.$Element,n=s.getSize(),r=this.getAttribute("limit"),o=document.body.getSize();this.$Drag=new Element("div",{"class":"box",styles:{position:"absolute",top:i-20,left:e-40,zIndex:1e3,MozOutline:"none",outline:0,color:"#fff",padding:10,cursor:"pointer",width:n.x,height:n.y,background:"rgba(0,0,0, 0.5)"}}).inject(document.body),this.getAttribute("styles")&&this.$Drag.setStyles(this.getAttribute("styles")),this.getAttribute("cssClass")&&this.$Drag.addClass(this.getAttribute("cssClass")),this.$Drag.focus(),this.fireEvent("start",[this,this.$Drag,t]),r.x||(r.x=[0,o.x-this.$Drag.getSize().x]),r.y||(r.y=[0,o.y-this.$Drag.getSize().y]);var u=this.getAttribute("dropables");"array"===typeOf(u)&&(u=u.join(",")),new Drag.Move(this.$Drag,{precalculate:!0,droppables:u,onComplete:this.$complete,onDrop:this.$onDrop,onEnter:this.$onEnter,onLeave:this.$onLeave,onDrag:this.$onDrag,limit:r}).start({page:{x:e,y:i}})}},$stop:function(){if(!Browser.ie8){if(!this.getAttribute("_mousedown"))return void this.setAttribute("_stopdrag",!0);this.setAttribute("_mousedown",!1),("undefined"!=typeof this.$Drag||this.$Drag)&&(this.fireEvent("stop",[this,this.$Drag]),this.$Drag.destroy(),this.$Drag=null)}},$complete:function(t){this.fireEvent("complete",[this,t]),this.$stop()},$onDrag:function(t,e){this.fireEvent("drag",[this,t,e])},$onDrop:function(t,e,i){this.fireEvent("drop",[this,t,e,i])},$onEnter:function(t,e){this.fireEvent("enter",[this,t,e])},$onLeave:function(t,e){this.fireEvent("leave",[this,t,e])}})}),define("qui/utils/Controls",["qui/QUI"],function(t){"use strict";return{isFontAwesomeClass:function(t){return t?!t.match(/icon-/)&&!t.match(/fa-/)||t.match(/\./)?!1:!0:!1},highlight:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).highlight()}},normalize:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).normalize()}}}}),define("qui/lib/require-css/css!qui/controls/contextmenu/Item",[],function(){}),define("qui/controls/contextmenu/Item",["qui/QUI","qui/controls/Control","qui/classes/utils/DragDrop","qui/controls/contextmenu/Menu","qui/utils/Controls","css!qui/controls/contextmenu/Item.css"],function(QUI,Control,DragDrop,ContextMenu,Utils){"use strict";return new Class({Extends:Control,Type:"qui/controls/contextmenu/Item",Binds:["$onSetAttribute","$stringEvent","$onClick","$onMouseEnter","$onMouseLeave","$onMouseUp","$onMouseDown"],options:{text:"",icon:"",styles:null,dragable:!1},initialize:function(options){var self=this,items=options.items||[];delete options.items,this.parent(options),this.$items=[],this.$Elm=null,this.$Menu=null,this.$path="",this.$disabled=!1,"undefined"!=typeof options.disabled&&options.disabled&&(this.$disabled=!0),this.addEvent("onSetAttribute",this.$onSetAttribute),items.length&&this.insert(items),this.getAttribute("onClick")&&this.addEvent("onClick",function(){try{eval(self.getAttribute("onClick")+"( self )")}catch(e){console.error(e)}})},create:function(){var t,e,i=this;if(this.$Elm=new Element("div.qui-contextitem",{html:'<div class="qui-contextitem-container"><span class="qui-contextitem-icon"></span><span class="qui-contextitem-text"></span></div>',"data-quiid":this.getId(),tabindex:-1,events:{mouseenter:this.$onMouseEnter,mouseleave:this.$onMouseLeave}}),this.$Elm.getElement(".qui-contextitem-container").addEvents({click:this.$onClick,mousedown:this.$onMouseDown,mouseup:this.$onMouseUp}),this.getAttribute("icon")&&""!==this.getAttribute("icon")){var s=this.$Elm.getElement(".qui-contextitem-icon"),n=this.getAttribute("icon");Utils.isFontAwesomeClass(n)?s.addClass(n):s.setStyle("background-image","url("+n+")")}if(this.getAttribute("text")&&""!==this.getAttribute("text")){var r=this.$Elm.getElement(".qui-contextitem-text");this.$Elm.getComputedSize().width?r.set({html:this.getAttribute("text"),styles:{width:this.$Elm.getComputedSize().width}}):function(){r.set({html:i.getAttribute("text"),styles:{width:i.$Elm.getComputedSize().width}})}.delay(500)}if(this.getAttribute("dragable")&&new DragDrop(this.$Elm,{dropables:".qui-contextitem-dropable",events:{onEnter:function(t,e,i){if(i){var s=i.get("data-quiid");s&&QUI.Controls.getById(s).highlight()}},onLeave:function(t,e,i){if(i){var s=i.get("data-quiid");s&&QUI.Controls.getById(s).normalize()}},onDrop:function(t,e,s){if(s){var n=s.get("data-quiid");if(n){var r=QUI.Controls.getById(n);r.normalize(),r.appendChild(i)}}}}}),e=this.$items.length){this.$Elm.addClass("haschildren");var o=this.getContextMenu();for(t=0;e>t;t++)o.appendChild(this.$items[t])}return this.isDisabled()&&this.disable(),this.$Elm},insert:function(t){var e=this;return require(["qui/controls/contextmenu/Item","qui/controls/contextmenu/Seperator"],function(i,s){for(var n=0,r=t.length;r>n;n++)e.getAttribute("dragable")&&(t[n].dragable=!0),e.appendChild("qui/controls/contextmenu/Seperator"!=t[n].type?new i(t[n]):new s(t[n]))}),this},click:function(){this.$onClick()},appendChild:function(t){return this.$items.push(t),t.setParent(this),this.$Elm&&(this.$Elm.addClass("haschildren"),t.inject(this.getContextMenu())),this.fireEvent("append",[this,t]),this},disable:function(){return this.$disabled=!0,this.$Elm?(this.$Elm.addClass("qui-contextitem-disabled"),this):this},isDisabled:function(){return this.$disabled},enable:function(){return this.$disabled=!1,this.$Elm?(this.$Elm.removeClass("qui-contextitem-disabled"),this):this},setActive:function(){return this.$Elm&&this.$Elm.hasClass("qui-contextitem-active")?this:(this.$Elm&&(this.$Menu?this.$Elm.getChildren(".qui-contextitem-container").addClass("qui-contextitem-active"):this.$Elm.addClass("qui-contextitem-active")),this.fireEvent("active",[this]),this)},setNormal:function(){return this.$Elm?(this.$Menu?this.$Elm.getChildren(".qui-contextitem-container").removeClass("qui-contextitem-active"):this.$Elm.removeClass("qui-contextitem-active"),this.fireEvent("normal",[this]),this):this},getChildren:function(t){return"undefined"!=typeof t?t==this.getAttribute("name")+"-menu"?this.getContextMenu():this.getContextMenu().getChildren(t):this.getContextMenu().getChildren()},clear:function(){return this.getContextMenu().clear(),this.$items=[],this},getContextMenu:function(){return this.$Menu?this.$Menu:(this.$Menu=new ContextMenu({name:this.getAttribute("name")+"-menu",corner:"left",events:{onShow:function(t){for(var e=t.getChildren(),i=(t.getElm(),0),s=e.length;s>i;i++)e[i].setNormal()}}}),this.$Menu.inject(this.$Elm),this.$Menu.hide(),this.$Menu.setParent(this),this.$Menu)},$onSetAttribute:function(t,e){if(this.$Elm){if("text"==t)return void this.$Elm.getElement(".qui-contextitem-text").set("html",e);if("icon"==t){var i=this.$Elm.getElement(".qui-contextitem-icon");return i.className="qui-contextitem-icon",i.setStyle("background-image",null),void(Utils.isFontAwesomeClass(e)?i.addClass(e):this.$Elm.getElement(".qui-contextitem-container").setStyle("background-image","url("+e+")"))}}},$stringEvent:function(event){eval("("+event+"(this));")},$onClick:function(t){this.fireEvent("click",[this,t]);var e=this.getParent();e&&this.getParent().hide()},$onMouseEnter:function(){if(!this.$disabled){if(this.$Menu){var t=this.$Elm.getSize(),e=this.$Menu.getParent();if(this.$Menu.setPosition(t.x,0),this.$Menu.show(),e){var i=this.$Menu.getElm(),s=i.getPosition(),n=i.getSize(),r=document.body.getSize();s.x+t.x>r.x&&this.$Menu.setPosition(0-n.x,0)}this.$Elm.getChildren(".qui-contextitem-container").addClass("qui-contextitem-active")}this.setActive()}},$onMouseLeave:function(){this.$disabled||(this.$Menu&&this.$Menu.hide(),this.$Elm.getChildren(".qui-contextitem-container").removeClass("qui-contextitem-active"),this.setNormal())},$onMouseUp:function(t){this.fireEvent("mouseUp",[this,t]),this.getAttribute("dragable")===!1&&t.stop()},$onMouseDown:function(t){this.fireEvent("mouseDown",[this,t]),this.getAttribute("dragable")===!1&&t.stop()}})}),define("qui/lib/require-css/css!qui/controls/taskbar/Task",[],function(){}),define("qui/controls/taskbar/Task",["qui/QUI","qui/controls/Control","qui/classes/utils/DragDrop","qui/utils/Controls","css!qui/controls/taskbar/Task.css"],function(t,e,i,s){"use strict";return new Class({Extends:e,Type:"qui/controls/taskbar/Task",Binds:["close","click","$onDestroy"],options:{name:"qui-task",icon:!1,text:"",cssClass:"",closeable:!0,dragable:!0},initialize:function(t,e){this.$Instance=t||null,this.$Elm=null,this.addEvents({onDestroy:this.$onDestroy}),"undefined"!=typeof t&&(t.setAttribute("Task",this),t.addEvent("onRefresh",function(t){t.getAttribute("Task").refresh()}),t.addEvent("onDestroy",function(t){var e=t.getAttribute("Task");e.$Instance=null,e.destroy()}),this.parent(e))},serialize:function(){return{attributes:this.getAttributes(),type:this.getType(),instance:this.getInstance()?this.getInstance().serialize():""}},unserialize:function(e){this.setAttributes(e.attributes);var i=e.instance;return i?void t.Controls.getByType(i.type,function(t){var i=new t(e.instance);i.unserialize(e.instance),this.initialize(i,e.attributes)}.bind(this)):this},create:function(){if(this.$Elm)return this.$Elm;var e=this;return this.$Elm=new Element("div",{"class":"qui-task radius5 box",html:'<span class="qui-task-icon"></span><span class="qui-task-text"></span>',styles:{outline:"none"},tabindex:-1,events:{click:e.click,focus:function(t){e.fireEvent("focus",[e,t])},blur:function(t){e.fireEvent("blur",[e,t])},contextmenu:function(t){e.fireEvent("contextMenu",[e,t]),t.stop()}}}),this.getAttribute("dragable")&&(this.$_enter=null,new i(this.$Elm,{dropables:[".qui-taskgroup",".qui-taskbar"],cssClass:"radius5",events:{onEnter:function(e,i){if(i){var s=i.get("data-quiid");s&&t.Controls.getById(s).highlight()}},onLeave:function(e,i){if(i){var s=i.get("data-quiid");s&&t.Controls.getById(s).normalize()}},onDrop:function(i,s){if(s){var n=s.get("data-quiid");if(n){var r=t.Controls.getById(n);r.normalize(),r.appendChild(e)}}}}})),this.getAttribute("cssClass")&&this.$Elm.addClass(this.getAttribute("cssClass")),this.getAttribute("closeable")&&new Element("div",{"class":"qui-task-close",html:'<span class="icon-remove"></span>',events:{click:this.close}}).inject(this.$Elm),"undefined"!=typeof this.$serialize&&this.unserialize(this.$serialize),this.refresh(),this.$Elm},refresh:function(){if(!this.$Elm)return void this.fireEvent("refresh",[this]);var t=this.$Elm.getElement(".qui-task-icon"),e=this.$Elm.getElement(".qui-task-text");if(this.getIcon()){var i=this.getIcon();t.className="qui-task-icon",t.setStyle("background-image",null),s.isFontAwesomeClass(i)?t.addClass(i):t.setStyle("background-image","url("+i+")")}if(this.getTitle()){var n=this.getTitle();n=n.substring(0,19),n.length>19&&(n+="..."),e.set("html",n)}this.fireEvent("refresh",[this])},getIcon:function(){return this.getInstance()?this.getInstance().getAttribute("icon"):""},getTitle:function(){return this.getInstance()?this.getInstance().getAttribute("title"):""},getInstance:function(){return this.$Instance},setInstance:function(t){this.$Instance=t},getTaskbar:function(){var t=this.getParent();return"qui/controls/taskbar/Group"==typeOf(t)&&(t=t.getParent()),t},activate:function(){return this.isActive()||!this.$Elm?this:(this.$Elm.addClass("active"),this.fireEvent("activate",[this]),this)},normalize:function(){return this.$Elm&&(this.$Elm.removeClass("active"),this.$Elm.removeClass("highlight"),this.$Elm.removeClass("select"),this.$Elm.setStyle("display",null)),this.fireEvent("normalize",[this]),this},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},isActive:function(){return this.$Elm?this.$Elm.hasClass("active"):!1},click:function(t){return this.fireEvent("click",[this,t]),this.isActive()||this.activate(),this},close:function(t){return this.fireEvent("close",[this,t]),this.destroy(),this},focus:function(){return this.$Elm&&this.$Elm.focus(),this},highlight:function(){return this.$Elm&&this.$Elm.addClass("highlight"),this.fireEvent("highlight",[this]),this},select:function(){return this.$Elm&&this.$Elm.addClass("select"),this.fireEvent("select",[this]),this},isSelected:function(){return this.$Elm?this.$Elm.hasClass("select"):!1},unselect:function(){return this.$Elm&&this.$Elm.removeClass("select"),this.fireEvent("unselect",[this]),this},$onDestroy:function(){this.getInstance()&&this.getInstance().destroy(),this.$Instance=null}})}),define("qui/lib/require-css/css!qui/controls/taskbar/Group",[],function(){}),define("qui/controls/taskbar/Group",["qui/QUI","qui/controls/Control","qui/controls/contextmenu/Menu","qui/controls/contextmenu/Item","qui/classes/utils/DragDrop","qui/controls/taskbar/Task","css!qui/controls/taskbar/Group.css"],function(t,e,i,s,n){"use strict";return new Class({Extends:e,Type:"qui/controls/taskbar/Group",Binds:["dissolve","close","click","$onTaskRefresh","$onMenuClick"],options:{icon:!1,text:"..."},initialize:function(t){t=t||{},this.parent(t),this.$tasks={},this.$Elm=null,this.$Menu=null,this.$Active=null,this.$ContextMenu=null;var e=this;this.addEvent("onDestroy",function(){e.$Menu&&e.$Menu.destroy(),e.$ContextMenu&&e.$ContextMenu.destroy();for(var t=(e.getTaskbar(),e.getTasks()),i=0,s=t.length;s>i;i++)t[i].removeEvent("refresh",e.$onTaskRefresh)})},create:function(){var e=this;this.$Elm=new Element("div",{"class":"qui-taskgroup radius5 box",html:'<div class="qui-taskgroup-container"><span class="qui-taskgroup-icon"></span><span class="qui-taskgroup-text"></span></div><div class="qui-taskgroup-menu"></div>',styles:{outline:"none"},tabindex:-1,events:{focus:function(){e.fireEvent("focus",[e])},blur:function(){e.fireEvent("blur",[e])},contextmenu:function(t){e.$getContextMenu().setPosition(t.page.x,t.page.y).show().focus(),e.fireEvent("contextMenu",[e,t]),t.stop()}}}),this.$Elm.getElement(".qui-taskgroup-container").addEvents({click:this.click});var s=this.$Elm.getElement(".qui-taskgroup-menu");return this.$Menu=new i({name:this.getId()+"-menu",type:"bottom",events:{onBlur:function(t){t.hide()},onShow:function(t){var i=0,s=0,n=t.getElm(),r=n.getSize(),o=e.getElm().getPosition();i=o.x,s=o.y-r.y,t.setPosition(i,s).focus()}}}),this.$Menu.inject(document.body),this.$Menu.hide(),s.addEvents({click:function(){e.$Menu.count()&&e.$Menu.show()}}),this.refresh(),new n(this.$Elm,{dropables:[".qui-taskbar"],cssClass:"radius5",events:{onEnter:function(e,i){if(i){var s=i.get("data-quiid");s&&t.Controls.getById(s).highlight()}}.bind(this),onLeave:function(e,i){if(i){var s=i.get("data-quiid");s&&t.Controls.getById(s).normalize()}},onDrop:function(e,i){if(i){var s=i.get("data-quiid");if(s){var n=t.Controls.getById(s);n.normalize(),n.appendChild(this)}}}.bind(this)}}),this.$Elm},getInstance:function(){return this.$Active?this.$Active.getInstance():null},getIcon:function(){var t=this.getInstance();return t?t.getAttribute("icon"):!1},getTitle:function(){var t=this.getInstance();return t?t.getAttribute("title"):!1},getTaskbar:function(){return this.getParent()},refresh:function(t){var e=this.$Elm.getElement(".qui-taskgroup-icon"),i=this.$Elm.getElement(".qui-taskgroup-text");"undefined"!=typeof t&&(this.setAttribute("icon",t.getIcon()),this.setAttribute("text",t.getTitle()),this.$Active=t),this.getAttribute("text")&&i.set("html",this.getAttribute("text")),this.getAttribute("icon")&&e.setStyle("background-image","url("+this.getAttribute("icon")+")")},click:function(){return this.$Active?(this.$Active.click(),this.fireEvent("click",[this]),this.activate(),this.focus(),this):(this.count()&&this.firstTask()&&this.refresh(this.firstTask()),this)},focus:function(){return this.$Elm&&this.$Elm.focus(),this},highlight:function(){return this.$Elm&&this.$Elm.addClass("highlight"),this.fireEvent("highlight",[this]),this},normalize:function(){return this.$Elm&&(this.$Elm.removeClass("highlight"),this.$Elm.removeClass("active")),this.fireEvent("normalize",[this]),this},activate:function(){return this.$Active&&this.$Active.activate(),this.isActive()?(this.fireEvent("activate",[this]),this):(this.$Elm&&this.$Elm.addClass("active"),this.fireEvent("activate",[this]),this)},close:function(){var t=this.getParent();for(var e in this.$tasks)this.$tasks[e].close();this.$tasks=null,this.destroy(),t.firstChild().show()},dissolve:function(){for(var t=this.getTaskbar(),e=this.getTasks(),i=0,s=e.length;s>i;i++)e[i].removeEvent("refresh",this.$onTaskRefresh),t.appendChild(e[i]);this.$tasks={},this.destroy(),this.isActive()&&t.firstChild().show()},isActive:function(){return this.$Elm?this.$Elm.hasClass("active"):!1},appendChild:function(t){this.$tasks[t.getId()]=t,this.fireEvent("appendChildBegin",[this,t]),t.hide(),this.$Menu.appendChild(new s({name:t.getId(),text:t.getTitle(),icon:t.getIcon(),Task:t,events:{onClick:this.$onMenuClick}})),t.setParent(this),t.addEvent("onRefresh",this.$onTaskRefresh),1==this.count()||t.isActive()?this.refresh(t):this.refresh(),t.isActive()&&this.click(),this.fireEvent("appendChild",[this,t])},getTasks:function(){var t=[];for(var e in this.$tasks)t.push(this.$tasks[e]);return t},firstTask:function(){for(var t in this.$tasks)return this.$tasks[t];return null},count:function(){var t,e=0;for(t in this.$tasks)e++;return e},$getContextMenu:function(){return this.$ContextMenu?this.$ContextMenu:(this.$ContextMenu=new i({name:this.getId()+"-menu",type:"bottom",events:{onBlur:function(t){t.hide()}}}),this.$ContextMenu.appendChild(new i({text:"Gruppe auflösen",events:{onClick:this.dissolve}})).appendChild(new i({text:"Gruppe und Tasks schließen",events:{onClick:this.close}})),this.$ContextMenu.inject(document.body),this.$ContextMenu.hide(),this.$ContextMenu)},$onTaskRefresh:function(t){var e=this.$Menu.getChildren(t.getId());e&&(e.setAttribute("text",t.getTitle()),e.setAttribute("icon",t.getIcon()),this.$Active.getId()==t.getId()&&this.refresh(this.$Active))},$onMenuClick:function(t){this.refresh(t.getAttribute("Task")),this.click()}})});
//# sourceMappingURL=Group.js.map