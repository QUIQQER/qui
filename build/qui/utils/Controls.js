define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t),this.fireEvent("init",[this])},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return void(this.options[t]=e);var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([modul],i)},isControl:function(t){return"undefined"!=typeof t&&t&&"undefined"!=typeof t.getType?!0:!1},add:function(t){var e=this,i=t.getAttribute("name"),n=typeOf(t);i&&""!==i||(i="#unknown"),"undefined"==typeof this.$controls[i]&&(this.$controls[i]=[]),"undefined"==typeof this.$types[n]&&(this.$types[n]=[]),this.$controls[i].push(t),this.$types[n].push(t),this.$cids[t.getId()]=t,t.addEvent("onDestroy",function(){e.destroy(t)})},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),n=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[n]&&delete this.$cids[n];var s,r,o=[];if("undefined"!=typeof this.$controls[e]){for(s=0,r=this.$controls[e].length;r>s;s++)n!==this.$controls[e][s].getId()&&o.push(this.$controls[e][s]);this.$controls[e]=o,o.length||delete this.$controls[e]}if(o=[],"undefined"!=typeof this.$types[i])for(s=0,r=this.$types[i].length;r>s;s++)n!==this.$types[i][s].getId()&&o.push(this.$types[i][s]);this.$types[i]=o}})}),define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls"],function(t,e,i){"use strict";return new Class({Extends:e,Type:"qui/classes/QUI",initialize:function(e){this.setAttributes({debug:!1,fetchErrors:!0}),this.parent(e),this.getAttribute("fetchErrors")&&(t.onError=function(t,e){self.trigger("ERROR :"+t+"\nRequire :"+e)},window.onerror=this.trigger.bind(this)),this.Controls=new i,this.MessageHandler=null},namespace:function(){for(var t,e=arguments,i=this,n=0,s=0,r=e.length,o=null,u=null;r>n;n+=1)for(o=e[n].split("."),t=o.length,s=0;t>s;s+=1)u=o[s],i[u]=i[u]||{},i=i[u];return i},parse:function(e,i){"undefined"==typeof e&&(e=document.body);var n=e.getElements("[data-qui]"),s=n.map(function(t){return t.get("data-qui")});t(s,function(){var t,e,r,o;for(t=0,e=s.length;e>t;t++)r=arguments[t],o=n[t],o.get("data-quiid")||(""!==o.get("html").trim()?(new r).import(o):(new r).replaces(o));"undefined"!=typeof i&&i()})},triggerError:function(t){return this.trigger(t.getMessage()),this},trigger:function(t,e,i){return this.fireEvent("error",[t,e,i]),this},getMessageHandler:function(e){if("undefined"!=typeof this.$execGetMessageHandler&&!this.MessageHandler)return this.$execGetMessageHandler=!0,void function(){this.getMessageHandler(e)}.delay(20,this);if(this.$execGetMessageHandler=!0,this.MessageHandler)return void e(this.MessageHandler);var i=this;t(["qui/controls/messages/Handler"],function(t){i.MessageHandler=new t,e(i.MessageHandler)})},getControls:function(t){return this.Controls?void t(this.Controls):void 0}})}),define("qui/QUI",["qui/classes/QUI"],function(t){"use strict";return"undefined"==typeof window.QUI&&(window.QUI=new t),document.fireEvent("qui-loaded"),document.addEvent("domready",function(){QUI.parse(document.body)}),window.QUI}),define("qui/utils/Controls",["qui/QUI"],function(t){"use strict";return{isFontAwesomeClass:function(t){return t?!t.match(/icon-/)&&!t.match(/fa-/)||t.match(/\./)?!1:!0:!1},highlight:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).highlight()}},normalize:function(e){if(e){var i=e.get("data-quiid");i&&t.Controls.getById(i).normalize()}}}});
//# sourceMappingURL=Controls.js.map