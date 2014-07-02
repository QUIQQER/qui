define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t)},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,i){if(this.fireEvent("setAttribute",[t,i]),"undefined"!=typeof this.options[t])return void(this.options[t]=i);var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]&&(window.$quistorage[e]={}),window.$quistorage[e][t]=i,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var i in t)this.setAttribute(i,t[i]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]?!1:"undefined"!=typeof window.$quistorage[i][t]?window.$quistorage[i][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var i=Slick.uidOf(this);return window.$quistorage[i]&&window.$quistorage[i][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})});
//# sourceMappingURL=DOM.js.map