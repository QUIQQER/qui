define("qui/controls/elements/Help",["qui/QUI","qui/controls/Control","css!qui/controls/elements/Help.css"],function(t,e){"use strict";return new Class({Extends:e,Type:"qui/controls/elements/Help",Binds:["$onInject"],options:{text:"",link:!1,nowrap:!0},initialize:function(t){this.parent(t),this.addEvents({onInject:this.$onInject})},create:function(){var t=this.getAttribute("text"),e='<span class="fa fa-question-circle icon-question-sign"></span>';return this.$Elm=new Element("div",{"class":"qui-elements-help",html:'<div class="qui-elements-help-cell">'+e+t+"</div>"}),this.getAttribute("nowrap")&&(t=t.replace("<p>","").replace("</p>",""),this.$Elm.addClass("qui-elements-help-nowrap"),this.$Elm.setStyles({cursor:"pointer",display:"table",tableLayout:"fixed",width:"100%"}),this.$Elm.addEvent("click",function(){this.getAttribute("link")&&window.open(this.getAttribute("link")),this.fireEvent("click",[this])}.bind(this)),this.$Elm.set("html",'<div class="qui-elements-help-cell">'+e+t+"</div>"),this.$Elm.getElements("br").destroy(),this.$Elm.set("title",this.$Elm.getElement(".qui-elements-help-cell").get("text"))),this.$Elm},$onInject:function(){this.getAttribute("nowrap")&&function(){this.getElm().getSize()}.delay(200,this)}})});
//# sourceMappingURL=Help.js.map