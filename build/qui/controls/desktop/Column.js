define("qui/controls/desktop/Column",["qui/QUI","qui/controls/Control","qui/controls/contextmenu/Menu","qui/controls/contextmenu/Item","qui/controls/desktop/Panel","qui/controls/loader/Loader","qui/classes/utils/DragDrop","css!qui/controls/desktop/Column.css"],function(QUI,Control,Contextmenu,ContextmenuItem,Panel,Loader,QuiDragDrop){"use strict";return new Class({Extends:Control,Type:"qui/controls/desktop/Column",Binds:["$onDestroy","$onContextMenu","$onPanelOpen","$onPanelMinimize","$onPanelDestroy","$clickAddPanelToColumn","$onEnterRemovePanel","$onLeaveRemovePanel","$onClickRemovePanel","$onDragDropStart","$onDragDropStop","$onDrag","$onDrop"],options:{name:"column",width:false,height:false,resizeLimit:[],sortable:true,closable:false,placement:"left"},initialize:function(options){this.parent(options);this.$ContextMenu=null;this.$Elm=null;this.$Content=null;this.$panels={};this.addEvents({onDestroy:this.$onDestroy,onDrop:this.$onDrop})},$onDestroy:function(){if(this.$ContextMenu){this.$ContextMenu.destroy()}if(this.$Content){this.$Content.destroy()}if(this.$Elm){this.$Elm.destroy()}},create:function(){this.$Elm=new Element("div",{"class":"qui-column box qui-panel-drop","data-quiid":this.getId()});if(this.getAttribute("height")){this.$Elm.setStyle("height",this.getAttribute("height"))}if(this.getAttribute("width")){this.$Elm.setStyle("width",this.getAttribute("width"))}this.$Content=new Element("div",{"class":"qui-column-content box"}).inject(this.$Elm);this.$ContextMenu=new Contextmenu({events:{onBlur:function(Menu){Menu.hide()}}}).inject(document.body);this.$ContextMenu.hide();this.$Elm.addEvents({contextmenu:this.$onContextMenu});if(typeof this.$serialize!=="undefined"){this.unserialize(this.$serialize)}this.fireEvent("create",[this]);return this.$Elm},serialize:function(){var panels=this.getChildren(),children=[];for(var p in panels){children.push(panels[p].serialize())}return{attributes:this.getAttributes(),children:children}},unserialize:function(data){this.setAttribute(data.attributes);if(!this.$Elm){this.$serialize=data;return this}var i,len,child_type,child_modul;var children=data.children,self=this;if(!children){return}var req=["MessageHandler"];for(i=0,len=children.length;i<len;i++){child_type=children[i].type;child_modul=child_type.replace("QUI.","").replace(/\./g,"/");req.push(child_modul)}require(req,function(MessageHandler){var i,len,attr,height,Child,Control;for(i=0,len=children.length;i<len;i++){Child=children[i];attr=Child.attributes;height=attr.height;try{Control=eval("new "+Child.type+"( attr )");Control.unserialize(Child);self.appendChild(Control)}catch(Exception){MH.addException(Exception)}}})},appendChild:function(Panel,pos){var Prev;var Handler=false,height=false,colheight=this.$Elm.getSize().y,Parent=Panel.getParent(),old_panel_is_me=false;if(typeOf(Parent)=="qui/controls/desktop/Column"){Parent.dependChild(Panel);if(Parent==this){old_panel_is_me=true}}Panel.setParent(this);if(this.count()){Handler=new Element("div",{"class":"qui-column-hor-handle"});this.$addHorResize(Handler);Panel.setAttribute("_Handler",Handler)}var handlelist=this.getElm().getElements(".qui-column-hor-handle");if(typeof pos!=="undefined"&&old_panel_is_me&&pos.toInt()!==0){pos=pos-1}if(typeof pos==="undefined"||handlelist.length<pos.toInt()){if(Handler){Handler.inject(this.$Content)}Panel.inject(this.$Content)}else if(pos.toInt()===0||!handlelist.length){Handler.inject(this.$Content,"top");Panel.inject(this.$Content,"top")}else if(typeof handlelist[pos-1]!=="undefined"){Handler.inject(handlelist[pos-1],"after");Panel.inject(handlelist[pos-1],"after")}if(!Panel.getAttribute("height")||!this.count()){Panel.setAttribute("height",this.$Elm.getSize().y-2)}if(this.getAttribute("sortable")){Panel.setAttribute("dragable",true)}else{Panel.setAttribute("dragable",false)}if(this.count()){height=Panel.getAttribute("height");Prev=this.getPreviousPanel(Panel);if(!Prev){Prev=this.getNextPanel(Panel)}if(!Prev){Prev=this.$panels[0]}if(height>colheight||height.toString().match("%")){height=colheight/2}var max=Prev.getAttribute("height"),prev_height=max-height;if(prev_height<100){prev_height=100;height=max-100}if(Handler){height=height-Handler.getSize().y}Panel.setAttribute("height",height);Prev.setAttribute("height",prev_height);Prev.resize()}Panel.resize();Panel.addEvents({onMinimize:this.$onPanelMinimize,onOpen:this.$onPanelOpen,onDestroy:this.$onPanelDestroy,onDragDropStart:this.$onDragDropStart,onDragDropComplete:this.$onDragDropStop,onDrag:this.$onDrag});this.$panels[Panel.getId()]=Panel;return this},dependChild:function(Panel){if(this.$panels[Panel.getId()]){delete this.$panels[Panel.getId()]}Panel.removeEvents({onMinimize:this.$onPanelMinimize,onOpen:this.$onPanelOpen,onDestroy:this.$onPanelDestroy});var Handler=false,Parent=Panel.getParent();Handler=Panel.getAttribute("_Handler");if(Parent){Panel.getParent().$onPanelDestroy(Panel)}return this},getChildren:function(){return this.$panels},count:function(){var c,i=0;for(c in this.$panels){i++}return i},resize:function(){if(!this.isOpen()){return this}var width=this.getAttribute("width");if(!width){return this}if(this.$Elm.getSize().x==this.getAttribute("width")){return this}this.$Elm.setStyle("width",width);var i,Panel;for(i in this.$panels){Panel=this.$panels[i];Panel.setAttribute("width",width);Panel.resize()}return this},open:function(){this.$Content.setStyle("display",null);var Sibling=this.getSibling();Sibling.setAttribute("width",Sibling.getAttribute("width")-this.getAttribute("width")+6);Sibling.resize();this.resize();return this},close:function(){if(this.getAttribute("closable")===false){return this}var content_width=this.$Content.getSize().x,Sibling=this.getSibling();this.$Content.setStyle("display","none");Sibling.setAttribute("width",Sibling.getAttribute("width")+content_width);Sibling.resize();return this},toggle:function(){if(this.isOpen()){this.close()}else{this.open()}return this},isOpen:function(){return this.$Content.getStyle("display")=="none"?false:true},highlight:function(){if(!this.getElm()){return this}new Element("div.qui-column-hightlight").inject(this.getElm());return this},normalize:function(){if(!this.getElm()){return this}this.getElm().getElements(".qui-column-hightlight").destroy();return this},getSibling:function(){var Column;if(this.getAttribute("placement")=="left"){Column=this.getElm().getNext(".qui-column")}else if(this.getAttribute("placement")=="right"){Column=this.getElm().getPrevious(".qui-column")}if(Column){return QUI.Controls.getById(Next.get("data-quiid"))}Column=this.getPrevious();if(Column){return Column}Column=this.getNext();if(Column){return Column}return false},getPrevious:function(){var Prev=this.getElm().getPrevious(".qui-column");if(!Prev){return false}return QUI.Controls.getById(Prev.get("data-quiid"))},getNext:function(){var Next=this.getElm().getNext(".qui-column");if(!Next){return false}return QUI.Controls.getById(Next.get("data-quiid"))},getNextPanel:function(Panel){var NextElm=Panel.getElm().getNext(".qui-panel");if(!NextElm){return false}var Next=QUI.Controls.getById(NextElm.get("data-quiid"));return Next?Next:false},getNextOpenedPanel:function(Panel){var list=Panel.getElm().getAllNext(".qui-panel");if(!list.length){return false}var i,len,Control;for(i=0,len=list.length;i<len;i++){Control=QUI.Controls.getById(list[i].get("data-quiid"));if(Control&&Control.isOpen()){return Control}}return false},getPreviousPanel:function(Panel){var PrevElm=Panel.getElm().getPrevious(".qui-panel");if(!PrevElm){return false}var Prev=QUI.Controls.getById(PrevElm.get("data-quiid"));return Prev?Prev:false},getPreviousOpenedPanel:function(Panel){var list=Panel.getElm().getAllPrevious(".qui-panel");if(!list.length){return false}var i,len,Control;for(i=0,len=list.length;i<len;i++){Control=QUI.Controls.getById(list[i].get("data-quiid"));if(Control&&Control.isOpen()){return Control}}return false},$onPanelMinimize:function(Panel){var Next=this.getNextOpenedPanel(Panel);Panel.setAttribute("columnCloseDirection","next");if(!Next){Next=this.getPreviousOpenedPanel(Panel);Panel.setAttribute("columnCloseDirection","prev")}if(!Next){this.close();return}var panel_height=Panel.getAttribute("height"),panel_title_height=Panel.getHeader().getSize().y,next_height=Next.getElm().getComputedSize().totalHeight;Next.setAttribute("height",next_height+panel_height-panel_title_height);Next.resize()},$onPanelOpen:function(Panel){var Prev=false,direction=Panel.getAttribute("columnCloseDirection");if(direction&&direction=="next"){Prev=this.getNextOpenedPanel(Panel)}if(direction&&direction=="prev"){Prev=this.getPreviousOpenedPanel(Panel)}if(!Prev){Prev=this.getPreviousOpenedPanel(Panel)}if(!Prev){Prev=this.getNextOpenedPanel(Panel)}if(!Prev){return}var panel_height=Panel.getElm().getComputedSize().totalHeight,panel_title_height=Panel.getHeader().getSize().y,prev_height=Prev.getElm().getComputedSize().totalHeight;Prev.setAttribute("height",prev_height-(panel_height-panel_title_height));Prev.resize();var elm_size=this.$Content.getSize().y,elm_scroll=this.$Content.getScrollSize().y;if(elm_size>=elm_scroll){return}var len=Object.getLength(this.$panels),height=Math.ceil(elm_size/len);for(var quiid in this.$panels){Panel=this.$panels[quiid];if(!Panel.isOpen()){continue}Panel.setAttribute("height",height);Panel.resize()}var i;var childheight=0,children=this.$Content.getChildren();for(i=0,len=children.length;i<len;i++){childheight=childheight+children[i].getSize().y}Panel.setAttribute("height",Panel.getAttribute("height")-(childheight-elm_size))},$onPanelDestroy:function(Panel){var height,Next,Prev,Sibling;var pid=Panel.getId(),Elm=Panel.getElm();if(this.$panels[pid]){delete this.$panels[pid]}var Handler=Panel.getAttribute("_Handler");if(!Handler&&!Elm.getPrevious()&&Elm.getNext()){Handler=Elm.getNext();Next=Handler.getNext();if(Next&&Next.get("data-quiid")){Sibling=QUI.Controls.getById(Next.get("data-quiid"));height=Handler.getSize().y+Sibling.getAttribute("height")+Panel.getAttribute("height");Sibling.setAttribute("height",height);Sibling.setAttribute("_Handler",false);Sibling.resize()}Handler.destroy();return}if(!Handler&&!Elm.getNext()&&Elm.getPrevious()){Handler=Elm.getPrevious();Prev=Handler.getPrevious();if(Prev&&Prev.get("data-quiid")){Sibling=QUI.Controls.getById(Prev.get("data-quiid"));height=Handler.getSize().y+Sibling.getAttribute("height")+Panel.getAttribute("height");Sibling.setAttribute("height",height);Sibling.setAttribute("_Handler",false);Sibling.resize()}Handler.destroy();return}if(!Handler||!Handler.hasClass("qui-column-hor-handle")){return}Prev=Handler.getPrevious();if(Prev&&Prev.get("data-quiid")){Sibling=QUI.Controls.getById(Prev.get("data-quiid"));height=Handler.getSize().y+Sibling.getAttribute("height")+Panel.getAttribute("height");Sibling.setAttribute("height",height);Sibling.resize()}Handler.destroy()},$addHorResize:function(Handle){var pos=Handle.getPosition();var DragDrop=new QuiDragDrop(Handle,{limit:{x:[pos.x,pos.x],y:[pos.y,pos.y]},events:{onStart:function(DragDrop,Dragable){if(!this.$Elm){return}var pos=this.$Elm.getPosition(),hpos=Handle.getPosition(),limit=DragDrop.getAttribute("limit");limit.y=[pos.y,pos.y+this.$Elm.getSize().y];limit.x=[hpos.x,hpos.x];DragDrop.setAttribute("limit",limit);Dragable.setStyles({height:5,padding:0,top:hpos.y,left:hpos.x})}.bind(this),onStop:this.$horResizeStop.bind(this)}});DragDrop.setAttribute("Control",this);DragDrop.setAttribute("Handle",Handle)},$horResizeStop:function(DragDrop,Dragable){var i,len,change;var Handle=DragDrop.getAttribute("Handle"),pos=Dragable.getPosition(),hpos=Handle.getPosition(),size=this.$Content.getSize(),children=this.$Content.getChildren();change=pos.y-hpos.y;var Next=Handle.getNext(),Prev=Handle.getPrevious(),PrevInstance=false,NextInstance=false;if(Next){NextInstance=QUI.Controls.getById(Next.get("data-quiid"))}if(Prev){PrevInstance=QUI.Controls.getById(Prev.get("data-quiid"))}if(NextInstance&&!NextInstance.isOpen()){var NextOpened=this.getNextOpenedPanel(NextInstance);if(!NextOpened){NextInstance.setAttribute("height",30);NextInstance.open()}else{NextInstance=NextOpened}}if(PrevInstance&&!PrevInstance.isOpen()){var PrevOpened=this.getPreviousOpenedPanel(PrevInstance);if(!PrevOpened){PrevInstance.setAttribute("height",30);PrevInstance.open()}else{PrevInstance=PrevOpened}}if(NextInstance){NextInstance.setAttribute("height",NextInstance.getAttribute("height")-change);NextInstance.resize()}if(!PrevInstance){return}PrevInstance.setAttribute("height",PrevInstance.getAttribute("height")+change);PrevInstance.resize();var children_height=0;for(i=0,len=children.length;i<len;i++){children_height=children_height+children[i].getSize().y}if(children_height==size.y){return}PrevInstance.setAttribute("height",PrevInstance.getAttribute("height")+(size.y-children_height));PrevInstance.resize()},$onContextMenu:function(event){if(!this.getParent()){return}event.stop();var i,len,Panel,AddPanels,RemovePanels;var Parent=this.getParent(),panels=Parent.getAvailablePanel();this.$ContextMenu.clearChildren();this.$ContextMenu.setTitle("Column");AddPanels=new ContextmenuItem({text:"Panel hinzufügen",name:"add_panels_to_column"});this.$ContextMenu.appendChild(AddPanels);for(i=0,len=panels.length;i<len;i++){AddPanels.appendChild(new ContextmenuItem({text:panels[i].text,icon:panels[i].icon,name:"add_panels_to_column",params:panels[i],events:{onMouseDown:this.$clickAddPanelToColumn}}))}RemovePanels=new ContextmenuItem({text:"Panel löschen",name:"remove_panel_of_column"});this.$ContextMenu.appendChild(RemovePanels);for(i in this.$panels){Panel=this.$panels[i];RemovePanels.appendChild(new ContextmenuItem({text:Panel.getAttribute("title"),icon:Panel.getAttribute("icon"),name:Panel.getAttribute("name"),Panel:Panel,events:{onActive:this.$onEnterRemovePanel,onNormal:this.$onLeaveRemovePanel,onMouseDown:this.$onClickRemovePanel}}))}this.$ContextMenu.setPosition(event.page.x,event.page.y).show().focus()},$clickAddPanelToColumn:function(ContextMenuItem){var Column=this,params=ContextMenuItem.getAttribute("params");if(!params.require){return}require([params.require],function(Panel){Column.appendChild(new Panel)})},$onEnterRemovePanel:function(Item){Item.getAttribute("Panel").highlight()},$onLeaveRemovePanel:function(Item){Item.getAttribute("Panel").normalize()},$onClickRemovePanel:function(Item){Item.getAttribute("Panel").destroy()},$onDragDropStart:function(DragDrop,DragElement,event){var i,y,len,closest,distance,Handler;this.$ddArrowPositions={};var Elm=this.getElm(),elmPos=Elm.getPosition(),list=Elm.getElements(".qui-column-hor-handle"),xPos=elmPos.x;this.$ddArrowPositions[elmPos.y]=new Element("div",{"class":"qui-column-drag-arrow icon-circle-arrow-left ",styles:{top:elmPos.y,left:xPos,display:"none"},"data-arrowno":0}).inject(document.body);for(i=0,len=list.length;i<len;i++){Handler=list[i];Handler.set("data-arrowid",String.uniqueID());y=Handler.getPosition().y;this.$ddArrowPositions[y]=new Element("div",{"class":"qui-column-drag-arrow icon-circle-arrow-left ",styles:{top:y-20,left:xPos,display:"none"},"data-arrowid":Handler.get("data-arrowid"),"data-arrowno":i+1}).inject(document.body)}this.$ddArrowPositions[elmPos.y+Elm.getSize().y]=new Element("div",{"class":"qui-column-drag-arrow icon-circle-arrow-left ",styles:{top:elmPos.y+Elm.getSize().y-20,left:xPos,display:"none"},"data-arrowno":i+1}).inject(document.body);y=event.page.y;closest=null;distance=false;for(i in this.$ddArrowPositions){distance=y-i;if(distance<0){distance=distance*-1}if(!closest||closest>distance){this.$ddArrow=this.$ddArrowPositions[i];closest=distance}}this.$ddArrow.setStyle("display",null)},$onDragDropStop:function(){var i,len,list;for(i in this.$ddArrowPositions){this.$ddArrowPositions[i].destroy()}this.$ddArrowPositions={};list=this.getElm().getElements(".qui-column-hor-handle");for(i=0,len=list.length;i<len;i++){list[i].set("data-arrowid",null)}},$onDrag:function(DragDrop,event){var y=event.page.y;if(this.$ddArrowPositions[y]){this.$ddArrow.setStyle("display","none");this.$ddArrowPositions[y].setStyle("display",null);this.$ddArrow=this.$ddArrowPositions[y]}},$onDrop:function(Control){if(!this.$ddArrow){this.appendChild(Control);return}this.appendChild(Control,this.$ddArrow.get("data-arrowno"))}})});
//# sourceMappingURL=/var/www/git/quiqqer/qui/build/qui/controls/desktop/Column.map.js