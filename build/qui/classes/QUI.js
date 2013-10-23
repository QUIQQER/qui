define("qui/classes/QUI",["require","qui/classes/DOM","qui/classes/Controls"],function(require,DOM,Controls){"use strict";return new Class({Extends:DOM,Type:"qui/classes/QUI",initialize:function(options){this.setAttributes({debug:false,fetchErrors:true});this.parent(options);if(this.getAttribute("fetchErrors")){require.onError=function(requireType,requireModules){self.trigger("ERROR :"+requireType+"\n"+"Require :"+requireModules)};window.onerror=this.trigger.bind(this)}this.Controls=new Controls},namespace:function(){var tlen;var a=arguments,o=this,i=0,j=0,len=a.length,tok=null,name=null;for(;i<len;i=i+1){tok=a[i].split(".");tlen=tok.length;for(j=0;j<tlen;j=j+1){name=tok[j];o[name]=o[name]||{};o=o[name]}}return o},triggerError:function(Exception,params){this.fireEvent("onError",[Exception,params]);this.trigger(Exception.getMessage());return this},trigger:function(msg,url,linenumber){var message=msg+"\n"+"File: "+url+"\n"+"Linenumber: "+linenumber;console.error(message);return this}})});
//# sourceMappingURL=/var/www/git/quiqqer/qui/build/qui/classes/QUI.map.js