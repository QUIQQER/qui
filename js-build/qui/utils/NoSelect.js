define("qui/utils/NoSelect",[],function(){"use strict";return{enable:function(e){return"undefined"==typeof e.setProperty&&(e=document.id(e)),e.removeClass("qui-utils-noselect"),Browser.ie?void document.removeEvent("selectstart",this.stopSelection):(e.removeProperty("unselectable","on"),e.removeProperty("unSelectable","on"),void e.setStyles({MozUserSelect:"",KhtmlUserSelect:""}))},disable:function(e){return"undefined"==typeof e.setProperty&&(e=document.id(e)),e.addClass("qui-utils-noselect"),Browser.ie?void document.addEvent("selectstart",this.stopSelection):(e.setProperty("unselectable","on"),e.setProperty("unSelectable","on"),void e.setStyles({MozUserSelect:"none",KhtmlUserSelect:"none"}))},stopSelection:function(e){return e.stop(),!1}}});
//# sourceMappingURL=NoSelect.js.map