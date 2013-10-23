define("qui/controls/sitemap/Item",["qui/QUI","qui/controls/Control","qui/utils/Controls","qui/controls/contextmenu/Menu","qui/controls/contextmenu/Item","css!qui/controls/sitemap/Item.css"],function(QUI,QUI_Control,Utils,QUI_ContextMenu,QUI_ContextMenuItem){"use strict";return new Class({Extends:QUI_Control,Type:"qui/controls/sitemap/Item",Binds:["toggle","click","$onChildDestroy","$onSetAttribute"],options:{value:"",text:"",icon:"",alt:"",title:"",hasChildren:false},$Elm:null,$items:[],initialize:function(options){this.parent(options);this.$Elm=null;this.$Map=null;this.$Opener=null;this.$Icons=null;this.$Text=null;this.$Children=null;this.$ContextMenu=null;this.$items=[];this.addEvent("onSetAttribute",this.$onSetAttribute);this.addEvent("onDestroy",function(Item){Item.clearChildren();if(this.$Opener){this.$Opener.destroy()}if(this.$Icons){this.$Icons.destroy()}if(this.$Text){this.$Text.destroy()}if(this.$Children){this.$Children.destroy()}if(this.$ContextMenu){this.$ContextMenu.destroy()}})},create:function(Parent){var i,len;var self=this;this.$Elm=new Element("div",{"class":"qui-sitemap-entry box",alt:this.getAttribute("alt"),title:this.getAttribute("title"),"data-value":this.getAttribute("value"),"data-quiid":this.getId(),html:'<div class="qui-sitemap-entry-opener"></div>'+'<div class="qui-sitemap-entry-container">'+'<div class="qui-sitemap-entry-icon"></div>'+'<div class="qui-sitemap-entry-text">###</div>'+"</div>"+'<div class="qui-sitemap-entry-children"></div>',events:{contextmenu:function(event){if(self.getMap()){self.getMap().childContextMenu(self,event)}self.fireEvent("contextMenu",[self,event])}}});this.$Opener=this.$Elm.getElement(".qui-sitemap-entry-opener");this.$Icons=this.$Elm.getElement(".qui-sitemap-entry-icon");this.$Text=this.$Elm.getElement(".qui-sitemap-entry-text");this.$Children=this.$Elm.getElement(".qui-sitemap-entry-children");this.$Container=this.$Elm.getElement(".qui-sitemap-entry-container");this.$Opener.addEvents({click:this.toggle});this.$Text.addEvents({click:this.click});this.$Children.setStyle("display","none");if(this.getAttribute("icon")){this.addIcon(this.getAttribute("icon"))}if(this.getAttribute("text")){this.$Text.set("html",this.getAttribute("text"))}len=this.$items.length;if(len||this.hasChildren()){this.$setOpener();for(i=0;i<len;i++){this.$items[i].inject(this.$Children)}}return this.$Elm},getTextElm:function(){if(this.$Text){return this.$Text}return null},addIcon:function(icon_url){if(!this.$Icons){this.getElm()}var Img=this.$Icons.getElement('[src="'+icon_url+'"]');if(Img){return this}if(Utils.isFontAwesomeClass(icon_url)){new Element("i",{"class":"qui-sitemap-entry-icon-itm "+icon_url}).inject(this.$Icons)}else{new Element("img",{src:icon_url,"class":"qui-sitemap-entry-icon-itm"}).inject(this.$Icons)}return this},removeIcon:function(icon_url){if(!this.$Icons){return this}var Img=this.$Icons.getElement('[src="'+icon_url+'"]');if(Img){Img.destroy()}return this},activate:function(){this.removeIcon(QUI.config("dir")+"controls/sitemap/images/inactive.png");return this},deactivate:function(){this.addIcon(QUI.config("dir")+"controls/sitemap/images/inactive.png");return this},appendChild:function(Child){this.$items.push(Child);this.$setOpener();if(this.$Children){Child.inject(this.$Children);var size=this.$Children.getSize();if(size.x){var child_size=10+Child.$Opener.getSize().x+Child.$Icons.getSize().x+Child.$Text.getSize().x;if(child_size>size.x){this.$Children.setStyle("width",child_size)}}}Child.setParent(this);Child.setMap(this.getMap());Child.addEvents({onDestroy:this.$onChildDestroy});this.getMap().fireEvent("appendChild",[this,Child]);return this},firstChild:function(){return this.$items[0]||false},hasChildren:function(){if(this.getAttribute("hasChildren")){return true}return this.$items.length?true:false},getChildren:function(){return this.$items},clearChildren:function(){var i,len;var items=this.$items;for(i=0,len=items.length;i<len;i++){if(items[i]){items[i].destroy()}}this.$Children.set("html","");this.$items=[];return this},countChildren:function(){return this.$items.length},$removeChild:function(Child){var items=[];for(var i=0,len=this.$items.length;i<len;i++){if(this.$items[i].getId()!==Child.getId()){items.push(this.$items[i])}}this.$items=items;this.setAttribute("hasChildren",this.$items.length?true:false);this.$setOpener();return this},select:function(event){this.fireEvent("select",[this,event]);if(this.$Container){this.$Container.addClass("qui-sitemap-entry-select")}return this},deselect:function(){this.fireEvent("deSelect",[this]);if(this.$Container){this.$Container.removeClass("qui-sitemap-entry-select")}return this},normalize:function(){if(this.$Container){this.$Container.removeClass("qui-sitemap-entry-select");this.$Container.removeClass("qui-sitemap-entry-holdBack")}if(this.$Opener){this.$Opener.removeClass("qui-sitemap-entry-holdBack")}return this},holdBack:function(){if(this.$Container){this.$Container.addClass("qui-sitemap-entry-holdBack")}if(this.$Opener){this.$Opener.addClass("qui-sitemap-entry-holdBack")}},click:function(event){this.select(event);this.fireEvent("click",[this,event])},open:function(){if(!this.$Children){return this}this.$Children.setStyle("display","");this.$setOpener();this.fireEvent("open",[this]);return this},close:function(){if(!this.$Children){return this}this.$Children.setStyle("display","none");this.$setOpener();this.fireEvent("close",[this]);return this},toggle:function(){if(this.isOpen()){this.close()}else{this.open()}return this},isOpen:function(){if(!this.$Children){return false}return this.$Children.getStyle("display")=="none"?false:true},getContextMenu:function(){if(this.$ContextMenu){return this.$ContextMenu}var cm_name=this.getAttribute("name")||this.getId();this.$ContextMenu=new QUI_ContextMenu({name:cm_name+"-contextmenu",events:{onShow:function(Menu){Menu.focus()},onBlur:function(Menu){Menu.hide()}}});this.$ContextMenu.inject(document.body);this.$ContextMenu.hide();return this.$ContextMenu},getMap:function(){return this.$Map},setMap:function(Map){this.$Map=Map;return this},$setOpener:function(){if(!this.$Elm){return}if(this.hasChildren()===false){this.$Opener.removeClass("qui-sitemap-entry-opener-open");this.$Opener.removeClass("qui-sitemap-entry-opener-close");return}if(this.isOpen()){this.$Opener.removeClass("qui-sitemap-entry-opener-open");this.$Opener.addClass("qui-sitemap-entry-opener-close")}else{this.$Opener.addClass("qui-sitemap-entry-opener-open");this.$Opener.removeClass("qui-sitemap-entry-opener-close")}},$onSetAttribute:function(key,value){if(!this.$Elm){return}if(key=="icon"){this.$Icons.setStyle("background-image","url("+value+")");return}if(key=="text"){this.$Text.set("html",value);var w=this.$Text.getSize().x.toInt();if(this.$Opener){w=w+this.$Opener.getSize().x.toInt()}if(this.$Icons){w=w+this.$Icons.getSize().x.toInt()}this.$Elm.setStyle("width",w);return}if(key=="value"){this.$Elm.set("data-value",value);return}},$onChildDestroy:function(Item){this.$removeChild(Item)}})});
//# sourceMappingURL=/var/www/git/quiqqer/qui/build/qui/controls/sitemap/Item.map.js