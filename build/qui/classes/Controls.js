define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t),this.fireEvent("init",[this])},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,e){if(this.fireEvent("setAttribute",[t,e]),"undefined"!=typeof this.options[t])return this.options[t]=e,this;var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]&&(window.$quistorage[i]={}),window.$quistorage[i][t]=e,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var e in t)t.hasOwnProperty(e)&&this.setAttribute(e,t[e]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]?!1:"undefined"!=typeof window.$quistorage[e][t]?window.$quistorage[e][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var e=Slick.uidOf(this);return window.$quistorage[e]&&window.$quistorage[e][t]},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Controls",["require","qui/classes/DOM"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/classes/Controls",initialize:function(){this.$controls={},this.$cids={},this.$types={}},get:function(t){return"undefined"==typeof this.$controls[t]?[]:this.$controls[t]},getById:function(t){return t in this.$cids?this.$cids[t]:!1},getByType:function(t){return t in this.$types?this.$types[t]:[]},loadType:function(e,i){e.match(/qui\//)||(e="qui/"+e),t([e],i)},isControl:function(t){return"undefined"!=typeof t&&t?"undefined"!=typeof t.getType:!1},add:function(t){var e=this,i=t.getAttribute("name"),n=typeOf(t);i&&""!==i||(i="#unknown"),"undefined"==typeof this.$controls[i]&&(this.$controls[i]=[]),"undefined"==typeof this.$types[n]&&(this.$types[n]=[]),this.$controls[i].push(t),this.$types[n].push(t),this.$cids[t.getId()]=t,t.addEvent("onDestroy",function(){e.destroy(t)})},destroy:function(t){var e=t.getAttribute("name"),i=typeOf(t),n=t.getId();e&&""!==e||(e="#unknown"),"undefined"!=typeof this.$cids[n]&&delete this.$cids[n];var s,o,u=[];if("undefined"!=typeof this.$controls[e]){for(s=0,o=this.$controls[e].length;o>s;s++)n!==this.$controls[e][s].getId()&&u.push(this.$controls[e][s]);this.$controls[e]=u,u.length||delete this.$controls[e]}if(u=[],"undefined"!=typeof this.$types[i])for(s=0,o=this.$types[i].length;o>s;s++)n!==this.$types[i][s].getId()&&u.push(this.$types[i][s]);this.$types[i]=u}})});
//# sourceMappingURL=Controls.js.map