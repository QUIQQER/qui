define("qui/controls/utils/Background",["qui/controls/Control"],function(Control){"use strict";return new Class({Extends:Control,Type:"qui/controls/utils/Background",initialize:function(params){this.parent(params)},create:function(){if(this.$Elm){return this.$Elm}this.$Elm=new Element("div",{"class":"qui-background",styles:{backgroundColor:"#000000",position:"fixed",width:"100%",height:"100%",top:0,left:0,zIndex:1e3,opacity:.6,display:"none"}});document.body.appendChild(this.$Elm);return this.$Elm}})});
//# sourceMappingURL=/var/www/git/quiqqer/qui/build/qui/controls/utils/Background.map.js