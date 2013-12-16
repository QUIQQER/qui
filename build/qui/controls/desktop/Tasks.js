define("qui/controls/desktop/Tasks",["qui/QUI","qui/controls/Control","qui/controls/loader/Loader","qui/controls/taskbar/Bar","qui/controls/taskbar/Task","css!qui/controls/desktop/Tasks.css"],function(QUI,Control,Loader,Taskbar,TaskbarTask){"use strict";return new Class({Extends:Control,Type:"qui/controls/desktop/Tasks",Binds:["$activateTask","$destroyTask","$normalizeTask","$onTaskbarAppendChild"],options:{name:"taskpanel",icon:"icon-tasks",header:true,title:"Tasks"},initialize:function(options){this.parent(options);this.Loader=new Loader;this.$Elm=null;this.$Taskbar=null;this.$TaskButton=null;this.$Active=null;this.$LastTask=null},isOpen:function(){return true},serialize:function(){return{attributes:this.getAttributes(),type:this.getType(),bar:this.$Taskbar.serialize()}},unserialize:function(data){this.setAttributes(data.attributes);if(!this.$Elm){this.$serialize=data;return this}if(data.bar){this.$Taskbar.unserialize(data.bar)}},refresh:function(){this.fireEvent("refresh",[this]);return this},resize:function(){var height=this.getAttribute("height");if(!height){height="100%"}this.$Elm.setStyles({height:height});var TaskbarElm=this.$Taskbar.getElm(),taskbar_size=TaskbarElm.getSize(),content_size=this.$Elm.getSize();this.$Container.setStyles({height:content_size.y-taskbar_size.y});if(this.$Active&&this.$Active.getInstance()){this.$Active.getInstance().setAttributes({height:content_size.y-taskbar_size.y});this.$Active.getInstance().resize()}this.fireEvent("resize",[this]);return this},create:function(){if(this.$Elm){return this.$Elm}this.$Elm=new Element("div",{"data-quiid":this.getId(),"class":"qui-taskpanel qui-panel",styles:{height:"100%"}});this.$Container=new Element("div.qui-taskpanel-container").inject(this.$Elm);this.$Taskbar=new Taskbar({name:"qui-taskbar-"+this.getId(),type:"bottom",styles:{bottom:0,left:0,position:"absolute"},events:{onAppendChildBegin:this.$onTaskbarAppendChild}}).inject(this.$Elm);this.$Taskbar.setParent(this);if(typeof this.$serialize!=="undefined"){this.unserialize(this.$serialize)}return this.$Elm},highlight:function(){if(this.getElm()){this.getElm().addClass("qui-panel-highlight")}return this},normalize:function(){if(this.getElm()){this.getElm().removeClass("qui-panel-highlight")}return this},appendChild:function(Instance){this.$Taskbar.appendChild(this.instanceToTask(Instance));return this},appendTask:function(Task){this.$Taskbar.appendChild(Task);return this},$activateTask:function(Task){if(typeof Task==="undefined"){return}if(this.$Active&&this.$Active.getType()!="QUI.controls.taskbar.Group"){var _Tmp=this.$Active;this.$Active=Task;this.$normalizeTask(_Tmp);if(this.$LastTask!=Task&&this.$LastTask!=_Tmp){this.$LastTask=_Tmp}}this.$Active=Task;if(!Task.getInstance()){return}var Instance=Task.getInstance(),Elm=Instance.getElm();Elm.setStyle("display",null);moofx(Elm).animate({left:0},{callback:function(time){this.resize();this.fireEvent("show",[this])}.bind(Instance)})},$destroyTask:function(Task){if(!Task.getInstance()){return}var Instance=Task.getInstance(),Elm=Instance.getElm();moofx(Elm).animate({left:(this.$Container.getSize().x+10)*-1},{callback:function(Elm){!function(){Instance.destroy()}.delay(100);if(this.$LastTask&&this.$LastTask.getId()!=Task.getId()&&this.$LastTask.getInstance()){this.$LastTask.click();return}var LastTask=this.lastChild();if(LastTask.getInstance()&&LastTask.getInstance().getId()!=Instance.getId()){LastTask.click();return}var FirstTask=this.firstChild();if(FirstTask.getInstance()&&FirstTask.getInstance().getId()!=Instance.getId()){FirstTask.click();return}}.bind(this,Elm)})},$normalizeTask:function(Task){if(Task==this.$Active){return}if(!Task.getInstance()){return}var Instance=Task.getInstance(),Elm=Instance.getElm();moofx(Elm).animate({left:(this.$Container.getSize().x+10)*-1},{callback:function(Elm){Elm.setStyle("display","none")}.bind(this,Elm)})},firstChild:function(){return this.$Taskbar.firstChild()},lastChild:function(){return this.$Taskbar.lastChild()},getTaskbar:function(){return this.$Taskbar},instanceToTask:function(Instance){var closeable=false,dragable=false;if(Instance.existAttribute("closeable")===false||Instance.existAttribute("closeable")&&Instance.getAttribute("closeable")){closeable=true}if(Instance.existAttribute("dragable")===false||Instance.existAttribute("dragable")&&Instance.getAttribute("dragable")){dragable=true}var Task=Instance.getAttribute("Task");if(!Task){Task=new TaskbarTask(Instance)}else{Task.setInstance(Instance)}Task.setAttributes({closeable:closeable,dragable:dragable});return Task},$onTaskbarAppendChild:function(Bar,Task){if(Task.getType()==="qui/controls/taskbar/Group"){Task.addEvent("onAppendChild",this.$onTaskbarAppendChild);var tasks=Task.getTasks();for(var i=0,len=tasks.length;i<len;i++){this.$onTaskbarAppendChild(Bar,tasks[i])}return}var Instance=Task.getInstance(),Taskbar=Task.getTaskbar(),TaskParent=Task.getParent(),IParent=false;if(!Instance){return}if(Task.getTaskbar()){IParent=Task.getTaskbar().getParent()}if(IParent&&IParent.getType()=="qui/controls/desktop/Tasks"){IParent.$removeTask(Task)}Instance.setAttribute("height",this.$Container.getSize().y);Instance.setAttribute("collapsible",false);Instance.inject(this.$Container);Instance.setParent(this);Instance.getElm().setStyles({position:"absolute",top:0,left:(this.$Container.getSize().x+10)*-1});Instance.__destroy=Instance.destroy;Instance.destroy=this.$onInstanceDestroy.bind(this,Instance);Task.removeEvent("onDestroy",Task.$onDestroy);if(Taskbar){Task.removeEvent("refresh",Taskbar.$onTaskRefresh);Task.removeEvent("destroy",Taskbar.$onTaskDestroy);Task.removeEvent("click",Taskbar.$onTaskClick)}Task.addEvents({onActivate:this.$activateTask,onDestroy:this.$destroyTask});if(!TaskParent||TaskParent&&TaskParent.getType()!=="qui/controls/taskbar/Group"){!function(){Task.click()}.delay(100,[this])}},$removeTask:function(Task){if(this.$LastTask&&this.$LastTask.getId()==Task.getId()){this.$LastTask=null}Task.removeEvents({onActivate:this.$activateTask,onDestroy:this.$destroyTask});if(Task.isActive()){this.$Active=null;if(this.$LastTask){this.$LastTask.click()}else{this.lastChild().click()}}this.getTaskbar().removeChild(Task)},$onInstanceDestroy:function(Instance){Instance.__destroy();var Task=Instance.getAttribute("Task");if(Task&&Task.getElm()){Task.destroy()}}})});
//# sourceMappingURL=/var/www/git/quiqqer/qui/build/qui/controls/desktop/Tasks.map.js