define("qui/controls/breadcrumb/Item",["qui/controls/Control","css!qui/controls/breadcrumb/Item.css"],function(Control){"use strict";return new Class({Extends:Control,Type:"qui/controls/breadcrumb/Item",options:{text:"",icon:false},initialize:function(options){this.parent(options)},create:function(){var self=this,icon=this.getAttribute("icon");this.$Elm=new Element("div",{"class":"qui-breadcrumb-item box smooth",html:'<span class="qui-breadcrumb-item-text">'+this.getAttribute("text")+"</span>",alt:this.getAttribute("text"),title:this.getAttribute("text"),"data-quiid":this.getId(),events:{click:function(event){self.fireEvent("click",[self,event])}}});if(icon){var Icon=this.$Elm.getElement(".qui-breadcrumb-item-icon");if(!Icon){Icon=new Element("span",{"class":"qui-breadcrumb-item-icon"}).inject(this.$Elm,"top")}if(icon.match(/icon-/)&&!icon.match(/\./)){Icon.addClass(icon)}else{Icon.setStyles({backgroundImage:"url("+this.getAttribute("icon")+")",paddingLeft:20})}}return this.$Elm}})});
//# sourceMappingURL=/var/www/git/quiqqer/qui/build/qui/controls/breadcrumb/Item.map.js