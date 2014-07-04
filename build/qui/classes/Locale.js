define("qui/classes/DOM",[],function(){"use strict";return window.$quistorage={},new Class({Implements:[Options,Events],Type:"qui/classes/DOM",options:{},$uid:null,initialize:function(t){t=t||{},t.events&&(this.addEvents(t.events),delete t.events),t.methods&&(Object.append(this,t.methods),delete t.methods),this.setAttributes(t)},$family:function(){return"undefined"!=typeof this.Type?this.Type:typeOf(this)},getId:function(){return this.$uid||(this.$uid=String.uniqueID()),this.$uid},getType:function(){return typeOf(this)},setAttribute:function(t,i){if(this.fireEvent("setAttribute",[t,i]),"undefined"!=typeof this.options[t])return void(this.options[t]=i);var e=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[e]&&(window.$quistorage[e]={}),window.$quistorage[e][t]=i,this},destroy:function(){this.fireEvent("destroy",[this]);var t=Slick.uidOf(this);t in window.$quistorage&&delete window.$quistorage[t],this.removeEvents()},setOptions:function(t){this.setAttributes(t)},setAttributes:function(t){t=t||{};for(var i in t)this.setAttribute(i,t[i]);return this},getAttribute:function(t){if(t in this.options)return this.options[t];var i=Slick.uidOf(this);return"undefined"==typeof window.$quistorage[i]?!1:"undefined"!=typeof window.$quistorage[i][t]?window.$quistorage[i][t]:!1},getAllAttributes:function(){return this.getAttributes()},getAttributes:function(){return this.options},getStorageAttributes:function(){var t=Slick.uidOf(this);return t in window.$quistorage?window.$quistorage[t]:{}},existAttribute:function(t){if("undefined"!=typeof this.options[t])return!0;var i=Slick.uidOf(this);return window.$quistorage[i]&&window.$quistorage[i][t]?!0:!1},getEvents:function(t){return"undefined"==typeof this.$events?!1:"undefined"!=typeof this.$events[t]?this.$events[t]:!1}})}),define("qui/classes/Locale",["qui/classes/DOM"],function(t){"use strict";return new Class({Extends:t,Type:"qui/classes/Locale",current:"en",langs:{},no_translation:!1,initialize:function(t){this.parent(t)},setCurrent:function(t){this.current=t},getCurrent:function(){return this.current},set:function(t,i,e,n){if(this.langs[t]||(this.langs[t]={}),this.langs[t][i]||(this.langs[t][i]={}),"undefined"!=typeof n)return this.langs[t][set][e]=n,this;var s=this.langs[t][i];for(var r in e)s[r]=e[r];this.langs[t][i]=s},get:function(t,i,e){if("undefined"==typeof e)return this.$get(t,i);var n=this.$get(t,i);for(t in e)n=n.replace("["+t+"]",e[t]);return n},$get:function(t,i){return this.no_translation?"["+t+"] "+i:this.langs[this.current]&&this.langs[this.current][t]?"undefined"==typeof i?this.langs[this.current][t]:this.langs[this.current][t][i]?this.langs[this.current][t][i]:"["+t+"] "+i:(this.fireEvent("error",["No translation found for ["+t+"] "+i,this]),"["+t+"] "+i)}})});
//# sourceMappingURL=Locale.js.map