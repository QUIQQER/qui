define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t),this.fireEvent("init",[this])},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([modul],i)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=this,i=t.getAttribute("name"),n=typeOf(t);i&&""!==i||(i="#unknown"),"undefined"==typeof this.$controls[i]&&(this.$controls[i]=[]),"undefined"==typeof this.$types[n]&&(this.$types[n]=[]),this.$controls[i].push(t),this.$types[n].push(t),this.$cids[t.getId()]=t,t.addEvent("onDestroy",function(){e.destroy(t)})},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),n=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[n]&&delete this.$cids[n];var s,o,r=[];if("undefined"!=typeof this.$controls[e]){for(s=0,o=this.$controls[e].length;o>s;s++)n!==this.$controls[e][s].getId()&&r.push(this.$controls[e][s]);this.$controls[e]=r,r.length||delete this.$controls[e]}if(r=[],"undefined"!=typeof this.$types[i])for(s=0,o=this.$types[i].length;o>s;s++)n!==this.$types[i][s].getId()&&r.push(this.$types[i][s]);this.$types[i]=r}})});var needle=["qui/classes/DOM"];("undefined"==typeof window.localStorage||"undefined"==typeof window.sessionStorage)&&needle.push("qui/classes/storage/Polyfill"),define(needle,function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/storage/Storage",$data:{},set:function(t,e){try{window.localStorage.setItem(t,e)}catch(i){this.$data[t]=e}},get:function(t){try{return window.localStorage.getItem(t)}catch(e){}return"undefined"!=typeof this.$data[t]?this.$data[t]:null},remove:function(t){try{window.localStorage.removeItem(t)}catch(e){}"undefined"!=typeof this.$data[t]&&delete this.$data[t]},clear:function(){this.$data={};try{window.localStorage.clear()}catch(t){}}})}),define("qui/classes/storage/Storage",function(){}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls","qui/classes/storage/Storage"],function(t,e,i,n){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new i,this.Storage=new n,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,n=0,s=0,o=e.length,r=null,u=null;o>n;n+=1)for(r=e[n].split("."),t=r.length,s=0;t>s;s+=1)u=r[s],i[u]=i[u]||{},i=i[u];return i},parse:function(e,i){if("undefined"==typeof e&&(e=document.body),"element"===typeOf(e)){var n=e.getElements("[data-qui]"),s=n.map(function(t){return t.get("data-qui")});t(s,function(){var t,e,o,r,u={TEXTAREA:!0,INPUT:!0};for(t=0,e=s.length;e>t;t++)o=arguments[t],r=n[t],r.get("data-quiid")||(""!==r.get("html").trim()||"undefined"!=typeof u[r.nodeName]?(new o).import(r):(new o).replaces(r));"undefined"!=typeof i&&i()})}},triggerError:function(t){return this.trigger(t.getMessage()),this},trigger:function(t,e,i){return this.fireEvent("error",[t,e,i]),this},getMessageHandler:function(e){if("undefined"!=typeof this.$execGetMessageHandler&&!this.MessageHandler)return this.$execGetMessageHandler=!0,void function(){this.getMessageHandler(e)}.delay(20,this);if(this.$execGetMessageHandler=!0,this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),document.addEvent("domready",function(){QUI.parse(document.body)}),window.QUI}),define("qui/classes/Locale",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/Locale",current:"en",langs:{},no_translation:!1,initialize:function(t){this.parent(t)},setCurrent:function(t){this.current=t},getCurrent:function(){return this.current},set:function(t,e,i,n){if(this.langs[t]||(this.langs[t]={}),this.langs[t][e]||(this.langs[t][e]={}),"undefined"!=typeof n)return this.langs[t][set][i]=n,this;var s=this.langs[t][e];for(var o in i)s[o]=i[o];this.langs[t][e]=s},get:function(t,e,i){if("undefined"==typeof i)return this.$get(t,e);var n=this.$get(t,e);for(t in i)n=n.replace("["+t+"]",i[t]);return n},$get:function(t,e){return this.no_translation?"["+t+"] "+e:this.langs[this.current]&&this.langs[this.current][t]&&this.langs[this.current][t][e]?this.langs[this.current][t][e]:this.langs[this.current]&&this.langs[this.current][t]&&"undefined"==typeof e?this.langs[this.current][t]:(this.fireEvent("error",["No translation found for ["+t+"] "+e,this]),"["+t+"] "+e)}})}),define("qui/Locale",["qui/classes/Locale"],function(t){"use strict";return"undefined"==typeof window.QUILocale&&(window.QUILocale=new t),window.QUILocale}),define("qui/lib/require-css/normalize",[],function(){function t(t,i,s){if(t.match(u)||t.match(r))return t;t=o(t);var l=s.match(r),a=i.match(r);return!a||l&&l[1]==a[1]&&l[2]==a[2]?n(e(t,i),s):e(t,i)}function e(t,e){if("./"==t.substr(0,2)&&(t=t.substr(2)),t.match(u)||t.match(r))return t;var i=e.split("/"),n=t.split("/");for(i.pop();curPart=n.shift();)".."==curPart?i.pop():i.push(curPart);return i.join("/")}function n(t,e){var n=e.split("/");for(n.pop(),e=n.join("/")+"/",i=0;e.substr(i,1)==t.substr(i,1);)i++;for(;"/"!=e.substr(i,1);)i--;e=e.substr(i+1),t=t.substr(i+1),n=e.split("/");var s=t.split("/");for(out="";n.shift();)out+="../";for(;curPart=s.shift();)out+=curPart+"/";return out.substr(0,out.length-1)}var s=/([^:])\/+/g,o=function(t){return t.replace(s,"$1/")},r=/[^\:\/]*:\/\/([^\/])*/,u=/^(\/|data:)/,l=function(e,i,n){i=o(i),n=o(n);for(var s,r,e,u=/@import\s*("([^"]*)"|'([^']*)')|url\s*\(\s*(\s*"([^"]*)"|'([^']*)'|[^\)]*\s*)\s*\)/gi;s=u.exec(e);){r=s[3]||s[2]||s[5]||s[6]||s[4];var l;l=t(r,i,n);var a=s[5]||s[6]?1:0;e=e.substr(0,u.lastIndex-r.length-a-1)+l+e.substr(u.lastIndex-a-1),u.lastIndex=u.lastIndex+(l.length-r.length)}return e};return l.convertURIBase=t,l.absoluteURI=e,l.relativeURI=n,l}),define("qui/lib/require-css/css",[],function(){if("undefined"==typeof window)return{load:function(t,e,i){i()}};var t=document.getElementsByTagName("head")[0],e=window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)/)||0,i=!1,n=!0;e[1]||e[7]?i=parseInt(e[1])<6||parseInt(e[7])<=9:e[2]?n=!1:e[4]&&(i=parseInt(e[4])<18);var s={};s.pluginBuilder="./css-builder";var o,r,u,l=function(){o=document.createElement("style"),t.appendChild(o),r=o.styleSheet||o.sheet},a=0,c=[],d=function(t){a++,32==a&&(l(),a=0),r.addImport(t),o.onload=h},h=function(){u();var t=c.shift();return t?(u=t[1],void d(t[0])):void(u=null)},f=function(t,e){if(r&&r.addImport||l(),r&&r.addImport)u?c.push([t,e]):(d(t),u=e);else{o.textContent='@import "'+t+'";';var i=setInterval(function(){try{o.sheet.cssRules,clearInterval(i),e()}catch(t){}},10)}},g=function(e,i){var s=document.createElement("link");if(s.type="text/css",s.rel="stylesheet",n)s.onload=function(){s.onload=function(){},setTimeout(i,7)};else var o=setInterval(function(){for(var t=0;t<document.styleSheets.length;t++){var e=document.styleSheets[t];if(e.href==s.href)return clearInterval(o),i()}},10);s.href=e,t.appendChild(s)};return s.normalize=function(t,e){return".css"==t.substr(t.length-4,4)&&(t=t.substr(0,t.length-4)),e(t)},s.load=function(t,e,n){(i?f:g)(e.toUrl(t+".css"),n)},s}),define("qui/lib/require-css/css!qui/controls/Control",[],function(){}),define("qui/controls/Control",["qui/QUI","qui/Locale","qui/classes/DOM","css!qui/controls/Control.css"],function(t,e,i){"use strict";return new Class({Extends:i,Type:"qui/controls/Control",$Parent:null,options:{name:""},initialize:function(e){this.parent(e),this.addEvent("onDestroy",function(){"undefined"!=typeof this.$Elm&&this.$Elm&&this.$Elm.destroy(),this.$Elm=null}.bind(this)),t.Controls.add(this)},create:function(){return this.$Elm?this.$Elm:(this.$Elm=new Element("div.qui-control"),this.$Elm.set("data-quiid",this.getId()),this.$Elm)},inject:function(e,i){return this.fireEvent("drawBegin",[this]),"undefined"!=typeof this.$Elm&&this.$Elm||(this.$Elm=this.create()),"undefined"!=typeof t&&"undefined"!=typeof t.Controls&&t.Controls.isControl(e)?e.appendChild(this):this.$Elm.inject(e,i),this.$Elm.set("data-quiid",this.getId()),this.fireEvent("inject",[this]),this},"import":function(t){return this.$Elm=t,this.$Elm.set("data-quiid",this.getId()),this.fireEvent("import",[this,t]),this},replaces:function(t){return this.$Elm?this.$Elm:("styles"in t&&this.setAttribute("styles",t.styles),this.$Elm=this.create(),this.$Elm.set("data-quiid",this.getId()),this.$Elm.set("data-qui",t.get("data-qui")),t.getParent()&&this.$Elm.replaces(t),this)},serialize:function(){return{attributes:this.getAttributes(),type:this.getType()}},unserialize:function(t){t.attributes&&this.setAttributes(t.attributes)},getElm:function(){return"undefined"!=typeof this.$Elm&&this.$Elm||this.create(),this.$Elm},getParent:function(){return this.$Parent||!1},setParent:function(t){return this.$Parent=t,this},getPath:function(){var t="/"+this.getAttribute("name"),e=this.getParent();return e?e.getPath()+t:t},hide:function(){return this.$Elm&&this.$Elm.setStyle("display","none"),this},show:function(){return this.$Elm&&this.$Elm.setStyle("display",null),this},isHidden:function(){return this.$Elm?"none"==this.$Elm.getStyle("display")?!0:!1:!0},highlight:function(){return this.fireEvent("highlight",[this]),this},normalize:function(){return this.fireEvent("normalize",[this]),this},focus:function(){if(this.$Elm)try{this.$Elm.focus()}catch(t){}return this},resize:function(){this.fireEvent("resize",[this])},openSheet:function(t){var i=new Element("div",{"class":"qui-sheet qui-box",html:'<div class="qui-sheet-content box"></div><div class="qui-sheet-buttons box"><div class="qui-sheet-buttons-back qui-button btn-white"><span>'+e.get("qui/controls/Control","btn.back")+"</span></div></div>",styles:{left:"-110%"}}).inject(this.$Elm);i.getElement(".qui-sheet-buttons-back").addEvent("click",function(){i.fireEvent("close")}),i.addEvent("close",function(){moofx(i).animate({left:"-100%"},{callback:function(){i.destroy()}})});var n=i.getElement(".qui-sheet-content");return n.setStyles({height:i.getSize().y-50}),moofx(i).animate({left:0},{callback:function(){t(n,i)}}),i}})}),define("qui/utils/Controls",["qui/QUI"],function(t){"use strict";return{isFontAwesomeClass:function(t){return t?!t.match(/icon-/)&&!t.match(/fa-/)||t.match(/\./)?!1:!0:!1},highlight:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).highlight()}},normalize:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).normalize()}}}}),define("qui/utils/NoSelect",{enable:function(t){return"undefined"==typeof t.setProperty&&(t=document.id(t)),t.removeClass("qui-utils-noselect"),Browser.ie?void document.removeEvent("selectstart",this.stopSelection):(t.removeProperty("unselectable","on"),t.removeProperty("unSelectable","on"),void t.setStyles({MozUserSelect:"",KhtmlUserSelect:""}))},disable:function(t){return"undefined"==typeof t.setProperty&&(t=document.id(t)),t.addClass("qui-utils-noselect"),Browser.ie?void document.addEvent("selectstart",this.stopSelection):(t.setProperty("unselectable","on"),t.setProperty("unSelectable","on"),void t.setStyles({MozUserSelect:"none",KhtmlUserSelect:"none"}))},stopSelection:function(t){return t.stop(),!1}}),define("qui/utils/Elements",{isInViewport:function(t){var e=t.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)},isInBody:function(t){var e=document.body.getSize(),i=t.getCoordinates();return console.log(i),console.log(e),!1},getComputedZIndex:function(t){var e,i,n,s=0,o=t.getParents();for(e=0,n=o.length;n>e;e++)i=o[e].getStyle("zIndex"),"auto"!=i&&i>s&&(s=i);return s},getChildIndex:function(t){return Array.prototype.indexOf.call(t.getParent().children,t)}}),define("qui/lib/require-css/css!qui/controls/buttons/Button",[],function(){}),define("qui/controls/buttons/Button",["qui/controls/Control","qui/utils/Controls","qui/utils/NoSelect","qui/utils/Elements","css!qui/controls/buttons/Button.css"],function(Control,Utils,NoSelect,ElementUtils){"use strict";return new Class({Extends:Control,Type:"qui/controls/buttons/Button",Binds:["onSetAttribute"],options:{type:"button",image:!1,icon:!1,style:{},textimage:!1,text:!1,title:!1,"class":!1,buttonCSSClass:!0,menuCorner:"top",dropDownIcon:!0},params:{},initialize:function(t){this.parent(t),this.$Menu=null,this.$Drop=null,this.$items=[],t.events&&delete t.events,this.setAttributes(this.initV2(t)),this.addEvent("onSetAttribute",this.onSetAttribute),this.addEvent("onDestroy",function(){this.$Menu&&this.$Menu.destroy()}.bind(this))},initV2:function(options){return options.onclick&&("string"===typeOf(options.onclick)&&(options.onclick=function(p){eval(p+"(this);")}.bind(this,[options.onclick])),this.addEvent("onClick",options.onclick),delete options.onclick),options.oncreate&&(this.addEvent("onCreate",options.oncreate),delete options.oncreate),options},create:function(){var t,e,i=this,n=new Element("button",{type:this.getAttribute("type"),"data-status":0,"data-quiid":this.getId()});return this.getAttribute("buttonCSSClass")&&n.addClass("qui-button"),this.getAttribute("width")&&n.setStyle("width",this.getAttribute("width")),this.getAttribute("height")&&n.setStyle("height",this.getAttribute("height")),this.getAttribute("styles")&&n.setStyles(this.getAttribute("styles")),this.getAttribute("class")&&n.addClass(this.getAttribute("class")),n.style.outline=0,n.setAttribute("tabindex","-1"),n.addEvents({click:function(t){i.isDisabled()||i.onclick(t)},mouseenter:function(){i.isDisabled()||(i.isActive()||i.getElm().addClass("qui-button-over"),i.fireEvent("enter",[i]))},mouseleave:function(){i.isDisabled()||(i.isActive()||i.getElm().removeClass("qui-button-over"),i.fireEvent("leave",[i]))},mousedown:function(t){i.isDisabled()||i.fireEvent("mousedown",[i,t])},mouseup:function(t){i.isDisabled()||i.fireEvent("mouseup",[i,t])},blur:function(t){i.fireEvent("blur",[i,t])},focus:function(t){i.fireEvent("focus",[i,t])}}),this.$Elm=n,this.getAttribute("icon")&&this.setAttribute("icon",this.getAttribute("icon")),!this.getAttribute("icon")&&this.getAttribute("image")&&this.setAttribute("icon",this.getAttribute("image")),this.getAttribute("styles")&&this.setAttribute("styles",this.getAttribute("styles")),this.getAttribute("textimage")&&this.setAttribute("textimage",this.getAttribute("textimage")),this.getAttribute("text")&&this.setAttribute("text",this.getAttribute("text")),this.getAttribute("title")&&this.$Elm.setAttribute("title",this.getAttribute("title")),this.getAttribute("disabled")&&this.setDisable(),e=this.$items.length,e&&this.getContextMenu(function(n){for(t=0;e>t;t++)n.appendChild(i.$items[t]);i.getAttribute("dropDownIcon")&&(i.$Drop=new Element("div",{"class":"qui-button-drop icon-chevron-down fa fa-chevron-down"}).inject(i.$Elm))}),this.fireEvent("create",[this]),NoSelect.disable(n),this.$Elm},click:function(t){this.isDisabled()||this.fireEvent("click",[this,t])},onclick:function(t){this.click(t)},setActive:function(){if(!this.isDisabled()){var t=this.getElm();t&&(t.addClass("qui-button-active"),t.set("data-status",1),this.fireEvent("active",[this]))}},isActive:function(){return this.getElm()&&1==this.getElm().get("data-status")?!0:!1},disable:function(){var t=this.getElm();if(t)return t.set({"data-status":-1,disabled:"disabled"}),this.fireEvent("disable",[this]),this},setDisable:function(){return this.disable()},isDisabled:function(){return this.getElm()&&-1==this.getElm().get("data-status")?!0:!1},enable:function(){return this.getElm()?(this.getElm().set({"data-status":0,disabled:null}),this.setNormal(),this):!1},setEnable:function(){return this.enable()},setNormal:function(){if(!this.isDisabled()){if(!this.getElm())return!1;var t=this.getElm();return t.set({"data-status":0,disabled:null}),t.removeClass("qui-button-active"),t.removeClass("qui-button-over"),this.fireEvent("normal",[this]),this}},appendChild:function(t){if(this.$items.push(t),t.setAttribute("Button",this),!this.$Elm)return this;var e=this;return this.getContextMenu(function(i){i.appendChild(t),e.getAttribute("dropDownIcon")&&!e.$Drop&&(e.$Drop=new Element("div",{"class":"qui-button-drop icon-chevron-down fa fa-chevron-down"}).inject(e.$Elm))}),this},getChildren:function(){return this.$items},clear:function(){return this.getContextMenu(function(t){t.clearChildren()}),this.$items=[],this},getContextMenu:function(t){if(this.$Menu&&"undefined"==typeof this.$createContextMenu)return t(this.$Menu),this;var e=this;return"undefined"!=typeof this.$createContextMenu?(function(){e.getContextMenu(t)}.delay(10),this):(this.$createContextMenu=!0,void require(["qui/controls/contextmenu/Menu"],function(i){e.$Menu=new i({name:e.getAttribute("name")+"-menu",corner:e.getAttribute("menuCorner")}),e.$Menu.inject(document.body),e.addEvents({onClick:function(){if(!e.isDisabled()){var t=e.$Elm.getPosition(),i=e.$Elm.getSize(),n=e.getAttribute("menuCorner"),s=e.$Menu.getElm().getComputedSize();n.contains("bottom")?e.$Menu.setPosition(t.x-20,t.y-i.y-s.totalHeight+10):e.$Menu.setPosition(t.x-20,t.y+i.y+10),e.$Menu.show(),e.$Elm.focus()}},onBlur:function(){e.$Menu.hide()}}),e.$Menu.setParent(e),delete e.$createContextMenu,t(e.$Menu)}))},onSetAttribute:function(k,value){var Elm=this.getElm();if(Elm){if("onclick"===k)return this.removeEvents("click"),void this.addEvent("click",function(p){eval(p+"(this);")}.bind(this,[value]));if("image"==k&&(k="icon"),"icon"===k){Elm.getElement(".image-container")||new Element("div.image-container",{align:"center"}).inject(Elm);var Image=Elm.getElement(".image-container");return Image.set("html",""),void(Utils.isFontAwesomeClass(value)?new Element("span",{"class":value}).inject(Image):new Element("img.qui-button-image",{src:value,styles:{display:"block"}}).inject(Image))}if("styles"===k)return void Elm.setStyles(value);if("title"===k)return void Elm.setAttribute("title",value);if("textimage"===k||"text"===k){Elm.getElement(".qui-button-text")||new Element("span.qui-button-text").inject(Elm);var Txt=Elm.getElement(".qui-button-text");if("text"===k&&Txt.set("html",value),"textimage"===k){var Img;Elm.getElement(".qui-button-text-image")&&Elm.getElement(".qui-button-text-image").destroy(),Img=Utils.isFontAwesomeClass(value)?new Element("span",{"class":"qui-button-text-image "+value,styles:{"margin-right":0}}).inject(Txt,"before"):new Element("img",{"class":"qui-button-text-image",src:value,styles:{"margin-right":0}}).inject(Txt,"before"),this.getAttribute("text")&&Img.setStyle("margin-right",null)}}}}})});
//# sourceMappingURL=Button.js.map